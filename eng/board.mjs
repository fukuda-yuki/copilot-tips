#!/usr/bin/env node
// Skill ボード (GitHub Pages) の静的ページを生成する。外部依存なし。
//  - Skill の一覧・説明・同梱プラグイン・作成者は skills/ と plugins/ から読む (新しい Skill は自動で載る)
//  - 公開日と最終更新日は skills/<name>/ の git の履歴から読む (浅い clone では読まない)
//  - 👍 と感想は board-collect.mjs が集計した stats.json から読む
//  - 同じ内容を skills.json にも出す。エージェントが読む一覧で、skills/skill-board が使う
//  - 頼み方は description の「」から抜く。trigger-check.mjs の結果があれば、呼ばれると確かめた頼み方を先に並べる
//  - 出力は dist/board/ (正本には書かない)
//
// 使い方: node eng/board.mjs [--stats <stats.json>] [--triggers <triggers.json>] [--out <dir>]
//   stats を省略すると、数字が 0 のページを作る (見た目の確認用)。
//   環境変数 BOARD_SHOW_AUTHORS=false で、Skill の作成者と感想を書いた人の名前を伏せる。
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, CATALOG, boardSkillUrl, loadCatalog, readFrontmatter } from "./lib.mjs";
import { readPlugins } from "./generate.mjs";

const TIME_ZONE = "Asia/Tokyo";
/** 履歴 (history.json) を残す日数。 */
const KEEP_DAYS = 70;
/** 公開・更新から何日のあいだ New / Updated を付けるか。 */
export const FRESH_DAYS = 14;

// ---------------------------------------------------------------------------
// データ
// ---------------------------------------------------------------------------

/** git hook の中から呼ばれても root のリポジトリを読むよう、hook が渡す GIT_DIR などを外す。 */
export const gitEnv = (env = process.env) => Object.fromEntries(Object.entries(env).filter(([k]) => !/^GIT_(DIR|INDEX_FILE|WORK_TREE|PREFIX|COMMON_DIR|OBJECT_DIRECTORY)$/.test(k)));
const git = (root, args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", env: gitEnv(), stdio: ["ignore", "pipe", "ignore"] }).trim();

/**
 * Skill の公開日 (最初の commit) と最終更新日 (最後の commit) を ISO 形式で返す。
 * main に入った日を取るため、マージ commit をたどる (--first-parent)。
 * git が無い・浅い clone で履歴が欠けている場合は null (誤って全部を New にしないため)。
 */
export function skillDates(root, name) {
  try {
    if (git(root, ["rev-parse", "--is-shallow-repository"]) !== "false") return { published: null, updated: null };
    const lines = git(root, ["log", "--first-parent", "--format=%cI", "--", `skills/${name}`]).split("\n").filter(Boolean);
    // commit ごとに時差の書き方が違うので、UTC にそろえて文字列のまま比べられるようにする
    const utc = (iso) => (iso ? new Date(iso).toISOString() : null);
    return { published: utc(lines.at(-1)), updated: utc(lines[0]) };
  } catch {
    return { published: null, updated: null };
  }
}

/** description の「」の中を、頼み方として取り出す。同じ文は 1 回だけ。 */
export function askPhrases(description) {
  return [...new Set([...String(description ?? "").matchAll(/「([^「」]+)」/g)].map((m) => m[1].trim()).filter(Boolean))];
}

/** description の版。頼み方の確認結果 (trigger-check.mjs) が、いまの description のものかを見分ける。 */
export const descriptionHash = (description) => crypto.createHash("sha256").update(String(description ?? "")).digest("hex").slice(0, 12);

/**
 * 頼み方を、呼ばれると確かめたものが先になるよう並べ替える。確かめていないもの・呼ばれなかったものは元の順で後ろに置く。
 * description が変わったあとの古い結果は使わない。
 */
export function orderPhrases(phrases, description, check) {
  if (!check || check.hash !== descriptionHash(description)) return phrases;
  const fired = (p) => check.phrases?.[p]?.fired === true;
  return [...phrases.filter(fired), ...phrases.filter((p) => !fired(p))];
}

const SCRIPT_KINDS = { ".py": "Python", ".js": "Node.js", ".mjs": "Node.js", ".cjs": "Node.js", ".ts": "TypeScript", ".sh": "シェル", ".ps1": "PowerShell" };
const DOC_EXTENSIONS = new Set([".md", ".txt"]);

/** SKILL.md のほかに同梱しているものを「Python スクリプト 10 本、資料 1 件、ほか 17 件」の形で返す。無ければ空文字。 */
export function bundledSummary(dir) {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const files = fs.existsSync(dir) ? walk(dir).filter((f) => !/^(SKILL\.md|LICENSE(\..*)?)$/i.test(path.relative(dir, f))) : [];
  const scripts = new Map();
  let docs = 0, others = 0;
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (SCRIPT_KINDS[ext]) scripts.set(SCRIPT_KINDS[ext], (scripts.get(SCRIPT_KINDS[ext]) ?? 0) + 1);
    else if (DOC_EXTENSIONS.has(ext)) docs++;
    else others++;
  }
  return [
    ...[...scripts].map(([kind, n]) => `${kind} スクリプト ${n} 本`),
    ...(docs ? [`資料 ${docs} 件`] : []),
    ...(others ? [`ほか ${others} 件`] : []),
  ].join("、");
}

