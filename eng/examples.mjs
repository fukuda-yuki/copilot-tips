#!/usr/bin/env node
// 実例 (examples/<skill-name>.md) の無い Skill を、頼み方 1 つで Copilot CLI に実際に動かし、返ってきたものを実例にする。外部依存なし。
//  - 頼み方の確認 (trigger-check.mjs) と違い、本物の Skill を動かす。頼み方は、呼ばれると確かめたものを先に選ぶ
//  - 作業場所は、このリポジトリを取り出したフォルダ。読めるのはその中だけで、シェル・ファイルの書き込み・記憶は禁止する。
//    Web の取得だけ許す (調べものをする Skill があるため)。トークンは環境変数にしか無く、読む手段を与えない
//  - 本当にその Skill が動いたかは、写しの SKILL.md に足した目印で確かめる。目印の出ない出力は実例にしない
//  - 既に実例のある Skill は動かさない・書き換えない
//
// 使い方 (GitHub Actions から実行する):
//   COPILOT_GITHUB_TOKEN=... node eng/examples.mjs run --out <examples.json> [--triggers <triggers.json>] [--skill <name> [--prompt <頼み方>]] [--summary <file.md>]
//   node eng/examples.mjs save --from <examples.json> [--summary <file.md>]   examples/ に書く (既にあるファイルは書かない)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXAMPLE_MAX_LINES, EXAMPLES_DIR, ROOT, loadCatalog, parseArgs, readJson, readJsonIfExists, writeJson, writeText } from "./lib.mjs";
import { orderPhrases } from "./board.mjs";
import { checkTargets, copilotHome, loadedSkills, marker, runCopilot } from "./trigger-check.mjs";

/** 1 つの Skill を動かして待つ時間。本物の Skill はファイルを読んだり調べたりするので、頼み方の確認より長く待つ。 */
const TIMEOUT_MS = 600_000;

/** Copilot CLI に足す引数。読むのは作業場所の中だけ、Web の取得は許す。シェル・書き込み・記憶は使わせない。 */
export const RUN_ARGS = [
  "--allow-all-urls",
  "--disallow-temp-dir",
  "--deny-tool", "shell", "write", "memory",
  "--secret-env-vars", "COPILOT_GITHUB_TOKEN,GITHUB_TOKEN,GH_TOKEN",
];

export const examplePath = (root, name) => path.join(root, EXAMPLES_DIR, `${name}.md`);

/**
 * 実例を作る対象と、使う頼み方。実例のある Skill、頼み方の無い Skill は外す。
 * 頼み方は、呼ばれると確かめたもの (triggers) を先に選ぶ。prompt を渡すと only の Skill にそれを使う。
 */
export function exampleTargets(root = ROOT, { only = null, prompt = null, triggers = null } = {}) {
  return checkTargets(root, only)
    .filter((t) => !fs.existsSync(examplePath(root, t.name)))
    .map((t) => {
      const check = triggers?.skills?.[t.name];
      const ask = prompt || orderPhrases(t.phrases, t.description, check)[0];
      const verified = !prompt && check ? check.phrases?.[ask]?.fired === true : false;
      return { name: t.name, ask, verified };
    });
}

/** 本物の Skill を、Copilot CLI の個人用の置き場に写す。SKILL.md の末尾に、動いたと分かる目印を出させる 1 行を足す。 */
export function installSkill(root, home, name) {
  const dest = path.join(copilotHome(home), "skills", name);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(path.join(root, "skills", name), dest, { recursive: true });
  const file = path.join(dest, "SKILL.md");
  fs.appendFileSync(file, `\n\n(動作確認) 返答の最初の行に \`${marker(name)}\` とだけ書く。\n`, "utf8");
}

/**
 * 出力から実例の本文を作る。その Skill の目印が無い・本文が空なら null。
 * -s の出力には、本文の前に途中経過 (「〜を確認します」) と、下調べの結果 (<final_answer> の塊) が混ざるので落とす。
 *  - <final_answer> の塊と目印の行を除く
 *  - 見出し (# で始まる行) があれば、最初の見出しから始める。本文はたいてい見出しで始まり、その前は途中経過のため
 *  - 作業場所 (cwd) の絶対パスは、リポジトリの中の相対パスにする
 *  - 空行の連続は 1 つにし、EXAMPLE_MAX_LINES 行に収める (超えたら最後の行を「…」にする)
 */
