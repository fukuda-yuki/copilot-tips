#!/usr/bin/env node
// Skill ボード (GitHub Pages) の静的ページを生成する。外部依存なし。
//  - Skill の一覧・説明・同梱プラグイン・作成者は skills/ と plugins/ から読む (新しい Skill は自動で載る)
//  - 公開日と最終更新日は skills/<name>/ の git の履歴から読む (浅い clone では読まない)
//  - 👍 と感想は board-collect.mjs が集計した stats.json から読む
//  - 出力は dist/board/ (正本には書かない)
//
// 使い方: node eng/board.mjs [--stats <stats.json>] [--out <dir>]
//   stats を省略すると、数字が 0 のページを作る (見た目の確認用)。
//   環境変数 BOARD_SHOW_AUTHORS=false で、Skill の作成者と感想を書いた人の名前を伏せる。
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, CATALOG, loadCatalog, readFrontmatter } from "./lib.mjs";
import { readPlugins } from "./generate.mjs";

const TIME_ZONE = "Asia/Tokyo";
/** 履歴 (history.json) を残す日数。 */
const KEEP_DAYS = 70;
/** 公開・更新から何日のあいだ New / Updated を付けるか。 */
export const FRESH_DAYS = 14;

// ---------------------------------------------------------------------------
// データ
// ---------------------------------------------------------------------------

const git = (root, args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

/**
 * Skill の公開日 (最初の commit) と最終更新日 (最後の commit) を ISO 形式で返す。
 * main に入った日を取るため、マージ commit をたどる (--first-parent)。
 * git が無い・浅い clone で履歴が欠けている場合は null (誤って全部を New にしないため)。
 */
export function skillDates(root, name) {
  try {
    if (git(root, ["rev-parse", "--is-shallow-repository"]) !== "false") return { published: null, updated: null };
    const lines = git(root, ["log", "--first-parent", "--format=%cI", "--", `skills/${name}`]).split("\n").filter(Boolean);
    return { published: lines.at(-1) ?? null, updated: lines[0] ?? null };
  } catch {
    return { published: null, updated: null };
  }
}

/** ボードに載せる Skill の一覧。説明は SKILL.md、同梱先と作成者は plugin.json、日付は git の履歴から読む。 */
export function boardSkills(root = ROOT, dates = (name) => skillDates(root, name)) {
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
      versions: Object.fromEntries(inPlugins.map((p) => [p.name, p.version])),
      authors,
      ...dates(skill.name),
    };
  });
}

/**
 * インストール方法をツールごとに返す。README.md の「インストール」と同じコマンドに、プラグイン名・Skill 名を埋める。
 * README との一致は board.test.mjs が確認している。
 */
