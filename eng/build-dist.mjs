#!/usr/bin/env node
// 正本から配布形式 (main ブランチの中身) を dist/ に生成する。
// 正本のファイルは一切書き換えない。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROOT, CATALOG, COPILOT_NS, PLUGIN_SCHEMA_URL, SPEC_FIELDS,
  loadCatalog, readComposition, readFrontmatter, readJson, writeJson,
} from "./lib.mjs";
import { validateCatalog } from "./validate.mjs";

const cell = (text) => String(text ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

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

function distReadme(plugins, catalog) {
  const { name, repo, sourceBranch } = CATALOG;
  const pluginRows = plugins.map((p) =>
    `| [\`${p.name}\`](plugins/${p.name}) | ${cell(p.description)} | ${[...p.skills.map((s) => `skill: \`${s}\``), ...p.agents.map((a) => `agent: \`${a}\``)].join("<br>")} |`);
  const skillRows = catalog.skills.map((s) =>
    `| [\`${s.name}\`](skills/${s.name}) | ${cell(readFrontmatter(s.file)?.description)} |`);
  const instructionRows = catalog.instructions.map((i) =>
    `| [\`${i.name}\`](instructions/${i.name}.instructions.md) | ${cell(readFrontmatter(i.file)?.description)} |`);
  const example = plugins[0]?.name ?? "<plugin-name>";

  return `<!-- このファイルは自動生成です。編集は ${sourceBranch} ブランチで行ってください。 -->
# ${name}

${CATALOG.description}

> このブランチ (\`${CATALOG.distBranch}\`) は **配布専用** で、GitHub Actions が \`${sourceBranch}\` ブランチから自動生成しています。
> 内容を直したい場合は [\`${sourceBranch}\` ブランチ](https://github.com/${repo}/tree/${sourceBranch}) へ Pull Request を送ってください。

## インストール

### GitHub Copilot CLI

\`\`\`bash
copilot plugin marketplace add ${repo}
copilot plugin install ${example}@${name}
\`\`\`

### VS Code (GitHub Copilot)

\`settings.json\` の \`chat.plugins.marketplaces\` に \`"${repo}"\` を追加し、拡張機能ビューで \`@agentPlugins\` を検索してインストールします。

### Claude Code

\`\`\`text
/plugin marketplace add ${repo}
/plugin install ${example}@${name}
\`\`\`

### APM (Agent Package Manager)

\`\`\`bash
apm install ${repo}/plugins/${example}
\`\`\`

Skill を 1 つだけ入れたい場合は \`apm install ${repo}/skills/<skill-name>\` も使えます。

## プラグイン一覧 (${plugins.length})

| プラグイン | 説明 | 同梱物 |
| --- | --- | --- |
${pluginRows.join("\n")}

## Skill 一覧 (${catalog.skills.length})

| Skill | 説明 |
| --- | --- |
${skillRows.join("\n")}

## Instruction 一覧 (${catalog.instructions.length})

Instruction はプラグインに含まれません。必要なファイルを自分のリポジトリの \`.github/instructions/\` にコピーして使います。

| Instruction | 説明 |
| --- | --- |
${instructionRows.join("\n")}
`;
}

function distAgentGuide() {
  const { repo, sourceBranch, distBranch } = CATALOG;
  return `<!-- このファイルは自動生成です。 -->
# このブランチは編集禁止 (配布専用)

\`${distBranch}\` ブランチは、GitHub Actions が \`${sourceBranch}\` ブランチから自動生成した **配布物** です。ここで行った変更は次の公開で上書きされて消えます。

作業するときは必ず次の手順に従ってください。

1. \`git fetch origin ${sourceBranch} && git checkout ${sourceBranch}\` で正本ブランチへ移動する
2. \`${sourceBranch}\` の \`AGENTS.md\` を読み、その指示に従う
3. \`${sourceBranch}\` から作業ブランチを切り、Pull Request は \`${sourceBranch}\` 宛てに作る (\`${distBranch}\` 宛ては禁止)

リポジトリ: https://github.com/${repo}
`;
}

export function buildDist({ root = ROOT, outDir = path.join(root, "dist") } = {}) {
  const { errors } = validateCatalog(root);
  if (errors.length > 0) {
    throw new Error(`検証エラーがあるため配布物を生成できません:\n- ${errors.join("\n- ")}`);
  }
  const catalog = loadCatalog(root);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  // 1. 単体でも取得できるよう、素材をそのままコピーする
  for (const dir of ["skills", "agents", "instructions"]) {
    const src = path.join(root, dir);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(outDir, dir), { recursive: true });
  }
  for (const file of ["LICENSE", "LICENSE.md"]) {
    const src = path.join(root, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(outDir, file));
  }

  // 2. プラグインを実体化する (宣言された skill / agent をプラグイン内へコピー)
  const plugins = [];
  for (const plugin of catalog.plugins) {
    const manifest = readJson(plugin.manifestFile);
    const { skills, agents } = readComposition(manifest);
    const dest = path.join(outDir, "plugins", plugin.name);
    fs.cpSync(plugin.dir, dest, { recursive: true });
    for (const skill of skills) {
      fs.cpSync(path.join(root, "skills", skill), path.join(dest, "skills", skill), { recursive: true });
    }
    for (const agent of agents) {
      const target = path.join(dest, COPILOT_NS, "agents", `${agent}.md`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(root, "agents", `${agent}.agent.md`), target);
    }
    writeJson(path.join(dest, "plugin.json"), servedManifest(manifest));
    plugins.push({ name: plugin.name, description: manifest.description, version: manifest.version, skills, agents });
  }

  // 3. マーケットプレイス定義 (Copilot 用と Claude Code 用)
  const entries = (prefix) => plugins.map((p) => ({
    name: p.name,
    source: `${prefix}plugins/${p.name}`,
    description: p.description,
    version: p.version,
  }));
  writeJson(path.join(outDir, ".github", "plugin", "marketplace.json"), {
    name: CATALOG.name,
    metadata: { description: CATALOG.description },
    owner: { name: CATALOG.owner.name },
    plugins: entries(""),
  });
  writeJson(path.join(outDir, ".claude-plugin", "marketplace.json"), {
    name: CATALOG.name,
    owner: { name: CATALOG.owner.name },
    metadata: { description: CATALOG.description },
    plugins: entries("./"),
  });

  // 4. 配布ブランチ用の案内
  write(path.join(outDir, "README.md"), distReadme(plugins, catalog));
  write(path.join(outDir, "AGENTS.md"), distAgentGuide());
  write(path.join(outDir, "CLAUDE.md"), "@AGENTS.md\n");

  return { outDir, plugins };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { outDir, plugins } = buildDist();
    console.log(`配布物を生成しました: ${path.relative(ROOT, outDir)}/ (plugins ${plugins.length})`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
