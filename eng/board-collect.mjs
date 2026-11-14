#!/usr/bin/env node
// Skill ごとの感想スレッド (GitHub Discussions) から 👍 と感想を集計する。外部依存なし。
//  - 感想スレッドの無い Skill には、スレッドを自動で作る (新しい Skill を公開すると自動で載る)
//  - Skill とスレッドの対応は、スレッド本文に埋め込んだ目印 (discussionMarker) で取る。
//    タイトルを書き換えたり、カテゴリを移したりしても対応は崩れない。
//    目印は誰でも書けるので、この workflow 自身かメンテナーが立てたスレッドだけを採用する
//
// 使い方 (GitHub Actions から実行する):
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/name \
//   node eng/board-collect.mjs --out <stats.json> --history <history.json> [--category <name>]
//   --history のファイルは、その日の値を追記して上書きする。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG } from "./lib.mjs";
import { boardSkills, dayOf, parseArgs, recordHistory } from "./board.mjs";

export const DEFAULT_CATEGORY = "General";
const MAX_COMMENTS = 100;

export const discussionMarker = (skill) => `<!-- ${CATALOG.name}-board skill: ${skill} -->`;
const MARKER_PATTERN = new RegExp(`<!-- ${CATALOG.name}-board skill: ([a-z0-9-]+) -->`);

export function discussionTitle(skill) {
  return `Skill の感想: ${skill}`;
}

export function discussionBody(skill) {
  const { repo, sourceBranch, boardUrl } = CATALOG;
  return `${discussionMarker(skill)}
[\`${skill}\`](https://github.com/${repo}/tree/${sourceBranch}/skills/${skill}) · [ボード](${boardUrl}skills/${skill}/)

役に立ったらこの投稿に 👍。感想・要望・不具合はコメントへ。
`;
}

const REPO_QUERY = `query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    id
    hasDiscussionsEnabled
    discussionCategories(first: 100) { nodes { id name } }
  }
}`;

/** 感想スレッドとして採用してよい立て主 (メンテナー)。このほか workflow 自身が立てたものも採用する。 */
const TRUSTED_ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

const DISCUSSION_FIELDS = `id number title url body viewerDidAuthor authorAssociation category { id }
  reactions(content: THUMBS_UP) { totalCount }
  comments(last: ${MAX_COMMENTS}) {
    totalCount
    nodes { url bodyText createdAt isMinimized author { login } }
  }`;

const DISCUSSIONS_QUERY = `query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    discussions(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { ${DISCUSSION_FIELDS} }
    }
  }
}`;

const CREATE_MUTATION = `mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
  createDiscussion(input: { repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body }) {
    discussion { ${DISCUSSION_FIELDS} }
  }
}`;

/** GitHub GraphQL API を呼ぶ関数を作る (Node.js 標準の fetch を使う)。 */
export function createGraphql(token, endpoint = process.env.GITHUB_GRAPHQL_URL || "https://api.github.com/graphql") {
  if (!token) throw new Error("GITHUB_TOKEN がありません。");
  return async (query, variables) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { authorization: `bearer ${token}`, "content-type": "application/json", "user-agent": `${CATALOG.name}-board` },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.errors) {
      throw new Error(`GitHub API の呼び出しに失敗しました (${res.status}): ${JSON.stringify(json.errors ?? json)}`);
    }
    return json.data;
  };
}

/** スレッド 1 つ分の集計。非表示 (minimize) にされたコメントは数えない。 */
export function summarize(discussion) {
  const visible = discussion.comments.nodes.filter((c) => !c.isMinimized);
  const hidden = discussion.comments.nodes.length - visible.length;
  return {
    url: discussion.url,
    number: discussion.number,
    categoryId: discussion.category?.id ?? null,
    up: discussion.reactions.totalCount,
    commentCount: discussion.comments.totalCount - hidden,
    comments: visible.map((c) => ({ url: c.url, body: c.bodyText, createdAt: c.createdAt, author: c.author?.login ?? null })),
  };
}

/**
 * 全 Skill の 👍 と感想を集計する。感想スレッドの無い Skill にはスレッドを作る。
 * graphql は (query, variables) => data。テストでは差し替える。
 */
export async function collect({ skills, graphql, owner, name, category = DEFAULT_CATEGORY, now = new Date(), log = () => {} }) {
  const repo = (await graphql(REPO_QUERY, { owner, name })).repository;
  if (!repo.hasDiscussionsEnabled) {
    throw new Error(`${owner}/${name} で Discussions が有効になっていません。リポジトリの Settings で有効にしてください。`);
  }

  // 既存のスレッドを、目印から Skill 名に対応づける (カテゴリは問わない)
  const bySkill = new Map();
  let cursor = null;
  do {
    const page = (await graphql(DISCUSSIONS_QUERY, { owner, name, cursor })).repository.discussions;
    for (const d of page.nodes) {
      if (!d.viewerDidAuthor && !TRUSTED_ASSOCIATIONS.has(d.authorAssociation)) continue;
      const skill = MARKER_PATTERN.exec(d.body ?? "")?.[1];
      // 同じ Skill のスレッドが複数あれば、番号の小さい (先に作られた) ほうを使う
      if (skill && (!bySkill.has(skill) || bySkill.get(skill).number > d.number)) bySkill.set(skill, d);
    }
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);

  const missing = skills.filter((s) => !bySkill.has(s.name));
  if (missing.length > 0) {
    const target = repo.discussionCategories.nodes.find((c) => c.name === category);
    if (!target) {
      const names = repo.discussionCategories.nodes.map((c) => c.name).join(", ");
      throw new Error(`Discussions のカテゴリ "${category}" がありません (あるもの: ${names})。変数 BOARD_CATEGORY を見直してください。`);
    }
    for (const skill of missing) {
      const data = await graphql(CREATE_MUTATION, {
        repositoryId: repo.id, categoryId: target.id, title: discussionTitle(skill.name), body: discussionBody(skill.name),
      });
      const d = data.createDiscussion.discussion;
      bySkill.set(skill.name, d);
      log(`感想スレッドを作りました: ${skill.name} (#${d.number})`);
    }
  }

  return {
    generatedAt: now.toISOString(),
    repoId: repo.id,
    skills: Object.fromEntries(skills.map((s) => [s.name, summarize(bySkill.get(s.name))])),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (!args.out || !args.history) throw new Error("--out と --history を指定してください。");
    const [owner, name] = (process.env.GITHUB_REPOSITORY || CATALOG.repo).split("/");
    const stats = await collect({
      skills: boardSkills(),
      graphql: createGraphql(process.env.GITHUB_TOKEN),
      owner,
      name,
      category: args.category || process.env.BOARD_CATEGORY || DEFAULT_CATEGORY,
      log: (m) => console.log(m),
    });
    const history = fs.existsSync(args.history) ? JSON.parse(fs.readFileSync(args.history, "utf8")) : null;
    for (const [file, value] of [[args.out, stats], [args.history, recordHistory(history, stats, dayOf(new Date(stats.generatedAt)))]]) {
      fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
    }
    const total = Object.values(stats.skills).reduce((a, s) => a + s.up, 0);
    console.log(`集計しました: Skill ${Object.keys(stats.skills).length} 件、👍 合計 ${total}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
