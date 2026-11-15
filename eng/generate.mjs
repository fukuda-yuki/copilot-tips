// 正本 (main) に commit しておく生成ファイルを作る。
//  - .github/plugin/marketplace.json  (Copilot CLI / VS Code 用)
//  - .claude-plugin/marketplace.json  (Claude Code 用)
//  - README.md のカタログ一覧 (マーカーの間)
//
// 利用者は既定ブランチ (main) を登録するが、main のプラグインは「宣言だけ」で中身が無い。
// そこで main のマーケットプレイス定義は、各プラグインの取得元として配布ブランチを明示する。
// これにより、利用者がどのブランチを登録しても実体化済みのプラグインが入る。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, CATALOG, boardSkillUrl, loadCatalog, readComposition, readFrontmatter, readJson } from "./lib.mjs";

export const README_START = "<!-- catalog:start (自動生成。手で編集しない) -->";
export const README_END = "<!-- catalog:end -->";

const cell = (text) => String(text ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const json = (value) => JSON.stringify(value, null, 2) + "\n";

export function readPlugins(catalog) {
  return catalog.plugins.map((plugin) => {
    const manifest = readJson(plugin.manifestFile);
    return {
      name: plugin.name,
      description: manifest.description,
      version: manifest.version,
      manifest,
      ...readComposition(manifest),
    };
  });
}

/**
 * マーケットプレイス定義を作る。
 * mode "source": main 用。取得元として配布ブランチを明示する。
 * mode "dist":   配布ブランチ用。同じブランチ内の相対パスを指す。
 */
export function marketplaces(plugins, mode) {
  const entry = (p, source) => ({ name: p.name, source, description: p.description, version: p.version });
  const copilotSource = (p) => mode === "dist"
    ? `plugins/${p.name}`
    : { source: "github", repo: CATALOG.repo, path: `plugins/${p.name}`, ref: CATALOG.distBranch };
  const claudeSource = (p) => mode === "dist"
    ? `./plugins/${p.name}`
    : { source: "git-subdir", url: `https://github.com/${CATALOG.repo}.git`, path: `plugins/${p.name}`, ref: CATALOG.distBranch };
  const head = { name: CATALOG.name, metadata: { description: CATALOG.description }, owner: { name: CATALOG.owner.name } };
  return {
    ".github/plugin/marketplace.json": json({ ...head, plugins: plugins.map((p) => entry(p, copilotSource(p))) }),
    ".claude-plugin/marketplace.json": json({ ...head, plugins: plugins.map((p) => entry(p, claudeSource(p))) }),
  };
}

/** board: true なら Skill の表に、ボードの Skill ごとのページへのリンクの列を足す (配布ブランチの README 用)。 */
function catalogSection(catalog, plugins, { board = false } = {}) {
  const lines = [README_START, "", `### プラグイン (${plugins.length})`, ""];
  if (plugins.length > 0) {
    lines.push("| プラグイン | 説明 | 同梱物 |", "| --- | --- | --- |");
    for (const p of plugins) {
      const parts = [...p.skills.map((s) => `skill: \`${s}\``), ...p.agents.map((a) => `agent: \`${a}\``)];
      lines.push(`| [\`${p.name}\`](plugins/${p.name}) | ${cell(p.description)} | ${parts.join("<br>")} |`);
    }
  } else {
    lines.push("なし");
  }
  const table = (title, items, link, extra) => {
    if (items.length === 0) return;
    const head = extra ? [title, "説明", extra.head] : [title, "説明"];
    lines.push("", `### ${title} (${items.length})`, "", `| ${head.join(" | ")} |`, `|${" --- |".repeat(head.length)}`);
    for (const item of items) {
      const cells = [`[\`${item.name}\`](${link(item)})`, cell(readFrontmatter(item.file)?.description)];
      if (extra) cells.push(extra.cell(item));
      lines.push(`| ${cells.join(" | ")} |`);
    }
  };
  const boardColumn = board ? { head: "評判", cell: (s) => `[いいね・感想](${boardSkillUrl(s.name)})` } : undefined;
  table("Skill", catalog.skills, (s) => `skills/${s.name}`, boardColumn);
  table("Agent", catalog.agents, (a) => `agents/${a.name}.agent.md`);
  table("Instruction", catalog.instructions, (i) => `instructions/${i.name}.instructions.md`);
  lines.push("", README_END);
  return lines.join("\n");
}

/** 生成ファイルの「あるべき内容」を { 相対パス: 内容 } で返す。board は配布ブランチ用の README を作るときだけ true にする。 */
export function generatedFiles(root, { board = false } = {}) {
  const catalog = loadCatalog(root);
  const plugins = readPlugins(catalog);
  const files = marketplaces(plugins, "source");

  const readmePath = path.join(root, "README.md");
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, "utf8");
    const start = readme.indexOf(README_START);
    const end = readme.indexOf(README_END);
    if (start !== -1 && end > start) {
      files["README.md"] = readme.slice(0, start) + catalogSection(catalog, plugins, { board }) + readme.slice(end + README_END.length);
    }
  }
  return files;
}

export function writeGenerated(root) {
  for (const [rel, content] of Object.entries(generatedFiles(root))) {
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, "utf8");
  }
}

/** 生成ファイルが最新でなければ、そのパスの一覧を返す。 */
export function staleGenerated(root) {
  return Object.entries(generatedFiles(root))
    .filter(([rel, content]) => {
      const file = path.join(root, rel);
      return !fs.existsSync(file) || fs.readFileSync(file, "utf8") !== content;
    })
    .map(([rel]) => rel);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const stale = staleGenerated(ROOT);
  writeGenerated(ROOT);
  // pre-commit hook が stage し直せるよう、更新したファイルを 1 行ずつ出力する
  for (const rel of stale) console.log(rel);
}
