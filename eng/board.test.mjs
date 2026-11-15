import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CATALOG, COMPOSITION_NS, GIT_ENV, PLUGIN_SCHEMA_URL, ROOT } from "./lib.mjs";
import {
  DATA_FILE, FRESH_DAYS, askPhrases, boardSkills, bundledSummary, descriptionHash, orderPhrases, bundleCommands, buildBoard, freshness, installGuides, navGroups, recordHistory, renderBoard, shortDescription, showAuthorsFrom, skillDates,
} from "./board.mjs";
import { REQUEST_CATEGORY, collect, discussionMarker } from "./board-collect.mjs";

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
      id: "D_1", url: "https://github.com/x/y/discussions/1", number: 1, up: 5, commentCount: 1,
      comments: [{ url: "https://github.com/x/y/discussions/1#c1", body: "助かった <script>", createdAt: "2026-11-13T01:00:00Z", author: "bob" }],
    },
  },
};

test("Skill の説明・同梱プラグイン・作成者を正本から読む", () => {
  assert.deepEqual(boardSkills(fixture()), [
    {
      name: "hello", description: "あいさつする。丁寧に。", requires: "", bundled: "", plugins: ["hello-pack"], versions: { "hello-pack": "1.0.0" },
      authors: [{ name: "alice", url: "https://github.com/alice" }], published: null, updated: null,
    },
    { name: "solo", description: "単体の <Skill>", requires: "", bundled: "", plugins: [], versions: {}, authors: [], published: null, updated: null },
  ]);
});