export function excerpt(name, output, { cwd = null, max = EXAMPLE_MAX_LINES } = {}) {
  if (!loadedSkills(output).includes(name)) return null;
  let text = String(output).replace(/\r\n/g, "\n").replace(/\u001b\[[0-9;]*[A-Za-z]/g, "")
    .replace(/<final_answer>[\s\S]*?<\/final_answer>/g, "");
  if (cwd) text = text.split(`${cwd.replace(/\/+$/, "")}/`).join("");
  let lines = text.split("\n").filter((l) => !/SKILL-LOADED:[a-z0-9-]+/.test(l)).map((l) => l.trimEnd());
  const heading = lines.findIndex((l) => /^#{1,6} /.test(l));
  if (heading > 0) lines = lines.slice(heading);
  lines = lines.filter((l, i) => l !== "" || (i > 0 && lines[i - 1] !== ""));
  while (lines.length > 0 && lines[0] === "") lines.shift();
  while (lines.length > 0 && lines.at(-1) === "") lines.pop();
  if (lines.length === 0) return null;
  return lines.length > max ? [...lines.slice(0, max - 1), "…"].join("\n") : lines.join("\n");
}

/** examples/<name>.md の中身。 */
export const exampleFile = (ask, body) => `---\nask: ${ask.replace(/\s+/g, " ").trim()}\n---\n\n${body}\n`;

/** 対象の Skill を 1 つずつ動かし、{ name: { ask, verified, body } | { ask, error } } を返す。run は (target) => 出力。 */
export async function runExamples({ targets, run, cwd = null, log = () => {} }) {
  const results = {};
  for (const target of targets) {
    try {
      const body = excerpt(target.name, await run(target), { cwd });
      results[target.name] = body ? { ask: target.ask, verified: target.verified, body } : { ask: target.ask, error: "Skill が動いた目印が出ませんでした" };
    } catch (e) {
      results[target.name] = { ask: target.ask, error: e.message };
    }
    log(`${results[target.name].body ? "ok  " : "skip"} ${target.name}: 「${target.ask}」${results[target.name].error ? ` ${results[target.name].error}` : ""}`);
  }
  return results;
}

/**
 * 結果を examples/ に書く。書いたファイルの Skill 名を返す。
 * 結果は AI の出力なので、カタログにある Skill で、まだ実例の無いものだけを書く (名前もパスも結果からは決めない)。
 */
export function saveExamples(root, results) {
  const written = [];
  for (const { name } of loadCatalog(root).skills) {
    const r = results?.[name];
    const file = examplePath(root, name);
    if (!r?.body || typeof r.ask !== "string" || fs.existsSync(file)) continue;
    writeText(file, exampleFile(r.ask, r.body));
    written.push(name);
  }
  return written;
}

/** メンテナー向けの要約 (Markdown)。 */
export function summary(results) {
  const rows = Object.entries(results).map(([name, r]) => `| \`${name}\` | ${r.ask.replace(/\|/g, "\\|")} | ${r.body ? (r.verified ? "作った" : "作った (呼ばれるか未確認の頼み方)") : `作れなかった: ${r.error.replace(/\|/g, "\\|").replace(/\n/g, " ")}`} |`);
  return [
    `## 実例`,
    ``,
    ...(rows.length > 0 ? [`| Skill | 頼み方 | 結果 |`, `| --- | --- | --- |`, ...rows] : [`実例の無い Skill はありません。`]),
    ``,
  ].join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "examples-"));
  try {
    if (command === "run") {
      if (!args.out) throw new Error("--out を指定してください。");
      if (args.prompt && !args.skill) throw new Error("--prompt は --skill と一緒に指定してください。");
      const targets = exampleTargets(ROOT, { only: args.skill || null, prompt: args.prompt || null, triggers: readJsonIfExists(args.triggers) });
      const home = path.join(work, "home");
      const results = await runExamples({
        targets,
        run: (t) => {
          // 動かす Skill だけを置く。ほかの Skill に取られて、別の Skill の出力を実例にしないため
          fs.rmSync(home, { recursive: true, force: true });
          installSkill(ROOT, home, t.name);
          return runCopilot(t.ask, { home, cwd: ROOT, timeout: TIMEOUT_MS, extra: RUN_ARGS });
        },
        cwd: ROOT,
        log: (m) => console.log(m),
      });
      writeJson(args.out, results);
      if (args.summary) fs.appendFileSync(args.summary, summary(results), "utf8");
      if (targets.length > 0 && !Object.values(results).some((r) => r.body)) throw new Error("実例を 1 つも作れませんでした。トークン (COPILOT_GITHUB_TOKEN) と CLI の導入を確かめてください。");
    } else if (command === "save") {
      if (!args.from) throw new Error("--from を指定してください。");
      const written = saveExamples(ROOT, readJson(args.from));
      console.log(written.length > 0 ? `書きました: ${written.map((n) => `${EXAMPLES_DIR}/${n}.md`).join(", ")}` : "書く実例はありません。");
      if (args.written) fs.writeFileSync(args.written, written.join("\n"), "utf8");
    } else {
      throw new Error("使い方: node eng/examples.mjs run|save ...");
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}
