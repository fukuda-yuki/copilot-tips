#!/usr/bin/env node
// Skill の「頼み方」(description の「」の中) を Copilot CLI に 1 つずつ渡し、その Skill が呼ばれるかを確かめる。外部依存なし。
//  - 本物の Skill は動かさない。name と description だけを写し、本文を「目印を出して終える」に差し替えた写しを使う。
//    呼ばれるかどうかは name と description で決まるので、これで足りる。通信・ファイルの書き込み・時間のかかる処理は起きない
//  - 全 Skill の写しを一緒に置く。似た Skill に取られないかも分かる
//  - 結果は triggers.json に書く。board.mjs は、呼ばれると確かめた頼み方を先に並べるのに使う。
//    呼ばれなかった頼み方はページには出さず、実行結果の要約 (--summary) でメンテナーに知らせる
//  - Copilot CLI を実行できなかった頼み方は「不明」として前回の結果を残す。1 つも実行できない・1 つも呼ばれないときは失敗し、ファイルを書き換えない
//    (写しが読み込まれていない、認証に失敗したのに正常終了した、を「全部呼ばれなかった」と記録しないため)
//  - 「〜」「〇〇」の入った頼み方は、語を埋めて使う形なので確かめない
//
// 使い方 (GitHub Actions から実行する。Copilot の利用枠を、頼み方 1 つにつき 1 回ぶん使う):
//   COPILOT_GITHUB_TOKEN=... node eng/trigger-check.mjs --out <triggers.json> [--summary <file.md>] [--skill <name>]
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, loadCatalog, parseArgs, readFrontmatter, readJsonIfExists, writeJson, writeText } from "./lib.mjs";
import { askPhrases, descriptionHash } from "./board.mjs";

/** 1 回の実行を待つ時間。 */
const TIMEOUT_MS = 180_000;

/** 写しの Skill が読み込まれたときに出させる目印。 */
export const marker = (skill) => `SKILL-LOADED:${skill}`;
const MARKER_PATTERN = /SKILL-LOADED:([a-z0-9-]+)/g;

/** 語を埋めて使う頼み方 (「〜に使える Skill ある?」「〇〇の新着見て」)。そのまま送っても意味が通らないので確かめない。 */
const PLACEHOLDER = /[〜～]|〇〇|○○/;

/** 全 Skill の name と description。 */
const describedSkills = (root) => loadCatalog(root).skills.map((s) => ({ name: s.name, description: readFrontmatter(s.file)?.description ?? "" }));

/** 確かめる対象。頼み方の無い Skill は含めない。 */
export function checkTargets(root = ROOT, only = null) {
  return describedSkills(root)
    .map((s) => ({ ...s, phrases: askPhrases(s.description).filter((p) => !PLACEHOLDER.test(p)) }))
    .filter((s) => s.phrases.length > 0 && (!only || s.name === only));
}

/** 写しの SKILL.md。name と description は本物と同じ、本文は目印を出すだけ。 */
export function stubSkill(name, description) {
  return `---
name: ${name}
description: ${JSON.stringify(description)}
---

これは動作確認用の写し。この Skill を読み込んだら、\`${marker(name)}\` とだけ出力して終える。ほかの作業・ツールの呼び出し・質問はしない。
`;
}

/** Copilot CLI の設定の置き場。HOME を作業用フォルダに向けたときの既定の場所 (~/.copilot) と同じにして、どちらで探されても写しが読まれるようにする。 */
export const copilotHome = (home) => path.join(home, ".copilot");

/** 全 Skill の写しを、Copilot CLI の個人用の置き場 (<home>/.copilot/skills) に書く。 */
export function writeStubs(root, home) {
  for (const { name, description } of describedSkills(root)) {
    writeText(path.join(copilotHome(home), "skills", name, "SKILL.md"), stubSkill(name, description));
  }
}

/** 出力から、読み込まれた Skill の名前を取り出す。 */
export function loadedSkills(output) {
  return [...new Set([...String(output ?? "").matchAll(MARKER_PATTERN)].map((m) => m[1]))];
}

/**
 * Copilot CLI を 1 回実行して出力を返す。実行できなければ例外。
 * ツールの許可は与えない (--allow-all-tools を付けない)。写しは何もしないので要らず、頼み方の文を作業として実行させないため。
 */
export function runCopilot(prompt, { home, cwd, bin = "copilot", timeout = TIMEOUT_MS } = {}) {
  const args = ["-p", prompt, "-s", "--no-ask-user", "--no-custom-instructions", "--disable-builtin-mcps"];
  return new Promise((resolve, reject) => {
    execFile(bin, args, { cwd, timeout, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, HOME: home, USERPROFILE: home, COPILOT_HOME: copilotHome(home) } }, (error, stdout, stderr) => {
      // 目印が出ていれば、終了コードが 0 でなくても結果として使う (許可の無いツールを呼ぼうとして止まる場合がある)
      if (error && loadedSkills(stdout).length === 0) reject(new Error(String(stderr || error.message).trim().slice(0, 500)));
      else resolve(stdout);
    });
  });
}

