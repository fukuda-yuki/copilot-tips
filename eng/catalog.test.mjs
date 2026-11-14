import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { COMPOSITION_NS, PLUGIN_SCHEMA_URL, readJson } from "./lib.mjs";
import { validateCatalog } from "./validate.mjs";
import { buildDist } from "./build-dist.mjs";

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** skill 1 つ・agent 1 つ・それを束ねる plugin 1 つの最小カタログを作る。 */
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-"));
  write(path.join(root, "skills/hello/SKILL.md"), "---\nname: hello\ndescription: あいさつする\n---\n\n本文\n");
  write(path.join(root, "skills/hello/references/note.md"), "note\n");
  write(path.join(root, "agents/guide.agent.md"), "---\ndescription: 案内する\n---\n\n本文\n");
  write(path.join(root, "instructions/style.instructions.md"), "---\napplyTo: \"**/*.md\"\ndescription: 文体\n---\n");
  write(path.join(root, "plugins/hello-pack/README.md"), "# hello-pack\n");
  write(path.join(root, "plugins/hello-pack/plugin.json"), JSON.stringify({
    $schema: PLUGIN_SCHEMA_URL,
    name: "hello-pack",
    description: "あいさつ一式",
    version: "1.0.0",
    extensions: { [COMPOSITION_NS]: { skills: ["./skills/hello/"], agents: ["./agents/guide.md"] } },
  }));
  return root;
}

test("このリポジトリ自体が検証を通る", () => {
  assert.deepEqual(validateCatalog().errors, []);
});

test("最小カタログは検証を通る", () => {
  assert.deepEqual(validateCatalog(fixture()).errors, []);
});

test("存在しない skill への参照はエラーになる", () => {
  const root = fixture();
  fs.rmSync(path.join(root, "skills/hello"), { recursive: true });
  assert.match(validateCatalog(root).errors.join("\n"), /skills\/hello が存在しません/);
});

test("SKILL.md の name がフォルダ名と違うとエラーになる", () => {
  const root = fixture();
  write(path.join(root, "skills/hello/SKILL.md"), "---\nname: other\ndescription: x\n---\n");
  assert.match(validateCatalog(root).errors.join("\n"), /フォルダ名と一致/);
});

test("正本のプラグインに生成物が置かれているとエラーになる", () => {
  const root = fixture();
  write(path.join(root, "plugins/hello-pack/skills/hello/SKILL.md"), "x");
  assert.match(validateCatalog(root).errors.join("\n"), /生成物を正本に置かないでください/);
});

test("配布物にプラグインが実体化され、同梱宣言は取り除かれる", () => {
  const root = fixture();
  const outDir = path.join(root, "dist");
  buildDist({ root, outDir });

  const plugin = path.join(outDir, "plugins/hello-pack");
  assert.ok(fs.existsSync(path.join(plugin, "skills/hello/SKILL.md")));
  assert.ok(fs.existsSync(path.join(plugin, "skills/hello/references/note.md")));
  assert.ok(fs.existsSync(path.join(plugin, "com.github.copilot/agents/guide.md")));
  assert.deepEqual(readJson(path.join(plugin, "plugin.json")), {
    $schema: PLUGIN_SCHEMA_URL,
    name: "hello-pack",
    version: "1.0.0",
    description: "あいさつ一式",
  });

  const copilot = readJson(path.join(outDir, ".github/plugin/marketplace.json"));
  assert.deepEqual(copilot.plugins, [
    { name: "hello-pack", source: "plugins/hello-pack", description: "あいさつ一式", version: "1.0.0" },
  ]);
  const claude = readJson(path.join(outDir, ".claude-plugin/marketplace.json"));
  assert.equal(claude.plugins[0].source, "./plugins/hello-pack");

  assert.ok(fs.existsSync(path.join(outDir, "skills/hello/SKILL.md")));
  assert.ok(fs.existsSync(path.join(outDir, "instructions/style.instructions.md")));
  assert.match(fs.readFileSync(path.join(outDir, "README.md"), "utf8"), /hello-pack@copilot-tips/);
  // 正本は書き換えない
  assert.ok(!fs.existsSync(path.join(root, "plugins/hello-pack/skills")));
});

test("検証エラーがあると配布物を生成しない", () => {
  const root = fixture();
  fs.rmSync(path.join(root, "agents/guide.agent.md"));
  assert.throws(() => buildDist({ root, outDir: path.join(root, "dist") }), /検証エラー/);
});
