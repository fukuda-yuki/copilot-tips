#!/usr/bin/env node
// 正本 (main) の内容が規約どおりかを検証する。問題があれば exit 1。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROOT, COMPOSITION_NS, COPILOT_NS, EXAMPLES_DIR, NAME_PATTERN, PLUGIN_SCHEMA_URL, SPEC_FIELDS,
  listFiles, loadCatalog, readComposition, readExample, readFrontmatter, readJson,
} from "./lib.mjs";
import { staleGenerated } from "./generate.mjs";

/** 実例の本文の行数の上限。ページに全文を載せるので、抜粋に収める。 */
export const EXAMPLE_MAX_LINES = 40;

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export function validateCatalog(root = ROOT) {
  const errors = [];
  const warnings = [];
  const rel = (p) => path.relative(root, p).split(path.sep).join("/");
  const catalog = loadCatalog(root);

  const checkName = (name, where) => {
    if (!NAME_PATTERN.test(name) || name.length > 64 || name.includes("--")) {
      errors.push(`${where}: 名前は小文字英数字とハイフンのみ・64 文字以内にしてください (${name})`);
    }
  };
  const checkDescription = (fm, where, max = 1024) => {
    if (!fm.description) errors.push(`${where}: frontmatter に description がありません`);
    else if (/^[>|][+-]?$/.test(fm.description)) errors.push(`${where}: description は 1 行で書いてください`);
    else if (fm.description.length > max) errors.push(`${where}: description は ${max} 文字以内にしてください`);
  };

  // --- skills ---
  for (const skill of catalog.skills) {
    const where = rel(skill.dir);
    checkName(skill.name, where);
    if (!fs.existsSync(skill.file)) { errors.push(`${where}: SKILL.md がありません`); continue; }
    const fm = readFrontmatter(skill.file);
    if (!fm) { errors.push(`${where}/SKILL.md: frontmatter がありません`); continue; }
    if (fm.name !== skill.name) errors.push(`${where}/SKILL.md: name (${fm.name}) をフォルダ名と一致させてください`);
    checkDescription(fm, `${where}/SKILL.md`);
    if ((fm.compatibility ?? "").length > 500) errors.push(`${where}/SKILL.md: compatibility は 500 文字以内にしてください`);
  }

  // --- agents ---
  for (const agent of catalog.agents) {
    const where = rel(agent.file);
    checkName(agent.name, where);
    const fm = readFrontmatter(agent.file);
    if (!fm) { errors.push(`${where}: frontmatter がありません`); continue; }
    checkDescription(fm, where);
  }
  for (const f of fs.existsSync(path.join(root, "agents")) ? fs.readdirSync(path.join(root, "agents")) : []) {
    if (!f.endsWith(".agent.md")) errors.push(`agents/${f}: agent のファイル名は <name>.agent.md にしてください`);
  }

  // --- instructions ---
  for (const inst of catalog.instructions) {
    const where = rel(inst.file);
    checkName(inst.name, where);
    const fm = readFrontmatter(inst.file);
    if (!fm) { errors.push(`${where}: frontmatter がありません`); continue; }
    checkDescription(fm, where);
    if (!fm.applyTo) errors.push(`${where}: frontmatter に applyTo がありません`);
  }
  for (const f of fs.existsSync(path.join(root, "instructions")) ? fs.readdirSync(path.join(root, "instructions")) : []) {
    if (!f.endsWith(".instructions.md")) errors.push(`instructions/${f}: ファイル名は <name>.instructions.md にしてください`);
  }

  // --- plugins ---
  const skillNames = new Set(catalog.skills.map((s) => s.name));
  const agentNames = new Set(catalog.agents.map((a) => a.name));
  const usedSkills = new Set();
  const usedAgents = new Set();

  for (const plugin of catalog.plugins) {
    const where = rel(plugin.dir);
    checkName(plugin.name, where);
    if (!fs.existsSync(path.join(plugin.dir, "README.md"))) errors.push(`${where}: README.md がありません`);
    // 配布物は Actions が dist/ に生成する。正本に置いてはいけない。
    for (const generated of ["skills", "agents", COPILOT_NS, ".github", ".claude-plugin"]) {
      if (fs.existsSync(path.join(plugin.dir, generated))) {
        errors.push(`${where}/${generated}: 生成物を正本に置かないでください (中身は repo ルートの skills/ agents/ に置き、plugin.json で宣言します)`);
      }
    }
    if (!fs.existsSync(plugin.manifestFile)) { errors.push(`${where}: plugin.json がありません`); continue; }

    let manifest;
    try { manifest = readJson(plugin.manifestFile); }
    catch (e) { errors.push(`${where}/plugin.json: JSON として読めません (${e.message})`); continue; }

    if (manifest.$schema !== PLUGIN_SCHEMA_URL) errors.push(`${where}/plugin.json: "$schema" は ${PLUGIN_SCHEMA_URL} にしてください`);
    if (manifest.name !== plugin.name) errors.push(`${where}/plugin.json: name (${manifest.name}) をフォルダ名と一致させてください`);
    if (!manifest.description) errors.push(`${where}/plugin.json: description がありません`);
    if (!SEMVER.test(manifest.version ?? "")) errors.push(`${where}/plugin.json: version は 1.2.3 の形式にしてください`);
    for (const key of Object.keys(manifest)) {
      if (!SPEC_FIELDS.includes(key)) errors.push(`${where}/plugin.json: "${key}" は使えません (同梱内容は extensions["${COMPOSITION_NS}"] に書きます)`);
    }

    let composition;
    try { composition = readComposition(manifest); }
    catch (e) { errors.push(`${where}/plugin.json: ${e.message}`); continue; }
    if (composition.skills.length + composition.agents.length === 0) {
      errors.push(`${where}/plugin.json: 同梱する skills / agents が 1 つもありません`);
    }
    for (const name of composition.skills) {
      if (!skillNames.has(name)) errors.push(`${where}/plugin.json: skills/${name} が存在しません`);
      usedSkills.add(name);
    }
    for (const name of composition.agents) {
      if (!agentNames.has(name)) errors.push(`${where}/plugin.json: agents/${name}.agent.md が存在しません`);
      usedAgents.add(name);
    }
  }

  for (const name of skillNames) if (!usedSkills.has(name)) warnings.push(`skills/${name}: どのプラグインにも入っていません`);
  for (const name of agentNames) if (!usedAgents.has(name)) warnings.push(`agents/${name}.agent.md: どのプラグインにも入っていません`);

  // --- 実例 (ボードの Skill のページに載る) ---
  for (const f of listFiles(path.join(root, EXAMPLES_DIR), "")) {
    const where = `${EXAMPLES_DIR}/${f}`;
    const name = f.replace(/\.md$/, "");
    if (!f.endsWith(".md") || !skillNames.has(name)) { errors.push(`${where}: ファイル名は <skill-name>.md にしてください (skills/ にある名前)`); continue; }
    const example = readExample(root, name);
    if (!example) errors.push(`${where}: frontmatter の ask (頼んだ言葉) と、本文 (返ってきたものの抜粋) を書いてください`);
    else if (example.output.split("\n").length > EXAMPLE_MAX_LINES) errors.push(`${where}: 本文は ${EXAMPLE_MAX_LINES} 行以内にしてください`);
  }

  // --- 生成ファイルが最新か ---
  if (errors.length === 0) {
    for (const file of staleGenerated(root)) {
      errors.push(`${file}: 内容が古いです。npm run build を実行して commit してください`);
    }
  }

  return { errors, warnings, catalog };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors, warnings, catalog } = validateCatalog();
  for (const w of warnings) console.warn(`warning: ${w}`);
  for (const e of errors) console.error(`error: ${e}`);
  console.log(`skills ${catalog.skills.length} / agents ${catalog.agents.length} / instructions ${catalog.instructions.length} / plugins ${catalog.plugins.length}`);
  if (errors.length > 0) {
    console.error(`\n検証に失敗しました (${errors.length} 件)`);
    process.exit(1);
  }
  console.log("検証 OK");
}
