#!/usr/bin/env node
// Skill 評判ボード (GitHub Pages) の静的ページを生成する。外部依存なし。
//  - Skill の一覧・説明・同梱プラグイン・作成者は skills/ と plugins/ から読む (新しい Skill は自動で載る)
//  - 👍 と感想は board-collect.mjs が集計した stats.json、推移は history.json から読む
//  - 出力は dist/board/ (正本には書かない)
//
// 使い方: node eng/board.mjs [--stats <stats.json>] [--history <history.json>] [--out <dir>]
//   stats / history を省略すると、数字が 0 のページを作る (見た目の確認用)。
//   環境変数 BOARD_SHOW_AUTHORS=false で、Skill の作成者と感想を書いた人の名前を伏せる。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, CATALOG, loadCatalog, readFrontmatter } from "./lib.mjs";
import { readPlugins } from "./generate.mjs";

const TIME_ZONE = "Asia/Tokyo";
const WEEKS = 8;
const BLOCKS = "▁▂▃▄▅▆▇█";

// ---------------------------------------------------------------------------
// データ
// ---------------------------------------------------------------------------

/** ボードに載せる Skill の一覧。説明は SKILL.md、同梱先と作成者は plugin.json から読む。 */
export function boardSkills(root = ROOT) {
  const catalog = loadCatalog(root);
  const plugins = readPlugins(catalog);
  return catalog.skills.map((skill) => {
    const inPlugins = plugins.filter((p) => p.skills.includes(skill.name));
    const authors = [];
    for (const p of inPlugins) {
      const author = p.manifest.author;
      if (author?.name && !authors.some((a) => a.name === author.name)) authors.push({ name: author.name, url: author.url });
    }
    return {
      name: skill.name,
      description: readFrontmatter(skill.file)?.description ?? "",
      plugins: inPlugins.map((p) => p.name),
      authors,
    };
  });
}

/**
 * インストール方法。README.md の「インストール」と同じコマンドを、プラグイン名・Skill 名を埋めて返す。
 * README との一致は board.test.mjs が確認している。
 */
export function installGuides(skill) {
  const { repo, name: catalog, distBranch } = CATALOG;
  const guides = [];
  for (const plugin of skill.plugins) {
    guides.push(
      { tool: "GitHub Copilot CLI", plugin, lines: [`copilot plugin marketplace add ${repo}`, `copilot plugin install ${plugin}@${catalog}`] },
      { tool: "Claude Code", plugin, lines: [`/plugin marketplace add ${repo}`, `/plugin install ${plugin}@${catalog}`] },
      { tool: "APM", plugin, lines: [`apm install ${repo}/plugins/${plugin}#${distBranch}`] },
    );
  }
  guides.push({ tool: "APM (この Skill だけ)", lines: [`apm install ${repo}/skills/${skill.name}`] });
  return guides;
}

/** 日付 (Asia/Tokyo) を YYYY-MM-DD で返す。 */
export function dayOf(date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function shiftDay(day, days) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 集計結果をその日の値として履歴に記録する (同じ日に何度実行しても 1 件)。古い記録は捨てる。 */
export function recordHistory(history, stats, day, keepDays = 7 * (WEEKS + 2)) {
  const days = { ...(history?.days ?? {}) };
  days[day] = Object.fromEntries(Object.entries(stats.skills).map(([name, s]) => [name, { up: s.up, cm: s.commentCount }]));
  const oldest = shiftDay(day, -keepDays);
  for (const d of Object.keys(days)) if (d < oldest) delete days[d];
  return { version: 1, days: Object.fromEntries(Object.entries(days).sort(([a], [b]) => a.localeCompare(b))) };
}

/**
 * 直近 8 週の、週ごとの 👍 の増加 (古い週から順)。
 * リアクションには日時が無いので、日ごとの記録の差分で求める。
 * 週の始まりの記録が無いとき (動かし始めた週など) は、その Skill の最初の記録を始点にする。
 * 最初の記録より前の週の増加は 0 とする。
 */
export function weeklyGains(history, name, day) {
  const recorded = Object.keys(history?.days ?? {}).sort().filter((d) => history.days[d][name]);
  const valueAt = (d) => {
    let value = null;
    for (const r of recorded) {
      if (r > d) break;
      value = history.days[r][name].up;
    }
    return value;
  };
  const first = recorded.length > 0 ? history.days[recorded[0]][name].up : null;
  const gains = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const end = valueAt(shiftDay(day, -7 * i));
    const start = valueAt(shiftDay(day, -7 * (i + 1))) ?? first;
    gains.push(end === null ? 0 : end - start);
  }
  return gains;
}