export function installGuides(skill) {
  const { repo, name: catalog, distBranch } = CATALOG;
  const perPlugin = (lines) => skill.plugins.map((plugin) => ({ plugin, lines: lines(plugin) }));
  const guides = [];
  if (skill.plugins.length > 0) {
    guides.push(
      { id: "copilot", tool: "GitHub Copilot CLI", blocks: perPlugin((p) => [`copilot plugin marketplace add ${repo}`, `copilot plugin install ${p}@${catalog}`]) },
      {
        id: "vscode", tool: "VS Code", blocks: [{ lines: [`"chat.plugins.marketplaces": ["${repo}"]`] }],
        note: `拡張機能ビューで <code class="mono">@agentPlugins</code> を検索し、<span class="mono">${skill.plugins.join("、")}</span> を入れる。`,
      },
      { id: "claude", tool: "Claude Code", blocks: perPlugin((p) => [`/plugin marketplace add ${repo}`, `/plugin install ${p}@${catalog}`]) },
    );
  }
  guides.push({
    id: "apm", tool: "APM",
    blocks: [...perPlugin((p) => [`apm install ${repo}/plugins/${p}#${distBranch}`]), { skillOnly: true, lines: [`apm install ${repo}/skills/${skill.name}`] }],
  });
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

/** 公開から FRESH_DAYS 日以内なら "new"、それより前に公開して FRESH_DAYS 日以内に更新したなら "updated"。 */
export function freshness(row, now, days = FRESH_DAYS) {
  const since = shiftDay(dayOf(now), -days);
  const within = (iso) => Boolean(iso) && dayOf(new Date(iso)) > since;
  if (within(row.published)) return "new";
  if (within(row.updated)) return "updated";
  return null;
}

/** 集計結果をその日の値として履歴に記録する (同じ日に何度実行しても 1 件)。古い記録は捨てる。 */
export function recordHistory(history, stats, day, keepDays = KEEP_DAYS) {
  const days = { ...(history?.days ?? {}) };
  days[day] = Object.fromEntries(Object.entries(stats.skills).map(([name, s]) => [name, { up: s.up, cm: s.commentCount }]));
  const oldest = shiftDay(day, -keepDays);
  for (const d of Object.keys(days)) if (d < oldest) delete days[d];
  return { version: 1, days: Object.fromEntries(Object.entries(days).sort(([a], [b]) => a.localeCompare(b))) };
}

/** Skill の行に必要な数字をまとめる。集計がまだの Skill は 0 として扱う。👍 の多い順に並べる。 */
export function boardRows(skills, stats) {
  return skills.map((skill) => {
    const s = stats?.skills?.[skill.name];
    return {
      ...skill,
      up: s?.up ?? 0,
      commentCount: s?.commentCount ?? 0,
      comments: s?.comments ?? [],
      url: s?.url ?? null,
    };
  }).sort((a, b) => b.up - a.up || b.commentCount - a.commentCount || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** 表に載せる短い説明 (最初の 1 文、長ければ切る)。全文は Skill のページに出す。 */
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

const footer = (generatedAt) => `<p class="updated">${esc(formatTime(generatedAt))} 更新</p>`;

/** 左の一覧の見出しに使う、プラグインに入っていない Skill のまとまりの名前。 */
const SOLO = "Skill 単体";

/** 左の一覧。プラグインごとに Skill を並べる。プラグインに入っていない Skill は最後にまとめる。 */
export function navGroups(rows) {
  const byName = (a, b) => a.localeCompare(b);
  const plugins = [...new Set(rows.flatMap((r) => r.plugins))].sort(byName);
  const groups = plugins.map((plugin) => ({
    title: plugin,
    skills: rows.filter((r) => r.plugins.includes(plugin)).map((r) => r.name).sort(byName),
  }));
  const solo = rows.filter((r) => r.plugins.length === 0).map((r) => r.name).sort(byName);
  if (solo.length > 0) groups.push({ title: SOLO, skills: solo });
  return groups;
}

export const STYLE = `/* 表が主役の簡素な文書。カード・タイル・グラフ・Web フォント・飾りの色は使わない。色はリンクの青だけ (New / Updated の印も同じ青)。 */
:root {
  color-scheme: light dark;
  --bg: #ffffff; --ink: #1a1a1a; --sub: #4d4d4d; --muted: #626264; --line: #949494; --link: #0017c1; --code: #f2f2f2;
  --text: "Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Yu Gothic", Meiryo, system-ui, sans-serif;
  --mono: "Noto Sans Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;
}
@supports (color: light-dark(#ffffff, #000000)) {
  :root {
    --bg: light-dark(#ffffff, #1a1a1a);
    --ink: light-dark(#1a1a1a, #f2f2f2);
    --sub: light-dark(#4d4d4d, #cccccc);
    --muted: light-dark(#626264, #b3b3b3);
    --line: light-dark(#949494, #767676);
    --link: light-dark(#0017c1, #9db7f9);
    --code: light-dark(#f2f2f2, #333333);
  }
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--text); font-size: 1rem; line-height: 1.7; }
a { color: var(--link); text-underline-offset: 3px; }
:focus-visible { outline: 2px solid var(--link); outline-offset: 2px; }
.mono { font-family: var(--mono); }

.top { border-bottom: 1px solid var(--ink); }
.bar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 24px;
  padding-left: max(24px, env(safe-area-inset-left, 0px)); padding-right: max(24px, env(safe-area-inset-right, 0px)); }
.site { font-size: 1.25rem; font-weight: 700; color: var(--ink); text-decoration: none; }

.layout { display: flex; align-items: flex-start; max-width: 1280px; }
.side { flex: 0 0 248px; padding: 32px 24px; font-size: 0.875rem;
  position: sticky; top: 0; max-height: 100vh; overflow-y: auto; }
.side h2 { font-size: 0.875rem; font-weight: 700; margin: 0; padding: 6px 8px; }
.side ul { list-style: none; margin: 0 0 20px; padding: 0; }
.side li a { display: block; padding: 9px 8px 9px 24px; font-family: var(--mono); color: var(--ink); text-decoration: none; overflow-wrap: anywhere; }
.side li a:hover { text-decoration: underline; }
.side li a[aria-current="page"] { font-weight: 700; background: var(--code); }
main { flex: 1 1 0; min-width: 0; padding: 40px 24px 64px 32px; border-left: 1px solid var(--line); min-height: calc(100vh - 66px); }
.body { max-width: 800px; }

h1 { font-size: 2.25rem; font-weight: 700; line-height: 1.4; margin: 0 0 24px; overflow-wrap: anywhere; text-wrap: balance; }
h2 { font-size: 1.5rem; font-weight: 700; line-height: 1.5; margin: 48px 0 16px; text-wrap: balance; }
h3 { font-size: 1rem; font-weight: 700; margin: 24px 0 8px; text-wrap: balance; }
p { margin: 0 0 12px; text-wrap: pretty; }
.small { font-size: 0.875rem; color: var(--sub); }
.updated { font-size: 0.875rem; color: var(--muted); margin: 48px 0 0; }

table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 20px 24px 20px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
thead th { position: sticky; top: 0; z-index: 1; background: var(--bg); font-size: 0.875rem; font-weight: 700;
  padding-block: 12px; border-bottom: 2px solid var(--ink); white-space: nowrap; }
td.n, th.n { text-align: right; white-space: nowrap; font-size: 1.125rem; }
th.n { font-size: 0.875rem; }
td.up { font-weight: 700; }
td.act { white-space: nowrap; font-size: 0.875rem; padding-right: 0; }
td.act a { display: block; }
.skill { font-family: var(--mono); font-size: 1.125rem; font-weight: 700; overflow-wrap: anywhere; }
.tag { margin-left: 8px; padding: 1px 8px; vertical-align: 2px; border: 1px solid var(--link); border-radius: 999px;
  font-size: 0.75rem; font-weight: 700; line-height: 1.5; letter-spacing: 0.04em; white-space: nowrap; color: var(--link); }
.tag.new { color: var(--bg); background: var(--link); }
h1 .tag { margin-left: 12px; vertical-align: middle; }
td.date { white-space: nowrap; font-size: 0.875rem; color: var(--sub); }
.sub { display: block; font-size: 0.875rem; color: var(--sub); margin-top: 4px; max-width: 34em; text-wrap: pretty; }

.actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0; }
.btn { display: inline-flex; align-items: center; gap: 12px; min-height: 48px; padding: 8px 20px; font-weight: 700; text-decoration: none;
  color: var(--link); border: 2px solid var(--link); border-radius: 8px; font-variant-numeric: tabular-nums; }
.btn:hover { text-decoration: underline; }

dl { margin: 0; border-top: 1px solid var(--line); }
dl div { display: flex; flex-wrap: wrap; gap: 4px 24px; padding: 12px 0; border-bottom: 1px solid var(--line); }
dt { flex: 0 0 7em; font-size: 0.875rem; color: var(--sub); }
dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }

.tabs { display: flex; flex-wrap: wrap; gap: 0 8px; border-bottom: 1px solid var(--line); margin-bottom: 16px; }
.tabs button, .sort button { font: inherit; color: var(--ink); background: none; border: 0; border-bottom: 4px solid transparent; min-height: 48px; padding: 8px 16px; cursor: pointer; }
.tabs button[aria-selected="true"], .sort button[aria-pressed="true"] { color: var(--link); font-weight: 700; border-bottom-color: var(--link); }
.tabbed .panel h3 { display: none; }
.sort { display: flex; gap: 0 8px; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
.cmd { display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; background: var(--code); padding: 16px; margin-bottom: 12px; }
pre { font-family: var(--mono); font-size: 0.875rem; line-height: 1.8; margin: 0; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere; align-self: center; }
.copy { font: inherit; font-size: 0.875rem; font-weight: 700; min-height: 44px; padding: 6px 16px; white-space: nowrap; cursor: pointer;
  color: var(--link); background: var(--bg); border: 1px solid var(--link); border-radius: 8px; }

.voices { border-top: 1px solid var(--line); }
.voice { padding: 16px 0; border-bottom: 1px solid var(--line); }
.voice p { margin: 0; white-space: pre-line; overflow-wrap: anywhere; }
.send { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-top: 16px; }

@media (max-width: 760px) {
  .layout { flex-direction: column; align-items: stretch; }
  .side { order: 2; flex: none; border-top: 1px solid var(--line); padding: 24px 16px;
    position: static; max-height: none; overflow: visible; }
  main { flex: none; border-left: 0; padding: 32px 16px 48px; min-height: 0; }
  .bar { padding-inline: 16px; }
  h1 { font-size: 1.75rem; }
  .scroll { overflow-x: auto; }
  table { table-layout: fixed; }
  th, td { padding-right: 12px; }
  td.n, th.n { font-size: 1rem; width: 4.5em; }
  td.date, th.date { display: none; }
  .sub { max-width: 100%; }
}
`;

// 入れ方のタブとコマンドのコピー。JS が無くても内容は読める。
const SCRIPT = `const tabs = document.querySelector(".tabs");
if (tabs) {
  const buttons = [...tabs.querySelectorAll("button")];
  const panels = [...document.querySelectorAll(".panel")];
  const show = (tool) => {
    buttons.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tool === tool)));
    panels.forEach((p) => { p.hidden = p.dataset.tool !== tool; });
  };
  let saved = null;
  try { saved = localStorage.getItem("tool"); } catch {}
  buttons.forEach((b) => b.addEventListener("click", () => {
    show(b.dataset.tool);
    try { localStorage.setItem("tool", b.dataset.tool); } catch {}
  }));
  tabs.hidden = false;
  document.documentElement.classList.add("tabbed");
  show(buttons.some((b) => b.dataset.tool === saved) ? saved : buttons[0].dataset.tool);
}
const sort = document.querySelector(".sort");
if (sort) {
  const tbody = document.querySelector("tbody");
  const rows = [...tbody.rows];
  const buttons = [...sort.querySelectorAll("button")];
  const order = {
    up: () => rows,
    updated: () => [...rows].sort((a, b) => (b.dataset.updated || "").localeCompare(a.dataset.updated || "")),
  };
  const show = (key) => {
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sort === key)));
    tbody.append(...order[key]());
  };
  let saved = null;
  try { saved = localStorage.getItem("sort"); } catch {}
  buttons.forEach((b) => b.addEventListener("click", () => {
    show(b.dataset.sort);
    try { localStorage.setItem("sort", b.dataset.sort); } catch {}
  }));
  sort.hidden = false;
  show(order[saved] ? saved : "up");
}
document.querySelectorAll("button[data-copy]").forEach((b) => b.addEventListener("click", async () => {
  const text = document.getElementById(b.dataset.copy).textContent;
  try { await navigator.clipboard.writeText(text); b.textContent = "コピーしました"; }
  catch { b.textContent = "コピーできませんでした"; }
  setTimeout(() => { b.textContent = "コピー"; }, 2000);
}));
`;

function page({ title, base, current, groups, body }) {
  const nav = groups.map((g) => `<h2>${esc(g.title)}</h2>
<ul>
${g.skills.map((s) => `<li><a href="${base}skills/${esc(s)}/"${s === current ? ' aria-current="page"' : ""}>${esc(s)}</a></li>`).join("\n")}
</ul>`).join("\n");
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}style.css">
</head>
<body>
<header class="top"><div class="bar"><a class="site" href="${base || "./"}">${esc(CATALOG.name)}</a><a href="https://github.com/${CATALOG.repo}">GitHub</a></div></header>
<div class="layout">
<nav class="side" aria-label="Skill">
${nav}
</nav>
<main><div class="body">
${body}
</div></main>
</div>
<script src="${base}board.js"></script>
</body>
</html>
`;
}

const TAGS = { new: "New", updated: "Updated" };
const tag = (fresh) => (fresh ? `<span class="tag ${fresh}">${TAGS[fresh]}</span>` : "");
const dayOrBlank = (iso) => (iso ? dayOf(new Date(iso)) : "");

export function renderIndex(rows, { generatedAt }) {
  const body = rows.map((r) => {
    const act = r.url
      ? `<a href="${esc(r.url)}">いいねを送る</a><a href="${esc(r.url)}">感想を書く</a>`
      : "";
    return `      <tr data-updated="${esc(r.updated ?? "")}">
        <td><a class="skill" href="skills/${esc(r.name)}/">${esc(r.name)}</a>${tag(freshness(r, generatedAt))}<span class="sub">${esc(shortDescription(r.description))}</span></td>
        <td class="n up">${r.up}</td>
        <td class="n">${r.commentCount}</td>
        <td class="date">${esc(dayOrBlank(r.updated))}</td>
        <td class="act">${act}</td>
      </tr>`;
  }).join("\n");

  return page({
    title: CATALOG.name,
    base: "",
    groups: navGroups(rows),
    body: `<h1>Skill</h1>
<div class="sort" role="group" aria-label="並び順" hidden>
<button type="button" data-sort="up" aria-pressed="true">いいね順</button>
<button type="button" data-sort="updated" aria-pressed="false">更新順</button>
</div>
<div class="scroll">
  <table>
    <thead>
      <tr>
        <th>Skill</th>
        <th class="n">いいね</th>
        <th class="n">感想</th>
        <th class="date">更新日</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
${body}
    </tbody>
  </table>
</div>
${footer(generatedAt)}`,
  });
}

export function renderSkill(row, { generatedAt, showAuthors, groups }) {
  const { repo, sourceBranch } = CATALOG;
  const facts = [];
  if (row.plugins.length > 0) {
    const version = (p) => (row.versions?.[p] ? ` <span class="mono">v${esc(row.versions[p])}</span>` : "");
    facts.push(["プラグイン", row.plugins.map((p) => `<a class="mono" href="https://github.com/${repo}/tree/${sourceBranch}/plugins/${esc(p)}">${esc(p)}</a>${version(p)}`).join("、")]);
  }
  if (showAuthors && row.authors.length > 0) {
    facts.push(["作成者", row.authors.map((a) => (a.url ? `<a href="${esc(a.url)}">${esc(a.name)}</a>` : esc(a.name))).join("、")]);
  }
  if (row.published) facts.push(["公開日", esc(dayOf(new Date(row.published)))]);
  if (row.updated) facts.push(["最終更新日", esc(dayOf(new Date(row.updated)))]);
  facts.push(["ソース", `<a class="mono" href="https://github.com/${repo}/tree/${sourceBranch}/skills/${esc(row.name)}">skills/${esc(row.name)}</a>`]);

  const guides = installGuides(row);
  let n = 0;
  const panels = guides.map((g) => `<div class="panel" id="panel-${g.id}" data-tool="${g.id}">
<h3>${esc(g.tool)}</h3>
${g.blocks.map((b) => {
    const label = b.skillOnly ? SOLO : row.plugins.length > 1 ? `${b.plugin} プラグイン` : "";
    const id = `cmd-${n++}`;
    return `${label ? `<p class="small">${esc(label)}</p>\n` : ""}<div class="cmd"><pre id="${id}">${b.lines.map(esc).join("\n")}</pre><button class="copy" type="button" data-copy="${id}">コピー</button></div>`;
  }).join("\n")}${g.note ? `\n<p>${g.note}</p>` : ""}
</div>`).join("\n");
  const tabs = guides.length > 1
    ? `<div class="tabs" role="tablist" hidden>
${guides.map((g) => `<button type="button" role="tab" data-tool="${g.id}" aria-controls="panel-${g.id}" aria-selected="false">${esc(g.tool)}</button>`).join("\n")}
</div>
`
    : "";

  const comments = [...row.comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const voices = comments.length > 0
    ? `<div class="voices">
${comments.map((c) => `<div class="voice">
<div class="small">${showAuthors && c.author ? `${esc(c.author)}　` : ""}<a href="${esc(c.url)}">${esc(dayOf(new Date(c.createdAt)))}</a></div>
<p>${esc(c.body)}</p>
</div>`).join("\n")}
</div>`
    : "";
  const actions = row.url
    ? `<div class="actions">
<a class="btn" href="${esc(row.url)}">いいねを送る <span>${row.up}</span></a>
<a class="btn" href="${esc(row.url)}">感想を書く <span>${row.commentCount}</span></a>
</div>`
    : "";
  const send = row.url
    ? `<p class="send"><a href="${esc(row.url)}">いいねを送る</a><a href="${esc(row.url)}">感想を書く</a></p>`
    : "";

  return page({
    title: `${row.name} - ${CATALOG.name}`,
    base: "../../",
    current: row.name,
    groups,
    body: `<h1><span class="mono">${esc(row.name)}</span>${tag(freshness(row, generatedAt))}</h1>
<p>${esc(row.description)}</p>
${actions}
<dl>
${facts.map(([k, v]) => `  <div><dt>${k}</dt><dd>${v}</dd></div>`).join("\n")}
</dl>

<h2 id="install">入れ方</h2>
${tabs}${panels}

${row.url ? `<h2 id="voices">感想</h2>
${voices}
${send}
` : ""}
${footer(generatedAt)}`,
  });
}

/** ボードのファイル一式を { 相対パス: 内容 } で返す。 */
export function renderBoard({ skills, stats, now = new Date(), showAuthors = true }) {
  const generatedAt = stats?.generatedAt ? new Date(stats.generatedAt) : now;
  const rows = boardRows(skills, stats);
  const groups = navGroups(rows);
  const files = {
    "index.html": renderIndex(rows, { generatedAt }),
    "style.css": STYLE,
    "board.js": SCRIPT,
  };
  for (const row of rows) files[`skills/${row.name}/index.html`] = renderSkill(row, { generatedAt, showAuthors, groups });
  return files;
}

/** 環境変数 BOARD_SHOW_AUTHORS を読む。既定は表示。"false" / "0" / "no" で匿名。 */
export function showAuthorsFrom(value) {
  return !/^(false|0|no|off)$/i.test(String(value ?? "").trim());
}

const readJsonIfExists = (file) => (file && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null);

export function buildBoard({ root = ROOT, statsFile, outDir = path.join(root, "dist", "board"), showAuthors = true, now } = {}) {
  const files = renderBoard({
    skills: boardSkills(root),
    stats: readJsonIfExists(statsFile),
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
      outDir: args.out ? path.resolve(args.out) : undefined,
      showAuthors: showAuthorsFrom(process.env.BOARD_SHOW_AUTHORS),
    });
    console.log(`Skill ボードを生成しました: ${path.relative(ROOT, outDir)}/ (${files.length} ファイル)`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
