#!/usr/bin/env node
// 中身が変わったプラグインの version が上がっているかを、基準ブランチとの差分で検証する。
// 利用者側の更新検知は version に頼っているので、上げ忘れると変更が届かない。
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, CATALOG, GIT_ENV, loadCatalog, readComposition, readJson } from "./lib.mjs";

const git = (root, ...args) => execFileSync("git", args, { cwd: root, env: GIT_ENV, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

const newer = (a, b) => {
  const [x, y] = [a, b].map((v) => String(v).split("-")[0].split(".").map(Number));
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
  return false;
};

/** version を上げる必要があるのに上がっていないプラグインを、エラー文の配列で返す。 */
export function checkVersions({ root = ROOT, base = `origin/${CATALOG.sourceBranch}` } = {}) {
  let mergeBase;
  try { mergeBase = git(root, "merge-base", base, "HEAD").trim(); }
  catch { return { errors: [], skipped: `基準 (${base}) が見つからないため確認を省略しました` }; }

  const errors = [];
  for (const plugin of loadCatalog(root).plugins) {
    const manifestRel = `plugins/${plugin.name}/plugin.json`;
    let baseVersion;
    try { baseVersion = JSON.parse(git(root, "show", `${mergeBase}:${manifestRel}`)).version; }
    catch { continue; } // 基準に無い = 新しいプラグイン

    let manifest, composition;
    try { manifest = readJson(plugin.manifestFile); composition = readComposition(manifest); }
    catch { continue; } // 壊れた plugin.json は validate が報告する

    const paths = [
      `plugins/${plugin.name}`,
      ...composition.skills.map((s) => `skills/${s}`),
      ...composition.agents.map((a) => `agents/${a}.agent.md`),
    ];
    // 作業ツリーと比べるので、commit 前の変更も対象になる
    const changed = git(root, "diff", "--name-only", mergeBase, "--", ...paths).split("\n").filter(Boolean);
    if (changed.length > 0 && !newer(manifest.version, baseVersion)) {
      errors.push(`${manifestRel}: 中身が変わっています (${changed[0]} など ${changed.length} 件)。version を ${baseVersion} より上げてください`);
    }
  }
  return { errors };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors, skipped } = checkVersions({ base: process.argv[2] });
  if (skipped) console.warn(`warning: ${skipped}`);
  for (const e of errors) console.error(`error: ${e}`);
  if (errors.length > 0) process.exit(1);
  console.log("version 確認 OK");
}