/**
 * 全対象の頼み方を確かめて、結果を返す。run は (prompt) => 出力。テストでは差し替える。
 * 実行できなかった頼み方は、前回 (previous) の結果が同じ description のものなら引き継ぎ、無ければ載せない。
 */
export async function check({ targets, run, previous = null, now = new Date(), log = () => {} }) {
  const skills = {};
  let ran = 0, failed = 0;
  for (const target of targets) {
    const hash = descriptionHash(target.description);
    const before = previous?.skills?.[target.name]?.hash === hash ? previous.skills[target.name].phrases : {};
    const phrases = {};
    for (const phrase of target.phrases) {
      try {
        const loaded = loadedSkills(await run(phrase));
        phrases[phrase] = { fired: loaded.includes(target.name), loaded, checkedAt: now.toISOString() };
        ran++;
        log(`${phrases[phrase].fired ? "ok  " : "miss"} ${target.name}: 「${phrase}」${loaded.length > 0 && !phrases[phrase].fired ? ` (呼ばれたのは ${loaded.join(", ")})` : ""}`);
      } catch (e) {
        failed++;
        if (before?.[phrase]) phrases[phrase] = before[phrase];
        log(`err  ${target.name}: 「${phrase}」 ${e.message}`);
      }
    }
    skills[target.name] = { hash, phrases };
  }
  return { result: { generatedAt: now.toISOString(), skills }, ran, failed };
}

/** 今回確かめなかった Skill の前回の結果を残して、今回の結果を重ねる (--skill で 1 つだけ確かめたとき)。カタログに無い Skill の記録は捨てる。 */
export function mergeResults(previous, result, names) {
  const kept = Object.fromEntries(Object.entries(previous?.skills ?? {}).filter(([name]) => names.includes(name)));
  return { ...result, skills: { ...kept, ...result.skills } };
}

/** 今回の実行で、呼ばれた頼み方の数。 */
export const firedCount = (result, since) => Object.values(result.skills)
  .flatMap((s) => Object.values(s.phrases)).filter((r) => r.fired && r.checkedAt === since).length;

/** メンテナー向けの要約 (Markdown)。呼ばれなかった頼み方を挙げる。 */
export function summary(result, { ran, failed }) {
  const rows = Object.entries(result.skills).flatMap(([name, s]) => Object.entries(s.phrases)
    .filter(([, r]) => !r.fired)
    .map(([phrase, r]) => `| \`${name}\` | ${phrase.replace(/\|/g, "\\|")} | ${r.loaded.length > 0 ? r.loaded.map((x) => `\`${x}\``).join(" ") : "なし"} |`));
  const total = Object.values(result.skills).reduce((a, s) => a + Object.keys(s.phrases).length, 0);
  return [
    `## 頼み方の確認`,
    ``,
    `確かめた頼み方 ${ran} 件、実行できなかったもの ${failed} 件。記録にある ${total} 件のうち、呼ばれなかったもの ${rows.length} 件。`,
    ``,
    ...(rows.length > 0
      ? [`| Skill | 頼み方 | 代わりに呼ばれた Skill |`, `| --- | --- | --- |`, ...rows, ``, `呼ばれなかった頼み方は、description の書き方を見直すか、「」から外す。1 回だけの結果なので、直す前にもう一度実行して確かめる。`]
      : [`すべて呼ばれた。`]),
    ``,
  ].join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "trigger-check-"));
  try {
    if (!args.out) throw new Error("--out を指定してください。");
    const targets = checkTargets(ROOT, args.skill);
    if (targets.length === 0) throw new Error("確かめる頼み方がありません。");
    const home = path.join(work, "home");
    const cwd = path.join(work, "cwd");
    fs.mkdirSync(cwd, { recursive: true });
    writeStubs(ROOT, home);
    const previous = readJsonIfExists(args.out);
    const { result, ran, failed } = await check({ targets, previous, run: (prompt) => runCopilot(prompt, { home, cwd }), log: (m) => console.log(m) });
    const merged = mergeResults(previous, result, loadCatalog(ROOT).skills.map((s) => s.name));
    if (ran === 0) throw new Error("Copilot CLI を 1 回も実行できませんでした。結果は書き換えていません。トークン (COPILOT_GITHUB_TOKEN) と CLI の導入を確かめてください。");
    if (firedCount(result, result.generatedAt) === 0) throw new Error("どの頼み方でも Skill が呼ばれませんでした。写しの Skill が読み込まれていないか、認証に失敗している可能性があります。結果は書き換えていません。");
    if (args.summary) fs.appendFileSync(args.summary, summary(merged, { ran, failed }), "utf8");
    writeJson(args.out, merged);
    console.log(`確かめました: ${ran} 件 (実行できなかったもの ${failed} 件)`);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}
