import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CATALOG, COMPOSITION_NS, PLUGIN_SCHEMA_URL, ROOT } from "./lib.mjs";
import {
  boardSkills, buildBoard, freshness, gitEnv, installGuides, navGroups, recordHistory, renderBoard, shortDescription, showAuthorsFrom, skillDates,
} from "./board.mjs";
import { collect, discussionMarker } from "./board-collect.mjs";

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** skill 2 つ (片方はプラグインに入っていない) と plugin 1 つのカタログ。 */
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "board-"));
  write(path.join(root, "skills/hello/SKILL.md"), "---\nname: hello\ndescription: あいさつする。丁寧に。\n---\n");
  write(path.join(root, "skills/solo/SKILL.md"), "---\nname: solo\ndescription: 単体の <Skill>\n---\n");
  write(path.join(root, "plugins/hello-pack/plugin.json"), JSON.stringify({
    $schema: PLUGIN_SCHEMA_URL, name: "hello-pack", description: "d", version: "1.0.0",
    author: { name: "alice", url: "https://github.com/alice" },
    extensions: { [COMPOSITION_NS]: { skills: ["./skills/hello/"] } },
  }));
  return root;
}

const stats = {
  generatedAt: "2026-11-14T00:00:00Z",
  skills: {
    hello: {
      url: "https://github.com/x/y/discussions/1", number: 1, up: 5, commentCount: 1,
      comments: [{ url: "https://github.com/x/y/discussions/1#c1", body: "助かった <script>", createdAt: "2026-11-13T01:00:00Z", author: "bob" }],
    },
  },
};

test("Skill の説明・同梱プラグイン・作成者を正本から読む", () => {
  assert.deepEqual(boardSkills(fixture()), [
    {
      name: "hello", description: "あいさつする。丁寧に。", plugins: ["hello-pack"], versions: { "hello-pack": "1.0.0" },
      authors: [{ name: "alice", url: "https://github.com/alice" }], published: null, updated: null,
    },
    { name: "solo", description: "単体の <Skill>", plugins: [], versions: {}, authors: [], published: null, updated: null },
  ]);
});

test("公開日と最終更新日は main に入った commit の日付から取る", () => {
  const root = fixture();
  const run = (args, date) => execFileSync("git", ["-C", root, ...args], {
    env: { ...gitEnv(), GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@example.com", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@example.com" },
    stdio: "ignore",
  });
  run(["init", "-q", "-b", "main"], "2026-01-01T00:00:00Z");
  run(["add", "."], "2026-01-01T00:00:00Z");
  run(["commit", "-qm", "a"], "2026-01-01T00:00:00Z");
  fs.appendFileSync(path.join(root, "skills/hello/SKILL.md"), "x\n");
  run(["commit", "-qam", "b"], "2026-03-01T00:00:00Z");
  // git の版によって UTC の書き方 (Z / +00:00) が違うので、時刻として比べる
  const ms = ({ published, updated }) => ({ published: Date.parse(published), updated: Date.parse(updated) });
  assert.deepEqual(ms(skillDates(root, "hello")), { published: Date.parse("2026-01-01T00:00:00Z"), updated: Date.parse("2026-03-01T00:00:00Z") });
  assert.deepEqual(ms(skillDates(root, "solo")), { published: Date.parse("2026-01-01T00:00:00Z"), updated: Date.parse("2026-01-01T00:00:00Z") });
  assert.deepEqual(skillDates(root, "none"), { published: null, updated: null });
  assert.deepEqual(skillDates(fixture(), "hello"), { published: null, updated: null }, "git の履歴が無ければ日付を出さない");
});

test("New は公開から 14 日以内、Updated はそれより前に公開して 14 日以内に更新したもの", () => {
  const now = new Date("2026-11-14T00:00:00Z");
  assert.equal(freshness({ published: "2026-11-01T00:00:00Z", updated: "2026-11-10T00:00:00Z" }, now), "new");
  assert.equal(freshness({ published: "2026-10-01T00:00:00Z", updated: "2026-11-10T00:00:00Z" }, now), "updated");
  assert.equal(freshness({ published: "2026-10-01T00:00:00Z", updated: "2026-10-20T00:00:00Z" }, now), null);
  assert.equal(freshness({ published: null, updated: null }, now), null);
});