export function sparkline(values) {
  const max = Math.max(...values, 1);
  return values.map((v) => BLOCKS[Math.round(Math.max(v, 0) / max * 7)]).join("");
}

/** Skill の行に必要な数字をまとめる。集計がまだの Skill は 0 として扱う。 */
export function boardRows(skills, stats, history, day) {
  return skills.map((skill) => {
    const s = stats?.skills?.[skill.name];
    const weeks = weeklyGains(history, skill.name, day);
    return {
      ...skill,
      up: s?.up ?? 0,
      commentCount: s?.commentCount ?? 0,
      comments: s?.comments ?? [],
      url: s?.url ?? null,
      weeks,
      week: weeks[weeks.length - 1],
    };
  }).sort((a, b) => b.up - a.up || b.week - a.week || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** 表に載せる短い説明 (最初の 1 文、長ければ切る)。全文は詳細ページに出す。 */
export function shortDescription(text, max = 80) {
  const first = /^[\s\S]*?(?:。|\.\s|$)/.exec(text.trim())[0].trim();
  return first.length > max ? first.slice(0, max - 1) + "…" : first;
}

function formatTime(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

export const STYLE = `/* 表が主役の簡素な文書。カード・タイル・グラフ・Web フォント・飾りの色は使わない。色はリンクの青だけ。 */
:root {
  --bg: #ffffff; --ink: #1b1b1b; --muted: #6a6a6a; --line: #d9d9d9; --link: #0a53b0;
  --text: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Yu Gothic", Meiryo, system-ui, sans-serif;
  --mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #161616; --ink: #e4e4e4; --muted: #9a9a9a; --line: #3a3a3a; --link: #8ab8f5; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #161616; --ink: #e4e4e4; --muted: #9a9a9a; --line: #3a3a3a; --link: #8ab8f5; color-scheme: dark }

* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--text); font-size: 15px; line-height: 1.75;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 32px 64px; }
main { max-width: 760px; margin: 0 auto; }
h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; line-height: 1.4; overflow-wrap: anywhere; }
h2 { font-size: 15px; font-weight: 700; margin: 40px 0 8px; }
h3 { font-size: 14px; font-weight: 700; margin: 20px 0 4px; }
p { margin: 0 0 10px; max-width: 40em; }
.muted { color: var(--muted); }
.small { font-size: 13px; }
.mono { font-family: var(--mono); }
a, .linkish { color: var(--link); text-decoration: underline; text-underline-offset: 3px; }
.linkish { font: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
:focus-visible { outline: 2px solid var(--link); outline-offset: 2px; }

.scroll { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 9px 10px 9px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
thead th { font-size: 13px; font-weight: 400; color: var(--muted); border-bottom: 1px solid var(--ink); white-space: nowrap; }
thead button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
thead button[aria-pressed="true"] { color: var(--ink); font-weight: 700; }
td.n, th.n { text-align: right; white-space: nowrap; padding-right: 18px; }
td.rank { color: var(--muted); width: 2em; }
td.up { font-weight: 700; }
.skill { font-family: var(--mono); font-size: 15px; overflow-wrap: anywhere; }
.sub { font-size: 13px; color: var(--muted); display: block; }
.trend { font-family: var(--mono); letter-spacing: 1px; color: var(--muted); white-space: nowrap; }

dl { margin: 0; display: grid; grid-template-columns: max-content minmax(0, 1fr); }
dt, dd { margin: 0; padding: 9px 0; border-bottom: 1px solid var(--line); }
dt { font-size: 13px; color: var(--muted); white-space: nowrap; padding-right: 18px; }
dd { overflow-wrap: anywhere; }
.voice { white-space: pre-line; }

pre { font-family: var(--mono); font-size: 13px; line-height: 1.6; margin: 0; padding: 8px 0; overflow-x: auto; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.install-head { display: flex; gap: 12px; align-items: baseline; justify-content: space-between; margin-top: 16px; }
.install-head h3 { margin: 0; }

@media (max-width: 560px) {
  .trend, th.t { display: none; }
  dl { grid-template-columns: minmax(0, 1fr); }
  dt { border-bottom: 0; padding-bottom: 0; }
  dd { padding-top: 2px; }
}
`;

// 並べ替え (index) とコマンドのコピー (詳細ページ)。JS が無くても内容は読める。
const SCRIPT = `document.querySelectorAll("thead button[data-k]").forEach((b) => b.addEventListener("click", () => {
  const tbody = document.getElementById("rank");
  const k = b.dataset.k;
  const rows = [...tbody.rows].sort((x, y) => y.dataset[k] - x.dataset[k] || y.dataset.up - x.dataset.up || x.dataset.name.localeCompare(y.dataset.name));
  rows.forEach((r, i) => { r.cells[0].textContent = String(i + 1); });
  tbody.replaceChildren(...rows);
  document.querySelectorAll("thead button[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
}));
document.querySelectorAll("button[data-copy]").forEach((b) => b.addEventListener("click", async () => {
  const text = document.getElementById(b.dataset.copy).textContent;
  try { await navigator.clipboard.writeText(text); b.textContent = "コピーしました"; }
  catch { b.textContent = "コピーできませんでした"; }
  setTimeout(() => { b.textContent = "コピー"; }, 2000);
}));
`;

function page({ title, base, body }) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}style.css">
</head>
<body>
<main>
${body}
</main>
<script src="${base}board.js"></script>
</body>
</html>
`;
}

const ABOUT = `<h2>この数字について</h2>
<p>👍 と感想は、Skill ごとに 1 つある GitHub の感想スレッドから 1 日 1 回集計しています。</p>
<p>これは人気投票で、利用回数ではありません。Copilot CLI や Claude Code は、Skill が何回使われたかを作者に知らせないので、利用回数は載せていません。</p>`;

function authorText(row, showAuthors) {
  if (!showAuthors || row.authors.length === 0) return "";
  return `作成: ${row.authors.map((a) => esc(a.name)).join("、")}。`;
}

export function renderIndex(rows, { generatedAt, showAuthors }) {
  const { repo } = CATALOG;
  const totalUp = rows.reduce((a, r) => a + r.up, 0);
  const totalCm = rows.reduce((a, r) => a + r.commentCount, 0);
  const body = rows.map((r, i) => {
    const plugins = r.plugins.length > 0 ? `${r.plugins.map(esc).join("、")} プラグイン。` : "";
    const voice = r.url ? ` <a href="${esc(r.url)}">👍・感想</a>` : "";
    return `      <tr data-name="${esc(r.name)}" data-up="${r.up}" data-wk="${r.week}" data-cm="${r.commentCount}">
        <td class="rank">${i + 1}</td>
        <td><a class="skill" href="skills/${esc(r.name)}/">${esc(r.name)}</a><span class="sub">${esc(shortDescription(r.description))} ${plugins}${authorText(r, showAuthors)} <a href="skills/${esc(r.name)}/#install">入れ方</a>${voice}</span></td>
        <td class="n up">${r.up}</td>
        <td class="n">${signed(r.week)}</td>
        <td class="n">${r.commentCount}</td>
        <td class="trend" aria-label="8 週の 👍 の増加: ${r.weeks.join(", ")}">${sparkline(r.weeks)}</td>
      </tr>`;
  }).join("\n");

  return page({
    title: "Skill 評判ボード",
    base: "",
    body: `<h1>Skill 評判ボード</h1>
<p class="muted"><a class="mono" href="https://github.com/${repo}">${repo}</a> の Skill に付いた 👍 と感想の集計。${esc(formatTime(generatedAt))} 更新。</p>

<h2>ランキング</h2>
<div class="scroll">
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Skill</th>
        <th class="n"><button type="button" data-k="up" aria-pressed="true">👍</button></th>
        <th class="n"><button type="button" data-k="wk" aria-pressed="false">今週</button></th>
        <th class="n"><button type="button" data-k="cm" aria-pressed="false">感想</button></th>
        <th class="t">8 週の推移</th>
      </tr>
    </thead>
    <tbody id="rank">
${body}
    </tbody>
  </table>
</div>
<p class="muted small">見出しの 👍・今週・感想を押すと並べ替わります。Skill 名を押すと、説明・入れ方・感想の一覧が見られます。合計は 👍 ${totalUp}、感想 ${totalCm} 件。</p>

<h2>👍 と感想の送り方</h2>
<p>Skill 名を押して詳細ページを開き、「感想を書く」から GitHub の感想スレッドへ進みます。スレッドの最初の投稿に 👍 を付けると票になり、コメントが感想として載ります。GitHub のアカウントが必要です。</p>

${ABOUT}`,
  });
}

export function renderSkill(row, { generatedAt, showAuthors }) {
  const { repo, sourceBranch } = CATALOG;
  const facts = [
    ["👍", String(row.up)],
    ["今週の増加", signed(row.week)],
    ["感想", `${row.commentCount} 件`],
    ["プラグイン", row.plugins.length > 0
      ? row.plugins.map((p) => `<a class="mono" href="https://github.com/${repo}/tree/${sourceBranch}/plugins/${esc(p)}">${esc(p)}</a>`).join("、")
      : "どのプラグインにも入っていません"],
  ];
  if (showAuthors && row.authors.length > 0) {
    facts.push(["作成者", row.authors.map((a) => (a.url ? `<a href="${esc(a.url)}">${esc(a.name)}</a>` : esc(a.name))).join("、")]);
  }
  facts.push(["ソース", `<a class="mono" href="https://github.com/${repo}/tree/${sourceBranch}/skills/${esc(row.name)}">skills/${esc(row.name)}</a>`]);

  const install = installGuides(row).map((g, i) => `<div class="install-head"><h3>${esc(g.tool)}${g.plugin ? ` <span class="muted small">(${esc(g.plugin)} プラグイン)</span>` : ""}</h3><button class="linkish small" type="button" data-copy="cmd-${i}">コピー</button></div>
<pre id="cmd-${i}">${g.lines.map(esc).join("\n")}</pre>`).join("\n");

  const comments = [...row.comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const voices = comments.length > 0
    ? `<dl>
${comments.map((c) => `  <dt>${esc(dayOf(new Date(c.createdAt)))}${showAuthors && c.author ? `<br>${esc(c.author)}` : ""}</dt>
  <dd><span class="voice">${esc(c.body)}</span> <a class="small" href="${esc(c.url)}">GitHub で見る</a></dd>`).join("\n")}
</dl>`
    : `<p class="muted">まだ感想はありません。</p>`;
  const write = row.url
    ? `<p><a href="${esc(row.url)}">感想を書く・👍 を付ける</a> (GitHub の感想スレッドが開きます)</p>`
    : `<p class="muted">感想スレッドは次の集計で作られます。</p>`;

  return page({
    title: `${row.name} - Skill 評判ボード`,
    base: "../../",
    body: `<p class="small"><a href="../../">Skill 評判ボード</a></p>
<h1 class="mono">${esc(row.name)}</h1>
<p>${esc(row.description)}</p>
<dl>
${facts.map(([k, v]) => `  <dt>${k}</dt><dd>${v}</dd>`).join("\n")}
</dl>

<h2 id="install">入れ方</h2>
<p>使っているツールのコマンドを実行します。VS Code では、<code class="mono">settings.json</code> の <code class="mono">chat.plugins.marketplaces</code> に <code class="mono">"${repo}"</code> を追加し、拡張機能ビューで <code class="mono">@agentPlugins</code> を検索して${row.plugins.length > 0 ? ` <span class="mono">${row.plugins.map(esc).join("、")}</span> を` : ""}インストールします。</p>
${install}

<h2 id="voices">感想</h2>
${write}
${voices}

<p class="muted small" style="margin-top:40px">${esc(formatTime(generatedAt))} 更新。これは人気投票で、利用回数ではありません。</p>`,
  });
}

/** ボードのファイル一式を { 相対パス: 内容 } で返す。 */
export function renderBoard({ skills, stats, history, now = new Date(), showAuthors = true }) {
  const generatedAt = stats?.generatedAt ? new Date(stats.generatedAt) : now;
  const rows = boardRows(skills, stats, history, dayOf(generatedAt));
  const files = {
    "index.html": renderIndex(rows, { generatedAt, showAuthors }),
    "style.css": STYLE,
    "board.js": SCRIPT,
    ".nojekyll": "",
  };
  for (const row of rows) files[`skills/${row.name}/index.html`] = renderSkill(row, { generatedAt, showAuthors });
  return files;
}

/** 環境変数 BOARD_SHOW_AUTHORS を読む。既定は表示。"false" / "0" / "no" で匿名。 */
export function showAuthorsFrom(value) {
  return !/^(false|0|no|off)$/i.test(String(value ?? "").trim());
}

const readJsonIfExists = (file) => (file && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null);

export function buildBoard({ root = ROOT, statsFile, historyFile, outDir = path.join(root, "dist", "board"), showAuthors = true, now } = {}) {
  const files = renderBoard({
    skills: boardSkills(root),
    stats: readJsonIfExists(statsFile),
    history: readJsonIfExists(historyFile),
    now,
    showAuthors,
  });
  fs.rmSync(outDir, { recursive: true, force: true });
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, "utf8");
  }
  return { outDir, files: Object.keys(files) };
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const m = /^--([a-z-]+)$/.exec(argv[i]);
    if (!m) throw new Error(`不明な引数です: ${argv[i]}`);
    args[m[1]] = argv[++i];
  }
  return args;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const { outDir, files } = buildBoard({
      statsFile: args.stats,
      historyFile: args.history,
      outDir: args.out ? path.resolve(args.out) : undefined,
      showAuthors: showAuthorsFrom(process.env.BOARD_SHOW_AUTHORS),
    });
    console.log(`Skill 評判ボードを生成しました: ${path.relative(ROOT, outDir)}/ (${files.length} ファイル)`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
