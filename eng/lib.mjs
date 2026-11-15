// 共有ヘルパー。外部依存なし (Node.js 標準ライブラリのみ)。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** git は hook の実行中に GIT_DIR などを環境変数で渡してくる。別のリポジトリを操作するときは外す。 */
export const GIT_ENV = { ...process.env };
for (const name of ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY", "GIT_COMMON_DIR", "GIT_PREFIX"]) delete GIT_ENV[name];

/** カタログ全体の設定。リポジトリ名や公開先が変わったらここだけ直す。 */
export const CATALOG = {
  name: "copilot-tips",
  repo: "fukuda-yuki/copilot-tips",
  owner: { name: "fukuda-yuki", url: "https://github.com/fukuda-yuki" },
  description: "GitHub Copilot などの AI エージェント向け Skill / Agent / Instruction を、プラグインとして簡単にインストールできる日本語カタログ。",
  sourceBranch: "main",
  distBranch: "marketplace",
  /** Skill ボードの集計履歴を置くブランチ。GitHub Actions だけが更新する。 */
  boardDataBranch: "board-data",
  /** Skill ボードの公開先 (GitHub Pages)。 */
  boardUrl: "https://fukuda-yuki.github.io/copilot-tips/",
};

/** Skill ボードの Skill ごとのページの URL。 */
export const boardSkillUrl = (skill) => `${CATALOG.boardUrl}skills/${skill}/`;

/** 配布物にボードへのリンクを入れるか。ボードが動いていない間はリンク切れになるので入れない。 */
export const boardEnabled = (env = process.env) => env.BOARD_ENABLED === "true";

export const PLUGIN_SCHEMA_URL = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
/** このリポジトリ専用の「同梱内容の宣言」を置く名前空間。配布時に取り除く。 */
export const COMPOSITION_NS = "io.github.fukuda-yuki.copilot-tips";
/** Copilot 固有のファイル (agent など) を置く名前空間ディレクトリ。 */
export const COPILOT_NS = "com.github.copilot";

/** Agent Plugins 1.0.0 で plugin.json に書いてよいフィールド。 */
export const SPEC_FIELDS = [
  "$schema", "name", "version", "description", "author",
  "homepage", "repository", "license", "keywords", "extensions",
];

export const NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

export function listFiles(dir, suffix) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(suffix))
    .map((e) => e.name)
    .sort();
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** ファイルがあれば JSON として読む。パスが空・ファイルが無ければ null。 */
export const readJsonIfExists = (file) => (file && fs.existsSync(file) ? readJson(file) : null);

/** 親フォルダが無ければ作って書く。 */
export function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, "utf8");
}

export function writeJson(file, value) {
  writeText(file, JSON.stringify(value, null, 2) + "\n");
}

/** コマンドの引数 `--name value ...` を { name: value } にする。 */
export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const m = /^--([a-z-]+)$/.exec(argv[i]);
    if (!m) throw new Error(`不明な引数です: ${argv[i]}`);
    args[m[1]] = argv[++i];
  }
  return args;
}

/** Markdown 先頭の YAML frontmatter を { open, body, close, rest } に分ける。つなげると元の文になる。無ければ null。 */
export function splitFrontmatter(text) {
  const m = /^(\uFEFF?---\r?\n)([\s\S]*?)(\r?\n---(?:\r?\n|$))/.exec(text);
  return m && { open: m[1], body: m[2], close: m[3], rest: text.slice(m[0].length) };
}

/**
 * Markdown 先頭の YAML frontmatter から、トップレベルの `key: value` だけを読む。
 * frontmatter が無ければ null。入れ子や複数行の値は扱わない (検証側で 1 行に揃えさせる)。
 */
export function readFrontmatter(file) {
  const fm = splitFrontmatter(fs.readFileSync(file, "utf8"));
  if (!fm) return null;
  const data = {};
  for (const line of fm.body.split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
    const quoted = /^(["'])([\s\S]*)\1$/.exec(value);
    if (quoted) value = quoted[2];
    data[kv[1]] = value;
  }
  return data;
}

/** plugin.json の同梱宣言 (skills / agents) を、名前の配列に正規化して返す。 */
export function readComposition(manifest) {
  const composition = manifest.extensions?.[COMPOSITION_NS] ?? {};
  const parse = (entries, pattern, kind) => (entries ?? []).map((entry) => {
    const m = typeof entry === "string" ? pattern.exec(entry) : null;
    if (!m) throw new Error(`${kind} の書式が不正です: ${JSON.stringify(entry)}`);
    return m[1];
  });
  return {
    skills: parse(composition.skills, /^\.\/skills\/([^/]+)\/?$/, "skills"),
    agents: parse(composition.agents, /^\.\/agents\/([^/]+)\.md$/, "agents"),
  };
}

/** カタログの全体像を読み込む (検証はしない)。 */
export function loadCatalog(root = ROOT) {
  const skills = listDirs(path.join(root, "skills")).map((name) => ({
    name,
    dir: path.join(root, "skills", name),
    file: path.join(root, "skills", name, "SKILL.md"),
  }));
  const agents = listFiles(path.join(root, "agents"), ".agent.md").map((f) => ({
    name: f.slice(0, -".agent.md".length),
    file: path.join(root, "agents", f),
  }));
  const instructions = listFiles(path.join(root, "instructions"), ".instructions.md").map((f) => ({
    name: f.slice(0, -".instructions.md".length),
    file: path.join(root, "instructions", f),
  }));
  const plugins = listDirs(path.join(root, "plugins")).map((name) => ({
    name,
    dir: path.join(root, "plugins", name),
    manifestFile: path.join(root, "plugins", name, "plugin.json"),
  }));
  return { root, skills, agents, instructions, plugins };
}
