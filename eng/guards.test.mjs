import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { COMPOSITION_NS, PLUGIN_SCHEMA_URL, ROOT } from "./lib.mjs";
import { checkVersions } from "./check-versions.mjs";
import { check } from "../.claude/hooks/guard.mjs";

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** plugin 1 つを commit 済みの git リポジトリを作る。base ブランチが基準。 */
function repo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "versions-"));
  const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "pipe" });
  const manifest = (version) => write(path.join(root, "plugins/pack/plugin.json"), JSON.stringify({
    $schema: PLUGIN_SCHEMA_URL, name: "pack", description: "d", version,
    extensions: { [COMPOSITION_NS]: { skills: ["./skills/hello/"] } },
  }));
  write(path.join(root, "skills/hello/SKILL.md"), "---\nname: hello\ndescription: d\n---\n");
  manifest("1.0.0");
  git("init", "-q", "-b", "base");
  git("-c", "user.name=t", "-c", "user.email=t@example.com", "add", "-A");
  git("-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "-qm", "init");
  git("checkout", "-qb", "work");
  return { root, manifest };
}

test("中身が同じなら version はそのままでよい", () => {
  const { root } = repo();
  assert.deepEqual(checkVersions({ root, base: "base" }).errors, []);
});

test("同梱する skill を変えたら version を上げる必要がある", () => {
  const { root, manifest } = repo();
  fs.appendFileSync(path.join(root, "skills/hello/SKILL.md"), "追記\n");
  assert.match(checkVersions({ root, base: "base" }).errors.join("\n"), /plugins\/pack\/plugin\.json: 中身が変わっています/);
  manifest("1.0.1");
  assert.deepEqual(checkVersions({ root, base: "base" }).errors, []);
});

test("基準ブランチが無ければ確認を省略する", () => {
  const { root } = repo();
  assert.ok(checkVersions({ root, base: "no-such-branch" }).skipped);
});

test("Claude Code の hook は生成ファイルの編集と hook の回避を止める", () => {
  const edit = (file_path) => check({ tool_name: "Edit", tool_input: { file_path } }, ROOT);
  const bash = (command) => check({ tool_name: "Bash", tool_input: { command } }, ROOT);

  assert.ok(edit(path.join(ROOT, ".github/plugin/marketplace.json")));
  assert.ok(edit(".claude-plugin/marketplace.json"));
  assert.ok(edit("dist/README.md"));
  assert.ok(edit("plugins/pack/skills/hello/SKILL.md"));
  assert.equal(edit("plugins/pack/plugin.json"), null);
  assert.equal(edit("skills/hello/SKILL.md"), null);

  assert.ok(bash("git commit --no-verify -m 'x'"));
  assert.ok(bash("git commit -nm 'x'"));
  assert.ok(bash("git config core.hooksPath /dev/null"));
  assert.equal(bash("git commit -m 'docs: update'"), null);
  assert.equal(bash("git config core.hooksPath .githooks"), null);
  assert.equal(bash("npm test"), null);
});
