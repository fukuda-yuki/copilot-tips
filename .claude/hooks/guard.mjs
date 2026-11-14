#!/usr/bin/env node
// Claude Code の PreToolUse hook。やってはいけない操作を、実行前に理由つきで止める。
// 標準入力で受け取った操作が問題なければ何も出さずに exit 0、止めるときは exit 2。
import path from "node:path";
import { fileURLToPath } from "node:url";

const GENERATED = [
  [/^(\.github\/plugin|\.claude-plugin)\/marketplace\.json$/, "これは自動生成ファイルです。plugins/<name>/plugin.json や skills/ を直せば、commit 時に自動で更新されます (手動なら npm run generate)。"],
  [/^dist\//, "dist/ はビルドの出力先です。元の skills/ agents/ plugins/ を編集して npm run build を実行してください。"],
  [/^plugins\/[^/]+\/(skills|agents|com\.github\.copilot)\//, "プラグインのフォルダに実体を置けません。中身は repo ルートの skills/ agents/ に置き、plugin.json で宣言してください。"],
];

const COMMANDS = [
  [/(^|\s)--no-verify(\s|$)|\bgit\b[^|;&]*\bcommit\b[^|;&]*\s-[a-mo-z]*n[a-z]*(\s|$)/, "git hook を飛ばさないでください。hook が失敗したら、表示された原因を直します。"],
  [/core\.hooksPath(?!\s+\.githooks)/, "core.hooksPath は .githooks のままにしてください (npm run setup)。"],
];

/** 止める理由を返す。問題なければ null。 */
export function check(input, root = process.env.CLAUDE_PROJECT_DIR || process.cwd()) {
  const { tool_name: tool, tool_input: args = {} } = input ?? {};
  if (tool === "Bash") {
    const hit = COMMANDS.find(([pattern]) => pattern.test(args.command ?? ""));
    return hit ? hit[1] : null;
  }
  const file = args.file_path ?? args.notebook_path;
  if (!file) return null;
  const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join("/");
  const hit = GENERATED.find(([pattern]) => pattern.test(rel));
  return hit ? `${rel}: ${hit[1]}` : null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let reason = null;
  try { reason = check(JSON.parse(raw)); } catch { /* 読めない入力は止めない */ }
  if (reason) {
    console.error(reason);
    process.exit(2);
  }
}