/** ボードに載せる Skill の一覧。説明と必須環境 (compatibility) は SKILL.md、同梱先と作成者は plugin.json、日付は git の履歴から読む。 */
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
    const fm = readFrontmatter(skill.file);
    return {
      name: skill.name,
      description: fm?.description ?? "",
      requires: fm?.compatibility ?? "",
      bundled: bundledSummary(skill.dir),
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
  guides.push({ id: "skills", tool: "npx skills", blocks: [{ lines: [`npx skills add ${repo} --skill ${skill.name}`] }] });
  return guides;
}

/**
 * 選んだ Skill をまとめて入れるコマンドを、ツールごとに返す。同じプラグインは 1 回だけ入れる。
 * 一覧ページのブラウザ側でも同じ関数を使う (SCRIPT に埋め込む) ので、外の変数を参照しない。
 * selected は [{ name, plugins }]、config は { repo, catalog, distBranch }。入れられるものが無いツールは返さない。
 */
export function bundleCommands(config, selected) {
  const plugins = [...new Set(selected.flatMap((s) => s.plugins))];
  const solo = selected.filter((s) => s.plugins.length === 0).map((s) => s.name);
  const guides = [];
  if (plugins.length > 0) {
    guides.push(
      { id: "copilot", tool: "GitHub Copilot CLI", lines: [`copilot plugin marketplace add ${config.repo}`, ...plugins.map((p) => `copilot plugin install ${p}@${config.catalog}`)] },
      { id: "vscode", tool: "VS Code", lines: [`"chat.plugins.marketplaces": ["${config.repo}"]`], note: `拡張機能ビューで @agentPlugins を検索し、${plugins.join("、")} を入れる。` },
      { id: "claude", tool: "Claude Code", lines: [`/plugin marketplace add ${config.repo}`, ...plugins.map((p) => `/plugin install ${p}@${config.catalog}`)] },
    );
  }
  if (selected.length > 0) {
    guides.push(
      { id: "apm", tool: "APM", lines: [...plugins.map((p) => `apm install ${config.repo}/plugins/${p}#${config.distBranch}`), ...solo.map((n) => `apm install ${config.repo}/skills/${n}`)] },
      { id: "skills", tool: "npx skills", lines: [`npx skills add ${config.repo} ${selected.map((s) => `--skill ${s.name}`).join(" ")}`] },
    );
  }
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
      threadId: s?.id ?? null,
    };
  }).sort((a, b) => b.up - a.up || b.commentCount - a.commentCount || a.name.localeCompare(b.name));
}

/** エージェントが読む一覧のファイル名。skills/skill-board/SKILL.md がこの URL を読む (一致は board.test.mjs が確認)。 */
export const DATA_FILE = "skills.json";

/**
 * エージェントが読む一覧。ページと同じ数字に、いいね・感想の送り先 (感想スレッドの id)、入れ方、ほしい Skill の投稿先を付ける。
 * 感想の本文・要望の題・書いた人は入れない。他人が書いた文をエージェントに読ませないため。
 */