test("公開日と最終更新日は main に入った commit の日付から取る", () => {
  const root = fixture();
  const run = (args, date) => execFileSync("git", ["-C", root, ...args], {
    env: { ...GIT_ENV, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@example.com", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@example.com" },
    stdio: "ignore",
  });
  run(["init", "-q", "-b", "main"], "2026-01-01T00:00:00Z");
  run(["add", "."], "2026-01-01T00:00:00Z");
  run(["commit", "-qm", "a"], "2026-01-01T00:00:00Z");
  fs.appendFileSync(path.join(root, "skills/hello/SKILL.md"), "x\n");
  run(["commit", "-qam", "b"], "2026-03-01T09:00:00+09:00");
  fs.appendFileSync(path.join(root, "skills/solo/SKILL.md"), "x\n");
  run(["commit", "-qam", "d"], "2026-03-01T05:00:00+00:00");
  assert.deepEqual(skillDates(root, "hello"), { published: "2026-01-01T00:00:00.000Z", updated: "2026-03-01T00:00:00.000Z" });
  assert.deepEqual(skillDates(root, "solo"), { published: "2026-01-01T00:00:00.000Z", updated: "2026-03-01T05:00:00.000Z" }, "時差の違う commit も UTC にそろえる");
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
  assert.deepEqual(Object.keys(files).sort(), ["board.js", "index.html", "skills.json", "skills/hello/index.html", "skills/solo/index.html", "style.css"]);

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
  assert.doesNotMatch(solo, /copilot plugin install|VS Code/);
  assert.match(solo, /npx skills add fukuda-yuki\/copilot-tips --skill solo/);
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

test("まとめて入れるコマンドは、同じプラグインを 1 回だけ入れ、1 つだけ選んだときは Skill のページと一致する", () => {
  const config = { repo: CATALOG.repo, catalog: CATALOG.name, distBranch: CATALOG.distBranch };
  const a = { name: "a", plugins: ["p"] }, b = { name: "b", plugins: ["p"] }, c = { name: "c", plugins: ["q"] }, solo = { name: "solo", plugins: [] };
  const lines = (selected) => Object.fromEntries(bundleCommands(config, selected).map((g) => [g.id, g.lines]));

  assert.deepEqual(bundleCommands(config, []), []);
  assert.deepEqual(lines([a, b, c, solo]), {
    copilot: ["copilot plugin marketplace add fukuda-yuki/copilot-tips", "copilot plugin install p@copilot-tips", "copilot plugin install q@copilot-tips"],
    vscode: ['"chat.plugins.marketplaces": ["fukuda-yuki/copilot-tips"]'],
    claude: ["/plugin marketplace add fukuda-yuki/copilot-tips", "/plugin install p@copilot-tips", "/plugin install q@copilot-tips"],
    apm: ["apm install fukuda-yuki/copilot-tips/plugins/p#marketplace", "apm install fukuda-yuki/copilot-tips/plugins/q#marketplace", "apm install fukuda-yuki/copilot-tips/skills/solo"],
    skills: ["npx skills add fukuda-yuki/copilot-tips --skill a --skill b --skill c --skill solo"],
  });
  assert.deepEqual(Object.keys(lines([solo])), ["apm", "skills"], "プラグインに入っていない Skill だけなら、プラグインの入れ方は出さない");

  for (const skill of [a, solo]) {
    const single = installGuides(skill);
    for (const g of bundleCommands(config, [skill])) {
      const page = single.find((x) => x.id === g.id);
      const first = page.blocks.filter((x) => !x.skillOnly || skill.plugins.length === 0).flatMap((x) => x.lines);
      assert.deepEqual(g.lines, first, g.id);
    }
  }
});

test("一覧で Skill を選べ、選ぶ欄は JavaScript が無ければ出さない", () => {
  const files = renderBoard({ skills: boardSkills(fixture()), stats });
  assert.match(files["index.html"], /<input type="checkbox" value="hello" data-plugins="hello-pack" aria-label="hello">/);
  assert.match(files["index.html"], /<section class="bundle" data-config="[^"]*" hidden>/);
  assert.match(files["style.css"], /\.pick \{ display: none;/);
  assert.doesNotThrow(() => new Function("document", "localStorage", "navigator", files["board.js"]), "board.js が構文として正しい");
});

test("エージェントが読む一覧に、数字・送り先・入れ方を出し、感想の本文は出さない", () => {
  const files = renderBoard({ skills: boardSkills(fixture()), stats });
  const data = JSON.parse(files[DATA_FILE]);
  assert.equal(data.generatedAt, "2026-11-14T00:00:00.000Z");
  assert.equal(data.requests, null);
  assert.deepEqual(data.skills.map((s) => s.name), ["hello", "solo"]);
  const [hello, solo] = data.skills;
  assert.deepEqual({ ...hello, install: undefined }, {
    name: "hello", description: "あいさつする。丁寧に。", ask: [], requires: null, page: `${CATALOG.boardUrl}skills/hello/`,
    plugins: [{ name: "hello-pack", version: "1.0.0" }], published: null, updated: null,
    likes: 5, comments: 1, thread: { id: "D_1", url: "https://github.com/x/y/discussions/1" }, install: undefined,
  });
  assert.deepEqual(hello.install.find((g) => g.tool === "Claude Code").commands, ["/plugin marketplace add fukuda-yuki/copilot-tips\n/plugin install hello-pack@copilot-tips"]);
  assert.doesNotMatch(hello.install.find((g) => g.tool === "VS Code").note, /</, "note にタグを残さない");
  assert.equal(solo.thread, null);
  assert.deepEqual(solo.install.map((g) => g.tool), ["APM", "npx skills"]);
  assert.doesNotMatch(files[DATA_FILE], /助かった|bob/, "他人が書いた文をエージェントに読ませない");
});

test("skill-board が読む URL と送り方は、ボードの出力と一致する", () => {
  const skill = fs.readFileSync(path.join(ROOT, "skills/skill-board/SKILL.md"), "utf8");
  assert.ok(skill.includes(`\n${CATALOG.boardUrl}${DATA_FILE}\n`));
  assert.ok(skill.includes(`https://github.com/${CATALOG.repo}`));
  const data = JSON.parse(renderBoard({ skills: boardSkills(fixture()), stats })[DATA_FILE]);
  const documented = [...skill.matchAll(/^\| ((?:`[a-z]+` ?)+) \|/gm)].flatMap((m) => m[1].match(/[a-z]+/g));
  assert.deepEqual(documented.sort(), Object.keys(data.skills[0]).sort(), "SKILL.md の項目の表と skills.json の項目");
  assert.match(skill, new RegExp(`${FRESH_DAYS} 日以内`));
});

/** 頼み方・必須環境・同梱物のある Skill を 1 つ足したカタログ。 */
function askFixture() {
  const root = fixture();
  write(path.join(root, "skills/ask/SKILL.md"), "---\nname: ask\ndescription: 設定を点検する。「診断して」「doctor」「軽くしたい」「a」「b」「c」「診断して」の依頼で使う。\ncompatibility: Python 3.10 以上\n---\n");
  write(path.join(root, "skills/ask/scripts/a.py"), "");
  write(path.join(root, "skills/ask/scripts/b.py"), "");
  write(path.join(root, "skills/ask/references/r.md"), "");
  write(path.join(root, "skills/ask/assets/i.png"), "");
  write(path.join(root, "skills/ask/LICENSE.txt"), "");
  return root;
}

test("頼み方は description の「」から抜き、一覧と Skill のページに出す", () => {
  assert.deepEqual(askPhrases("x「a」と「b」。「a」「」"), ["a", "b"]);
  assert.deepEqual(askPhrases("no phrases"), []);

  const files = renderBoard({ skills: boardSkills(askFixture()), stats });
  assert.match(files["index.html"], /<span class="ask">「診断して」 「doctor」<\/span>/);
  const page = files["skills/ask/index.html"];
  assert.match(page, /<p>設定を点検する。<\/p>\n<h2 id="ask">頼み方<\/h2>/, "description の全文の代わりに最初の 1 文を出す");
  assert.match(page, /<li><span id="ask-0">診断して<\/span><button class="copy" type="button" data-copy="ask-0">コピー<\/button><\/li>/);
  assert.match(page, /<summary>ほか 1 件<\/summary>\n<ul class="say">\n<li><span id="ask-5">c</, "6 つ目からは畳む");
  assert.doesNotMatch(files["skills/hello/index.html"], /id="ask"/, "頼み方が無ければ節を出さない");
  assert.match(files["skills/hello/index.html"], /<p>あいさつする。丁寧に。<\/p>/);
  assert.deepEqual(JSON.parse(files[DATA_FILE]).skills.find((s) => s.name === "ask").ask, ["診断して", "doctor", "軽くしたい", "a", "b", "c"]);
});

test("呼ばれると確かめた頼み方を先に並べ、description が変わったあとの結果は使わない", () => {
  const description = "「a」「b」「c」";
  const check = { hash: descriptionHash(description), phrases: { a: { fired: false }, c: { fired: true } } };
  assert.deepEqual(orderPhrases(["a", "b", "c"], description, check), ["c", "a", "b"]);
  assert.deepEqual(orderPhrases(["a", "b", "c"], description, { ...check, hash: "old" }), ["a", "b", "c"]);
  assert.deepEqual(orderPhrases(["a", "b", "c"], description, undefined), ["a", "b", "c"]);

  const skills = boardSkills(askFixture());
  const hash = descriptionHash(skills.find((s) => s.name === "ask").description);
  const files = renderBoard({ skills, stats, triggers: { skills: { ask: { hash, phrases: { doctor: { fired: true } } } } } });
  assert.match(files["skills/ask/index.html"], /<span id="ask-0">doctor</);
  assert.match(files["index.html"], /「doctor」 「診断して」/);
});

test("必須環境は SKILL.md の compatibility、同梱は Skill のフォルダの中身から出す", () => {
  const root = askFixture();
  assert.equal(bundledSummary(path.join(root, "skills/ask")), "Python スクリプト 2 本、資料 1 件");
  assert.equal(bundledSummary(path.join(root, "skills/hello")), "");
  const files = renderBoard({ skills: boardSkills(root), stats });
  assert.match(files["skills/ask/index.html"], /必須環境<\/dt><dd>Python 3\.10 以上<\/dd>/);
  assert.match(files["skills/ask/index.html"], /同梱<\/dt><dd>Python スクリプト 2 本、資料 1 件<\/dd>/);
  assert.doesNotMatch(files["skills/hello/index.html"], /必須環境|同梱</);
  assert.equal(JSON.parse(files[DATA_FILE]).skills.find((s) => s.name === "ask").requires, "Python 3.10 以上");
});

test("ほしい Skill は、投稿先を全ページの上に、要望を票の多い順で一覧に出す", () => {
  const requests = {
    url: "https://github.com/x/y/discussions/new?category=ideas", repositoryId: "R_1", categoryId: "DIC_1",
    items: [{ title: "PR の説明を書く <b>", url: "https://github.com/x/y/discussions/9", up: 3, createdAt: "2026-11-13T00:00:00Z" }],
  };
  const files = renderBoard({ skills: boardSkills(fixture()), stats: { ...stats, requests } });
  for (const file of ["index.html", "skills/hello/index.html"]) {
    assert.match(files[file], /<a href="https:\/\/github\.com\/x\/y\/discussions\/new\?category=ideas">ほしい Skill を投稿<\/a>/, file);
  }
  assert.match(files["index.html"], /<h2>ほしい Skill<\/h2>/);
  assert.match(files["index.html"], /<a href="https:\/\/github\.com\/x\/y\/discussions\/9">PR の説明を書く &lt;b&gt;<\/a><\/td><td class="n up">3</);
  assert.deepEqual(JSON.parse(files[DATA_FILE]).requests, { url: requests.url, repositoryId: "R_1", categoryId: "DIC_1" });
  assert.doesNotMatch(files[DATA_FILE], /PR の説明/, "他人が書いた題をエージェントに読ませない");

  const empty = renderBoard({ skills: boardSkills(fixture()), stats: { ...stats, requests: { ...requests, items: [] } } })["index.html"];
  assert.doesNotMatch(empty, /<h2>ほしい Skill<\/h2>/, "要望が無ければ一覧の節を出さない");
  assert.match(empty, />ほしい Skill を投稿</);
  assert.doesNotMatch(renderBoard({ skills: boardSkills(fixture()), stats })["index.html"], /ほしい Skill/, "受け付けていなければ出さない");
});

test("skill-board の要望の送り方と投稿フォームは、ボードの設定と一致する", () => {
  const skill = fs.readFileSync(path.join(ROOT, "skills/skill-board/SKILL.md"), "utf8");
  for (const key of ["requests.url", "requests.repositoryId", "requests.categoryId"]) assert.ok(skill.includes(key), key);
  const form = path.join(ROOT, ".github/DISCUSSION_TEMPLATE", `${REQUEST_CATEGORY.toLowerCase()}.yml`);
  assert.ok(fs.existsSync(form), "投稿フォームのファイル名は、カテゴリの slug と同じにする");
  for (const label of [...fs.readFileSync(form, "utf8").matchAll(/^\s+id: want[\s\S]*?label: (.+)$/gm)].map((m) => m[1])) {
    assert.ok(skill.includes(`### ${label}`), "チャットから送る本文の見出しを、フォームの欄の名前とそろえる");
  }
});

test("集計データが無くてもページを作れる (dist/board に出力)", () => {
  const root = fixture();
  const { outDir } = buildBoard({ root, now: new Date("2026-11-14T00:00:00Z") });
  assert.equal(outDir, path.join(root, "dist", "board"));
  assert.match(fs.readFileSync(path.join(outDir, "skills/solo/index.html"), "utf8"), /2026-11-14 09:00 更新/);
});

// --- 集計 ---

function fakeGitHub({ discussions = [], enabled = true, requests = null } = {}) {
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
      const nodes = [{ id: "C1", name: "General", slug: "general" }, ...(requests ? [{ id: "C2", name: REQUEST_CATEGORY, slug: "ideas" }] : [])];
      return { repository: { id: "R1", hasDiscussionsEnabled: enabled, discussionCategories: { nodes } } };
    }
    if (query.includes("upvoteCount")) {
      assert.equal(variables.categoryId, "C2");
      // 2 件ずつページを分けて、ページ送りも確かめる
      const start = variables.cursor ? Number(variables.cursor) : 0;
      return { repository: { discussions: { pageInfo: { hasNextPage: start + 2 < requests.length, endCursor: String(start + 2) }, nodes: requests.slice(start, start + 2) } } };
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
        id: "D2", url: "https://github.com/x/y/discussions/2", number: 2, up: 3, commentCount: 1,
        comments: [{ url: "u1", body: "よい", createdAt: "2026-11-13T00:00:00Z", author: "bob" }],
      },
    },
    requests: null,
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

test("ほしい Skill は開いている要望だけを票の多い順に集め、カテゴリが無ければ集めない", async () => {
  const q = (n, up, extra = {}) => ({ title: `ほしい Skill: t${n}`, url: `u${n}`, body: "b", closed: false, upvoteCount: up, createdAt: `2026-11-1${n}T00:00:00Z`, ...extra });
  const { graphql } = fakeGitHub({
    discussions: [{ number: 2, skill: "hello", up: 1 }],
    requests: [q(1, 2), q(2, 5), q(3, 9, { closed: true }), q(4, 9, { body: discussionMarker("hello") }), q(5, 2)],
  });
  const { requests } = await collect({ skills: [{ name: "hello" }], graphql, owner: "x", name: "y" });
  assert.deepEqual(requests, {
    url: "https://github.com/x/y/discussions/new?category=ideas", repositoryId: "R1", categoryId: "C2",
    items: [
      { title: "t2", url: "u2", up: 5, createdAt: "2026-11-12T00:00:00Z" },
      { title: "t5", url: "u5", up: 2, createdAt: "2026-11-15T00:00:00Z" },
      { title: "t1", url: "u1", up: 2, createdAt: "2026-11-11T00:00:00Z" },
    ],
  });
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
