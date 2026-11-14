#!/usr/bin/env node
// 1. 正本に commit する生成ファイル (マーケットプレイス定義と README の一覧) を更新する
// 2. 配布ブランチの中身を dist/ に生成する (dist/ は commit しない)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROOT, CATALOG, COPILOT_NS, PLUGIN_SCHEMA_URL, SPEC_FIELDS, loadCatalog, writeJson,
} from "./lib.mjs";
import { marketplaces, readPlugins, writeGenerated } from "./generate.mjs";
import { validateCatalog } from "./validate.mjs";

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, "utf8");
}

/** 配布用 plugin.json。Agent Plugins 1.0.0 のフィールドだけを残し、同梱宣言は取り除く。 */
function servedManifest(manifest) {
  const served = { $schema: PLUGIN_SCHEMA_URL };
  for (const key of SPEC_FIELDS) {
    if (key === "$schema" || manifest[key] === undefined) continue;
    if (key === "extensions") {
      const copilot = manifest.extensions[COPILOT_NS];
      if (copilot) served.extensions = { [COPILOT_NS]: copilot };
    } else {
      served[key] = manifest[key];
    }
  }
  return served;
}

function distBanner() {
  const { repo, sourceBranch, distBranch } = CATALOG;
  return `> [!IMPORTANT]
> このブランチ (\`${distBranch}\`) は **配布専用** で、GitHub Actions が [\`${sourceBranch}\`](https://github.com/${repo}/tree/${sourceBranch}) から自動生成しています。直接編集しないでください。

`;
}

function distAgentGuide() {
  const { repo, sourceBranch, distBranch } = CATALOG;
  return `<!-- このファイルは自動生成です。 -->
# このブランチは編集禁止 (配布専用)

\`${distBranch}\` ブランチは、GitHub Actions が \`${sourceBranch}\` ブランチから自動生成した **配布物** です。ここで行った変更は次の公開で上書きされて消えます。

作業は必ず \`${sourceBranch}\` ブランチを基準に行い、\`${sourceBranch}\` の \`AGENTS.md\` と \`CONTRIBUTING.md\` に従ってください。Pull Request の宛先も \`${sourceBranch}\` です。

リポジトリ: https://github.com/${repo}
`;
}

export function buildDist({ root = ROOT, outDir = path.join(root, "dist") } = {}) {
  writeGenerated(root);
  const { errors } = validateCatalog(root);
  if (errors.length > 0) {
    throw new Error(`検証エラーがあるため配布物を生成できません:\n- ${errors.join("\n- ")}`);
  }
  const catalog = loadCatalog(root);
  const plugins = readPlugins(catalog);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  // 1. 単体でも取得できるよう、素材をそのままコピーする
  for (const dir of ["skills", "agents", "instructions"]) {
    const src = path.join(root, dir);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(outDir, dir), { recursive: true });
  }

  // 2. プラグインを実体化する (宣言された skill / agent をプラグイン内へコピー)
  for (const plugin of plugins) {
    const dest = path.join(outDir, "plugins", plugin.name);
    fs.cpSync(path.join(root, "plugins", plugin.name), dest, { recursive: true });
    for (const skill of plugin.skills) {
      fs.cpSync(path.join(root, "skills", skill), path.join(dest, "skills", skill), { recursive: true });
    }
    for (const agent of plugin.agents) {
      const target = path.join(dest, COPILOT_NS, "agents", `${agent}.md`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(root, "agents", `${agent}.agent.md`), target);
    }
    writeJson(path.join(dest, "plugin.json"), servedManifest(plugin.manifest));
  }

  // 3. マーケットプレイス定義 (配布ブランチ内の相対パスを指す)
  for (const [rel, content] of Object.entries(marketplaces(plugins, "dist"))) {
    write(path.join(outDir, rel), content);
  }

  // 4. README と、配布ブランチ用の案内
  const readme = path.join(root, "README.md");
  write(path.join(outDir, "README.md"), distBanner() + (fs.existsSync(readme) ? fs.readFileSync(readme, "utf8") : ""));
  write(path.join(outDir, "AGENTS.md"), distAgentGuide());
  write(path.join(outDir, "CLAUDE.md"), "@AGENTS.md\n");

  return { outDir, plugins };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { outDir, plugins } = buildDist();
    console.log(`生成ファイルを更新し、配布物を生成しました: ${path.relative(ROOT, outDir)}/ (plugins ${plugins.length})`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