export function boardData(rows, { generatedAt, requests = null }) {
  const plain = (html) => html.replace(/<[^>]+>/g, "");
  return {
    generatedAt: generatedAt.toISOString(),
    requests: requests ? { url: requests.url, repositoryId: requests.repositoryId, categoryId: requests.categoryId } : null,
    skills: rows.map((r) => ({
      name: r.name,
      description: r.description,
      ask: r.ask ?? askPhrases(r.description),
      requires: r.requires || null,
      page: boardSkillUrl(r.name),
      plugins: r.plugins.map((p) => ({ name: p, version: r.versions?.[p] ?? null })),
      published: r.published ?? null,
      updated: r.updated ?? null,
      likes: r.up,
      comments: r.commentCount,
      thread: r.url && r.threadId ? { id: r.threadId, url: r.url } : null,
      install: installGuides(r).map((g) => ({
        tool: g.tool,
        commands: g.blocks.map((b) => b.lines.join("\n")),
        ...(g.note ? { note: plain(g.note) } : {}),
      })),
    })),
  };
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** 説明の最初の 1 文。 */
export const firstSentence = (text) => /^[\s\S]*?(?:。|\.\s|$)/.exec(String(text ?? "").trim())[0].trim();

/** 表に載せる短い説明 (最初の 1 文、長ければ切る)。全文は Skill のページに出す。 */
export function shortDescription(text, max = 80) {
  const first = firstSentence(text);
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
.pick { display: none; width: 44px; padding-right: 0; }
.picking .pick { display: table-cell; }
.pick label { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; margin: -4px 0 0 -6px; cursor: pointer; }
.pick input { width: 20px; height: 20px; margin: 0; accent-color: var(--link); cursor: pointer; }
.bundle[hidden] { display: none; }
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
.tabs[hidden], .sort[hidden] { display: none; }
.sort { display: flex; gap: 0 8px; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
.cmd { display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; background: var(--code); padding: 16px; margin-bottom: 12px; }
pre { font-family: var(--mono); font-size: 0.875rem; line-height: 1.8; margin: 0; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere; align-self: center; }
.copy { font: inherit; font-size: 0.875rem; font-weight: 700; min-height: 44px; padding: 6px 16px; white-space: nowrap; cursor: pointer;
  color: var(--link); background: var(--bg); border: 1px solid var(--link); border-radius: 8px; }

.say { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
.say li { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.say span { min-width: 0; overflow-wrap: anywhere; }
.say .copy { min-height: 36px; padding: 2px 12px; }
details.more .say { border-top: 0; }
details.more summary { cursor: pointer; padding: 12px 0; color: var(--link); font-size: 0.875rem; }
.ask { display: block; font-size: 0.875rem; margin-top: 6px; max-width: 34em; }
.links { display: flex; flex-wrap: wrap; gap: 8px 24px; }
td.req { overflow-wrap: anywhere; }

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
  td.n, th.n { font-size: 1rem; width: 3.25rem; }
  th.n { font-size: 0.875rem; }
  th.act { width: 5.5rem; }
  .pick { width: 36px; }
  td.date, th.date { display: none; }
  .sub { max-width: 100%; }
}
`;

// 入れ方のタブとコマンドのコピー。JS が無くても内容は読める。
const SCRIPT = `${bundleCommands}
const tabs = document.querySelector(".tabs[hidden]");
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
const bundle = document.querySelector(".bundle");
if (bundle) {
  const config = JSON.parse(bundle.dataset.config);
  const boxes = [...document.querySelectorAll(".pick input")];
  const tabs = bundle.querySelector(".tabs");
  const pre = bundle.querySelector("pre");
  const note = bundle.querySelector(".note");
  let tool = null;
  try { tool = localStorage.getItem("tool"); } catch {}
  const render = () => {
    const selected = boxes.filter((b) => b.checked).map((b) => ({ name: b.value, plugins: b.dataset.plugins ? b.dataset.plugins.split(",") : [] }));
    const guides = bundleCommands(config, selected);
    bundle.hidden = guides.length === 0;
    if (guides.length === 0) return;
    const current = guides.find((g) => g.id === tool) || guides[0];
    tabs.replaceChildren(...guides.map((g) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = g.tool;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(g === current));
      b.addEventListener("click", () => {
        tool = g.id;
        try { localStorage.setItem("tool", tool); } catch {}
        render();
        tabs.querySelector('[aria-selected="true"]').focus();
      });
      return b;
    }));
    pre.textContent = current.lines.join("\\n");
    note.textContent = current.note || "";
    note.hidden = !current.note;
  };
  boxes.forEach((b) => b.addEventListener("change", render));
  document.documentElement.classList.add("picking");
  render();
}
document.querySelectorAll("button[data-copy]").forEach((b) => b.addEventListener("click", async () => {
  const text = document.getElementById(b.dataset.copy).textContent;
  try { await navigator.clipboard.writeText(text); b.textContent = "コピーしました"; }
  catch { b.textContent = "コピーできませんでした"; }
  setTimeout(() => { b.textContent = "コピー"; }, 2000);
}));
`;

function page({ title, base, current, groups, body, requests }) {
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
<header class="top"><div class="bar"><a class="site" href="${base || "./"}">${esc(CATALOG.name)}</a><span class="links">${requests ? `<a href="${esc(requests.url)}">${REQUEST_LINK}</a>` : ""}<a href="https://github.com/${CATALOG.repo}">GitHub</a></span></div></header>
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

/** ほしい Skill の投稿フォームへのリンクの文字。全ページの上の帯に出す。 */
const REQUEST_LINK = "ほしい Skill を投稿";
/** 一覧に出す要望の数。 */
const MAX_REQUESTS = 20;
/** Skill のページで、畳まずに見せる頼み方の数。残りは「ほか n 件」に入れる。 */
const SHOWN_PHRASES = 5;

const TAGS = { new: "New", updated: "Updated" };
const tag = (fresh) => (fresh ? `<span class="tag ${fresh}">${TAGS[fresh]}</span>` : "");
const dayOrBlank = (iso) => (iso ? dayOf(new Date(iso)) : "");

/** 一覧の行に出す頼み方 (先頭の 2 つ)。 */
const ask = (row) => (row.ask.length > 0 ? `<span class="ask">${row.ask.slice(0, 2).map((p) => `「${esc(p)}」`).join(" ")}</span>` : "");

export function renderIndex(rows, { generatedAt, requests = null }) {
  const body = rows.map((r) => {
    const act = r.url
      ? `<a href="${esc(r.url)}">いいねを送る</a><a href="${esc(r.url)}">感想を書く</a>`
      : "";
    return `      <tr data-updated="${esc(r.updated ?? "")}">
        <td class="pick"><label><input type="checkbox" value="${esc(r.name)}" data-plugins="${esc(r.plugins.join(","))}" aria-label="${esc(r.name)}"></label></td>
        <td><a class="skill" href="skills/${esc(r.name)}/">${esc(r.name)}</a>${tag(freshness(r, generatedAt))}<span class="sub">${esc(shortDescription(r.description))}</span>${ask(r)}</td>
        <td class="n up">${r.up}</td>
        <td class="n">${r.commentCount}</td>
        <td class="date">${esc(dayOrBlank(r.updated))}</td>
        <td class="act">${act}</td>
      </tr>`;
  }).join("\n");

  const wanted = requests
    ? `<section id="requests">
<h2>ほしい Skill</h2>
<div class="actions"><a class="btn" href="${esc(requests.url)}">投稿する</a></div>
${requests.items.length > 0 ? `<table>
  <thead><tr><th>要望</th><th class="n">票</th></tr></thead>
  <tbody>
${requests.items.slice(0, MAX_REQUESTS).map((q) => `    <tr><td class="req"><a href="${esc(q.url)}">${esc(q.title)}</a></td><td class="n up">${q.up}</td></tr>`).join("\n")}
  </tbody>
</table>` : ""}
</section>
`
    : "";

  return page({
    title: CATALOG.name,
    base: "",
    requests,
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
        <th class="pick"></th>
        <th>Skill</th>
        <th class="n">いいね</th>
        <th class="n">感想</th>
        <th class="date">更新日</th>
        <th class="act"></th>
      </tr>
    </thead>
    <tbody>
${body}
    </tbody>
  </table>
</div>
<section class="bundle" data-config="${esc(JSON.stringify({ repo: CATALOG.repo, catalog: CATALOG.name, distBranch: CATALOG.distBranch }))}" hidden>
<h2>まとめて入れる</h2>
<div class="tabs" role="tablist"></div>
<div class="cmd"><pre id="bundle-cmd"></pre><button class="copy" type="button" data-copy="bundle-cmd">コピー</button></div>
<p class="note" hidden></p>
</section>
${wanted}${footer(generatedAt)}`,
  });
}

