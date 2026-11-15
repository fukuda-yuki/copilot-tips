import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readFrontmatter } from "./lib.mjs";
import { descriptionHash } from "./board.mjs";
import { check, checkTargets, copilotHome, firedCount, loadedSkills, marker, mergeResults, missingTargetMessage, runCopilot, stubSkill, summary, writeStubs } from "./trigger-check.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "trigger-"));
  const write = (name, description, body) => {
    fs.mkdirSync(path.join(root, "skills", name), { recursive: true });
    fs.writeFileSync(path.join(root, "skills", name, "SKILL.md"), `---\nname: ${name}\ndescription: ${description}\n---\n${body}`);
  };
  write("doc", '点検する。「診断して」「"引用符" の入った: 頼み方」「〜を点検して」「〇〇の設定を見て」の依頼で使う。', "本物の手順。rm -rf を実行する。\n");
  write("plain", "頼み方の無い Skill", "本文\n");
  return root;
}

test("確かめる対象は頼み方のある Skill だけで、語を埋めて使う頼み方は外す", () => {
  const targets = checkTargets(fixture());
  assert.deepEqual(targets.map((t) => [t.name, t.phrases]), [["doc", ["診断して", '"引用符" の入った: 頼み方']]]);
  assert.deepEqual(checkTargets(fixture(), "plain"), []);
  assert.ok(checkTargets().length > 0, "このリポジトリに確かめる頼み方がある");
});

test("--skill で確かめられないときは、指定した名前と、指定できる名前を挙げる", () => {
  const root = fixture();
  assert.equal(missingTargetMessage(root, "docer"), "docer という Skill はありません。指定できるのは doc です。");
  assert.equal(missingTargetMessage(root, "plain"), "plain には確かめる頼み方がありません。指定できるのは doc です。");
  assert.equal(missingTargetMessage(root), "確かめる頼み方がありません。", "指定が無いときは従来のメッセージのまま");
});

test("写しは name と description が本物と同じで、本文は目印を出すだけ", () => {
  const root = fixture();
  const home = path.join(root, "home");
  writeStubs(root, home);
  for (const name of ["doc", "plain"]) {
    const stub = path.join(copilotHome(home), "skills", name, "SKILL.md");
    const text = fs.readFileSync(stub, "utf8");
    const real = readFrontmatter(path.join(root, "skills", name, "SKILL.md"));
    assert.equal(/^name: (.+)$/m.exec(text)[1], real.name);
    assert.equal(JSON.parse(/^description: (.+)$/m.exec(text)[1]), real.description, "description は引用符つきの 1 行にして、記号で YAML が壊れないようにする");
    assert.ok(text.includes(marker(name)));
    assert.doesNotMatch(text, /本物の手順|rm -rf|^本文$/m, "本物の本文は写さない");
  }
  assert.match(stubSkill("a", "x"), /^---\nname: a\ndescription: "x"\n---\n/);
});

test("出力の目印から、読み込まれた Skill を取り出す", () => {
  assert.deepEqual(loadedSkills(`x ${marker("doc")} y\n${marker("doc")} ${marker("other-skill")}`), ["doc", "other-skill"]);
  assert.deepEqual(loadedSkills("何も出ていない"), []);
});

test("頼み方ごとに、呼ばれた・別の Skill に取られた・実行できなかったを分けて記録する", async () => {
  const [target] = checkTargets(fixture());
  const now = new Date("2026-11-15T00:00:00Z");
  const hash = descriptionHash(target.description);
  const outputs = { 診断して: marker("doc"), '"引用符" の入った: 頼み方': marker("plain") };
  const first = await check({ targets: [target], now, run: async (p) => outputs[p] });
  assert.deepEqual(first, {
    result: {
      generatedAt: now.toISOString(),
      skills: { doc: { hash, phrases: {
        診断して: { fired: true, loaded: ["doc"], checkedAt: now.toISOString() },
        '"引用符" の入った: 頼み方': { fired: false, loaded: ["plain"], checkedAt: now.toISOString() },
      } } },
    },
    ran: 2, failed: 0,
  });

  const failing = async () => { throw new Error("auth"); };
  const kept = await check({ targets: [target], previous: first.result, run: failing });
  assert.deepEqual(kept.result.skills.doc.phrases, first.result.skills.doc.phrases, "実行できなければ前回の結果を残す");
  assert.deepEqual([kept.ran, kept.failed], [0, 2]);

  const stale = { skills: { doc: { hash: "old", phrases: first.result.skills.doc.phrases } } };
  assert.deepEqual((await check({ targets: [target], previous: stale, run: failing })).result.skills.doc.phrases, {}, "description が変わる前の結果は引き継がない");
});

