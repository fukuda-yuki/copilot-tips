import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { EXAMPLE_MAX_LINES, readExample } from "./lib.mjs";
import { descriptionHash } from "./board.mjs";
import { marker, runCopilot } from "./trigger-check.mjs";
import { RUN_ARGS, excerpt, exampleTargets, installSkill, runExamples, saveExamples, summary } from "./examples.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "examples-"));
  const write = (file, text) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  };
  write("skills/doc/SKILL.md", "---\nname: doc\ndescription: 点検する。「診断して」「doctor」「〜を点検して」の依頼で使う。\n---\n本物の手順\n");
  write("skills/doc/references/r.md", "資料\n");
  write("skills/done/SKILL.md", "---\nname: done\ndescription: 済み。「済ませて」\n---\n");
  write("examples/done.md", "---\nask: 済ませて\n---\n\n前からある実例\n");
  write("skills/plain/SKILL.md", "---\nname: plain\ndescription: 頼み方なし\n---\n");
  return root;
}

test("実例の無い Skill だけを対象にし、呼ばれると確かめた頼み方を先に選ぶ", () => {
  const root = fixture();
  assert.deepEqual(exampleTargets(root), [{ name: "doc", ask: "診断して", verified: false }]);
  const description = "点検する。「診断して」「doctor」「〜を点検して」の依頼で使う。";
  const triggers = { skills: { doc: { hash: descriptionHash(description), phrases: { 診断して: { fired: false }, doctor: { fired: true } } } } };
  assert.deepEqual(exampleTargets(root, { triggers }), [{ name: "doc", ask: "doctor", verified: true }]);
  assert.deepEqual(exampleTargets(root, { only: "doc", prompt: "この設定を見て" }), [{ name: "doc", ask: "この設定を見て", verified: false }]);
  assert.deepEqual(exampleTargets(root, { only: "done" }), [], "実例のある Skill は動かさない");
});

test("本物の Skill を丸ごと写し、動いたと分かる目印を出させる", () => {
  const root = fixture();
  const home = path.join(root, "home");
  installSkill(root, home, "doc");
  const skill = fs.readFileSync(path.join(home, ".copilot/skills/doc/SKILL.md"), "utf8");
  assert.match(skill, /本物の手順/);
  assert.ok(skill.includes(marker("doc")));
  assert.ok(fs.existsSync(path.join(home, ".copilot/skills/doc/references/r.md")));
  assert.match(fs.readFileSync(path.join(root, "skills/doc/SKILL.md"), "utf8"), /^---[\s\S]*本物の手順\n$/, "正本は変えない");
});

test("出力から目印の行を除いて抜粋にし、目印が無ければ実例にしない", () => {
  assert.equal(excerpt("doc", `\n${marker("doc")}\n\n結果 1\n結果 2  \n\n`), "結果 1\n結果 2");
  assert.equal(excerpt("doc", "結果だけ"), null);
  assert.equal(excerpt("doc", `${marker("other")}\n結果`), null, "別の Skill の出力は使わない");
  assert.equal(excerpt("doc", `${marker("doc")}\n`), null);
  // Copilot CLI 1.0.112 で実際に出た形: 途中経過、下調べの結果の塊、作業場所の絶対パスの後に本文が来る
  const real = [
    marker("doc"),
    "範囲を確認します。",
    "",
    "<final_answer>",
    "/work/repo/skills/doc/SKILL.md:1-48",
    "</final_answer>",
    "",
    "",
    "## 監査レポート",
    "",
    "",
    "- /work/repo/AGENTS.md 12 行目",
  ].join("\n");
  assert.equal(excerpt("doc", real, { cwd: "/work/repo" }), "## 監査レポート\n\n- AGENTS.md 12 行目");
  assert.equal(excerpt("doc", `${marker("doc")}\n前置き\n本文`), "前置き\n本文", "見出しが無ければ全部を使う");
  const long = excerpt("doc", `${marker("doc")}\n${Array.from({ length: 50 }, (_, i) => `行 ${i}`).join("\n")}`).split("\n");
  assert.equal(long.length, EXAMPLE_MAX_LINES);
  assert.equal(long.at(-1), "…");
});

test("書くのはカタログにあって実例の無い Skill だけで、書いたものは検証を通る形になる", async () => {
  const root = fixture();
  const results = await runExamples({
    targets: [{ name: "doc", ask: "診断して", verified: true }, { name: "x", ask: "y", verified: false }],
    run: async (t) => (t.name === "doc" ? `${marker("doc")}\n報告` : Promise.reject(new Error("no auth"))),
  });
  assert.deepEqual(results, { doc: { ask: "診断して", verified: true, body: "報告" }, x: { ask: "y", error: "no auth" } });
  results.done = { ask: "上書き", body: "上書き" };
  results["../evil"] = { ask: "a", body: "b" };
  assert.deepEqual(saveExamples(root, results), ["doc"]);
  assert.deepEqual(readExample(root, "doc"), { ask: "診断して", output: "報告" });
  assert.match(fs.readFileSync(path.join(root, "examples/done.md"), "utf8"), /前からある実例/);
  assert.deepEqual(fs.readdirSync(path.join(root, "examples")).sort(), ["doc.md", "done.md"]);
  assert.match(summary(results), /\| `x` \| y \| 作れなかった: no auth \|/);
});

// 代役の CLI はシェルスクリプトなので、Windows では実行できない
const noShell = process.platform === "win32" && "Windows には /bin/sh が無い";

test("Copilot CLI には、シェル・書き込み・記憶を禁じ、トークンを隠す引数を渡す", { skip: noShell }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "copilot-"));
  const bin = path.join(dir, "copilot");
  fs.writeFileSync(bin, `#!/bin/sh\necho ${marker("doc")}\nprintf "%s\\n" "$@"\n`, { mode: 0o755 });
  const args = (await runCopilot("診断して", { home: "/h", cwd: dir, bin, extra: RUN_ARGS })).trim().split("\n").slice(1);
  assert.deepEqual(args.slice(0, 2), ["-p", "診断して"]);
  assert.ok(args.includes("--no-custom-instructions") && args.includes("--disallow-temp-dir"));
  const deny = args.indexOf("--deny-tool");
  assert.deepEqual(args.slice(deny + 1, deny + 4), ["shell", "write", "memory"]);
  assert.ok(!args.includes("--allow-all-tools") && !args.includes("--allow-all") && !args.includes("--yolo"));
  assert.match(args[args.indexOf("--secret-env-vars") + 1], /COPILOT_GITHUB_TOKEN/);
});