test("このリポジトリの Skill はすべてボードに載る", () => {
  const names = boardSkills().map((s) => s.name);
  const dirs = fs.readdirSync(path.join(ROOT, "skills")).sort();
  assert.deepEqual(names, dirs);
});

test("インストールのコマンドは README.md の記載と一致する", () => {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  const guides = installGuides({ name: "<skill-name>", plugins: ["<plugin-name>"] });
  for (const line of guides.flatMap((g) => g.blocks.flatMap((b) => b.lines))) {
    assert.ok(readme.includes(line), `README.md に "${line}" がありません`);
  }
});

test("履歴は 1 日 1 件で、古い記録は捨てる", () => {
  let history = recordHistory(null, { skills: { hello: { up: 1, commentCount: 0 } } }, "2026-08-01");
  history = recordHistory(history, { skills: { hello: { up: 2, commentCount: 0 } } }, "2026-11-13");
  history = recordHistory(history, { skills: { hello: { up: 3, commentCount: 1 } } }, "2026-11-14");
  history = recordHistory(history, { skills: { hello: { up: 4, commentCount: 1 } } }, "2026-11-14");
  assert.deepEqual(history, { version: 1, days: { "2026-11-13": { hello: { up: 2, cm: 0 } }, "2026-11-14": { hello: { up: 4, cm: 1 } } } });
});

test("表の説明は最初の 1 文にして、長ければ切る", () => {
  assert.equal(shortDescription("あいさつする。丁寧に。"), "あいさつする。");
  assert.equal(shortDescription("Use this. More."), "Use this.");
  assert.equal(shortDescription("あ".repeat(100), 10), "あああああああああ…");
});

test("一覧と Skill ごとのページを生成する", () => {
  const files = renderBoard({ skills: boardSkills(fixture()), stats });
  assert.deepEqual(Object.keys(files).sort(), ["board.js", "index.html", "skills/hello/index.html", "skills/solo/index.html", "style.css"]);

  const index = files["index.html"];
  assert.match(index, /<title>copilot-tips<\/title>/);
  const table = index.slice(index.indexOf("<table>"));
  assert.ok(table.indexOf('href="skills/hello/"') < table.indexOf('href="skills/solo/"'), "👍 の多い順に並ぶ");
  assert.match(index, /href="https:\/\/github\.com\/x\/y\/discussions\/1">いいねを送る</);
  assert.match(index, /href="https:\/\/github\.com\/x\/y\/discussions\/1">感想を書く</);
  assert.match(index, /2026-11-14 09:00 更新/);

  const hello = files["skills/hello/index.html"];
  assert.match(hello, /copilot plugin install hello-pack@copilot-tips/);
  assert.match(hello, /apm install fukuda-yuki\/copilot-tips\/skills\/hello/);
  assert.match(hello, /助かった &lt;script&gt;/);
  assert.match(hello, /bob　<a/);
  assert.match(hello, /作成者<\/dt><dd><a href="https:\/\/github.com\/alice">alice/);
  assert.match(hello, /<h3>VS Code<\/h3>/);
  assert.match(hello, /role="tablist"/);
  assert.match(hello, /href="https:\/\/github.com\/x\/y\/discussions\/1">いいねを送る <span>5</);
  assert.match(hello, /href="\.\.\/\.\.\/skills\/hello\/" aria-current="page"/);

  const solo = files["skills/solo/index.html"];
  assert.match(solo, /単体の &lt;Skill&gt;/);
  assert.doesNotMatch(solo, /id="voices"/, "スレッドが無ければ感想の節を出さない");
  assert.doesNotMatch(solo, /copilot plugin install|VS Code|role="tablist"/);
});