test("1 つだけ確かめたときは、ほかの Skill の結果を残し、カタログに無い Skill の記録は捨てる", () => {
  const merged = mergeResults({ generatedAt: "a", skills: { x: 1, y: 2, gone: 9 } }, { generatedAt: "b", skills: { y: 3 } }, ["x", "y"]);
  assert.deepEqual(merged, { generatedAt: "b", skills: { x: 1, y: 3 } });
  assert.deepEqual(mergeResults(null, { generatedAt: "b", skills: { y: 3 } }, ["y"]), { generatedAt: "b", skills: { y: 3 } });
});

test("今回の実行で呼ばれた数は、引き継いだ前回の結果を数えない", () => {
  const result = { skills: { a: { phrases: { p: { fired: true, checkedAt: "now" }, q: { fired: true, checkedAt: "before" }, r: { fired: false, checkedAt: "now" } } } } };
  assert.equal(firedCount(result, "now"), 1);
  assert.equal(firedCount({ skills: { a: { phrases: { q: { fired: true, checkedAt: "before" } } } } }, "now"), 0);
});

test("要約には、呼ばれなかった頼み方と代わりに呼ばれた Skill を挙げる", () => {
  const result = { skills: { doc: { phrases: { a: { fired: true, loaded: ["doc"] }, "b|c": { fired: false, loaded: ["plain"] }, d: { fired: false, loaded: [] } } } } };
  const text = summary(result, { ran: 3, failed: 0 });
  assert.match(text, /\| `doc` \| b\\\|c \| `plain` \|/);
  assert.match(text, /\| `doc` \| d \| なし \|/);
  assert.doesNotMatch(text, /\| a \|/);
  assert.match(summary({ skills: { doc: { phrases: { a: { fired: true, loaded: ["doc"] } } } } }, { ran: 1, failed: 0 }), /すべて呼ばれた。/);
});

// 代役の CLI はシェルスクリプトなので、Windows では実行できない
const noShell = process.platform === "win32" && "Windows には /bin/sh が無い";

test("Copilot CLI にはツールの許可を与えず、設定の置き場を写しに向ける", { skip: noShell }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "copilot-"));
  const bin = path.join(dir, "copilot");
  fs.writeFileSync(bin, '#!/bin/sh\nprintf "%s\\n" "$HOME" "$COPILOT_HOME" "$@"\n', { mode: 0o755 });
  const out = await runCopilot("頼み方", { home: "/h", cwd: dir, bin });
  assert.deepEqual(out.trim().split("\n"), ["/h", "/h/.copilot", "-p", "頼み方", "-s", "--no-ask-user", "--no-custom-instructions", "--disable-builtin-mcps"]);
  assert.doesNotMatch(out, /allow/);

  fs.writeFileSync(bin, "#!/bin/sh\necho no auth >&2\nexit 1\n", { mode: 0o755 });
  await assert.rejects(runCopilot("x", { home: "/h", cwd: dir, bin }), /no auth/);
  fs.writeFileSync(bin, `#!/bin/sh\necho ${marker("doc")}\nexit 1\n`, { mode: 0o755 });
  assert.match(await runCopilot("x", { home: "/h", cwd: dir, bin }), /SKILL-LOADED:doc/);
});