export function renderSkill(row, { generatedAt, showAuthors, groups, requests = null }) {
  const { repo, sourceBranch } = CATALOG;
  const facts = [];
  if (row.requires) facts.push(["必須環境", esc(row.requires)]);
  if (row.bundled) facts.push(["同梱", esc(row.bundled)]);
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

  // 頼み方がある Skill は、AI 向けの description 全文の代わりに、最初の 1 文と頼み方を出す
  const say = (p, i) => `<li><span id="ask-${i}">${esc(p)}</span><button class="copy" type="button" data-copy="ask-${i}">コピー</button></li>`;
  const shown = row.ask.slice(0, SHOWN_PHRASES).map(say);
  const rest = row.ask.slice(SHOWN_PHRASES).map((p, i) => say(p, i + SHOWN_PHRASES));
  const lead = row.ask.length > 0
    ? `<p>${esc(firstSentence(row.description))}</p>
<h2 id="ask">頼み方</h2>
<ul class="say">
${shown.join("\n")}
</ul>${rest.length > 0 ? `
<details class="more"><summary>ほか ${rest.length} 件</summary>
<ul class="say">
${rest.join("\n")}
</ul>
</details>` : ""}`
    : `<p>${esc(row.description)}</p>`;

  return page({
    title: `${row.name} - ${CATALOG.name}`,
    base: "../../",
    current: row.name,
    groups,
    requests,
    body: `<h1><span class="mono">${esc(row.name)}</span>${tag(freshness(row, generatedAt))}</h1>
${lead}
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
export function renderBoard({ skills, stats, triggers = null, now = new Date(), showAuthors = true }) {
  const generatedAt = stats?.generatedAt ? new Date(stats.generatedAt) : now;
  const rows = boardRows(skills, stats).map((r) => ({ ...r, ask: orderPhrases(askPhrases(r.description), r.description, triggers?.skills?.[r.name]) }));
  const groups = navGroups(rows);
  const requests = stats?.requests ?? null;
  const files = {
    "index.html": renderIndex(rows, { generatedAt, requests }),
    "style.css": STYLE,
    "board.js": SCRIPT,
    [DATA_FILE]: JSON.stringify(boardData(rows, { generatedAt, requests }), null, 2) + "\n",
  };
  for (const row of rows) files[`skills/${row.name}/index.html`] = renderSkill(row, { generatedAt, showAuthors, groups, requests });
  return files;
}

/** 環境変数 BOARD_SHOW_AUTHORS を読む。既定は表示。"false" / "0" / "no" で匿名。 */
export function showAuthorsFrom(value) {
  return !/^(false|0|no|off)$/i.test(String(value ?? "").trim());
}

const readJsonIfExists = (file) => (file && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null);

export function buildBoard({ root = ROOT, statsFile, triggersFile, outDir = path.join(root, "dist", "board"), showAuthors = true, now } = {}) {
  const files = renderBoard({
    skills: boardSkills(root),
    stats: readJsonIfExists(statsFile),
    triggers: readJsonIfExists(triggersFile),
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
      triggersFile: args.triggers,
      outDir: args.out ? path.resolve(args.out) : undefined,
      showAuthors: showAuthorsFrom(process.env.BOARD_SHOW_AUTHORS),
    });
    console.log(`Skill ボードを生成しました: ${path.relative(ROOT, outDir)}/ (${files.length} ファイル)`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