test("一覧に New / Updated と更新日を出し、詳細に公開日・最終更新日・version を出す", () => {
  const dated = boardSkills(fixture(), (name) => (name === "hello"
    ? { published: "2026-09-01T00:00:00Z", updated: "2026-11-10T00:00:00Z" }
    : { published: "2026-11-12T00:00:00Z", updated: "2026-11-12T00:00:00Z" }));
  const files = renderBoard({ skills: dated, stats });
  const index = files["index.html"];
  assert.match(index, /href="skills\/hello\/">hello<\/a><span class="tag updated">Updated</);
  assert.match(index, /href="skills\/solo\/">solo<\/a><span class="tag new">New</);
  assert.match(index, /<tr data-updated="2026-11-10T00:00:00Z">/);
  assert.match(index, /<td class="date">2026-11-10<\/td>/);
  assert.match(index, /data-sort="updated"/);

  const hello = files["skills/hello/index.html"];
  assert.match(hello, /公開日<\/dt><dd>2026-09-01</);
  assert.match(hello, /最終更新日<\/dt><dd>2026-11-10</);
  assert.match(hello, /hello-pack<\/a> <span class="mono">v1\.0\.0</);

  const undated = renderBoard({ skills: boardSkills(fixture()), stats })["skills/hello/index.html"];
  assert.doesNotMatch(undated, /公開日|class="tag/);
});

test("左の一覧はプラグインごとにまとめ、プラグインに入っていない Skill は最後に置く", () => {
  const rows = [{ name: "b", plugins: ["p2", "p1"] }, { name: "a", plugins: ["p1"] }, { name: "z", plugins: [] }];
  assert.deepEqual(navGroups(rows), [
    { title: "p1", skills: ["a", "b"] },
    { title: "p2", skills: ["b"] },
    { title: "Skill 単体", skills: ["z"] },
  ]);
});

test("ボードは外部のスクリプトを読み込まない", () => {
  const files = renderBoard({ skills: boardSkills(fixture()), stats });
  for (const [file, html] of Object.entries(files)) {
    assert.doesNotMatch(html, /<(script|iframe)[^>]+src="(https?:)?\/\//, file);
  }
});

test("作成者と感想を書いた人の名前は変数で伏せられる", () => {
  assert.equal(showAuthorsFrom(undefined), true);
  assert.equal(showAuthorsFrom("true"), true);
  assert.equal(showAuthorsFrom("false"), false);
  const files = renderBoard({ skills: boardSkills(fixture()), stats, showAuthors: false });
  for (const html of Object.values(files)) {
    assert.doesNotMatch(html, /alice|bob/);
  }
});

test("集計データが無くてもページを作れる (dist/board に出力)", () => {
  const root = fixture();
  const { outDir } = buildBoard({ root, now: new Date("2026-11-14T00:00:00Z") });
  assert.equal(outDir, path.join(root, "dist", "board"));
  assert.match(fs.readFileSync(path.join(outDir, "skills/solo/index.html"), "utf8"), /2026-11-14 09:00 更新/);
});

// --- 集計 ---

function fakeGitHub({ discussions = [], enabled = true } = {}) {
  const calls = [];
  let next = 100;
  const node = (n, skill, up, comments = [], by = "bot") => ({
    id: `D${n}`, number: n, title: `t${n}`, url: `https://github.com/x/y/discussions/${n}`,
    viewerDidAuthor: by === "bot", authorAssociation: by === "owner" ? "OWNER" : "NONE",
    body: skill ? `${discussionMarker(skill)}\n本文` : "関係ないスレッド",
    reactions: { totalCount: up },
    comments: { totalCount: comments.length, nodes: comments },
  });
  const all = discussions.map((d) => node(d.number, d.skill, d.up, d.comments, d.by));
  const graphql = async (query, variables) => {
    calls.push({ query, variables });
    if (query.includes("createDiscussion")) {
      const d = node(next++, /skill: ([a-z0-9-]+)/.exec(variables.body)[1], 0);
      all.push(d);
      return { createDiscussion: { discussion: d } };
    }
    if (query.includes("discussionCategories")) {
      return { repository: { id: "R1", hasDiscussionsEnabled: enabled, discussionCategories: { nodes: [{ id: "C1", name: "General" }] } } };
    }
    // 1 件ずつページを分けて、ページ送りも確かめる
    const start = variables.cursor ? Number(variables.cursor) : 0;
    const hasNextPage = start + 1 < all.length;
    return { repository: { discussions: { pageInfo: { hasNextPage, endCursor: String(start + 1) }, nodes: all.slice(start, start + 1) } } };
  };
  return { graphql, calls };
}

test("感想スレッドの 👍 と感想を集計し、非表示のコメントは数えない", async () => {
  const { graphql } = fakeGitHub({
    discussions: [
      { number: 1, skill: null, up: 99 },
      { number: 2, skill: "hello", up: 3, comments: [
        { url: "u1", bodyText: "よい", createdAt: "2026-11-13T00:00:00Z", isMinimized: false, author: { login: "bob" } },
        { url: "u2", bodyText: "spam", createdAt: "2026-11-13T00:00:00Z", isMinimized: true, author: null },
      ] },
      { number: 3, skill: "hello", up: 50 },
    ],
  });
  const result = await collect({
    skills: [{ name: "hello" }], graphql, owner: "x", name: "y", now: new Date("2026-11-14T00:00:00Z"),
  });
  assert.deepEqual(result, {
    generatedAt: "2026-11-14T00:00:00.000Z",
    skills: {
      hello: {
        url: "https://github.com/x/y/discussions/2", number: 2, up: 3, commentCount: 1,
        comments: [{ url: "u1", body: "よい", createdAt: "2026-11-13T00:00:00Z", author: "bob" }],
      },
    },
  });
});

test("感想スレッドの無い Skill にはスレッドを自動で作る", async () => {
  const { graphql, calls } = fakeGitHub({ discussions: [{ number: 2, skill: "hello", up: 1 }] });
  const result = await collect({ skills: [{ name: "hello" }, { name: "new-skill" }], graphql, owner: "x", name: "y" });
  const created = calls.filter((c) => c.query.includes("createDiscussion"));
  assert.equal(created.length, 1);
  assert.equal(created[0].variables.categoryId, "C1");
  assert.match(created[0].variables.title, /new-skill/);
  assert.ok(created[0].variables.body.startsWith(discussionMarker("new-skill")));
  assert.equal(result.skills["new-skill"].up, 0);
  assert.equal(result.skills.hello.up, 1);
});

test("目印があっても、workflow とメンテナー以外が立てたスレッドは採用しない", async () => {
  const { graphql, calls } = fakeGitHub({
    discussions: [
      { number: 1, skill: "hello", up: 99, by: "stranger" },
      { number: 2, skill: "solo", up: 7, by: "owner" },
    ],
  });
  const result = await collect({ skills: [{ name: "hello" }, { name: "solo" }], graphql, owner: "x", name: "y" });
  assert.equal(calls.filter((c) => c.query.includes("createDiscussion")).length, 1);
  assert.notEqual(result.skills.hello.number, 1);
  assert.equal(result.skills.hello.up, 0);
  assert.equal(result.skills.solo.number, 2);
});

test("Discussions が無効、またはカテゴリが無ければ分かるように失敗する", async () => {
  await assert.rejects(
    collect({ skills: [{ name: "hello" }], graphql: fakeGitHub({ enabled: false }).graphql, owner: "x", name: "y" }),
    /Discussions が有効になっていません/,
  );
  await assert.rejects(
    collect({ skills: [{ name: "hello" }], graphql: fakeGitHub().graphql, owner: "x", name: "y", category: "Skill" }),
    /カテゴリ "Skill" がありません/,
  );
});

test("ボードの公開先はカタログ設定から決まり、README.md の案内と一致する", () => {
  const [owner, name] = CATALOG.repo.split("/");
  assert.equal(CATALOG.boardUrl, `https://${owner}.github.io/${name}/`);
  assert.ok(fs.readFileSync(path.join(ROOT, "README.md"), "utf8").includes(`](${CATALOG.boardUrl})`));
});
