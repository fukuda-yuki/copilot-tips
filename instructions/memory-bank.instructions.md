---
applyTo: "memory-bank/**/*.md"
description: "長期プロジェクトの判断、task、既知課題、ツール利用パターンを markdown に残すための GitHub Copilot instruction テンプレート"
---

# Memory Bank Instruction Template

このテンプレートは、`memory-bank/**/*.md` を長期プロジェクトの durable context として保つための instruction です。chat の全文保存ではなく、後続の人や agent が再利用できる事実と判断だけを残します。

## File Roles

- `spec.md`: 非交渉事項、長期に守る前提、アーキテクチャ上の境界
- `plan.md`: いま着手すべき slice と、その次の slice の順序
- `task.md`: 進行中 task、未解決事項、直近の next step
- `knowledge.md`: 確認済みの事実、既知課題、決定履歴、ツール利用パターン

## Recording Rules

- 1 回の更新で、何が確定したか、何が未確定か、次に何をするかを明確にする
- 相対日付ではなく絶対日付を使う
- decision には理由を短く添え、可能なら evidence を残す
- performance 例外や SQL / stored procedure 流用の判断は、測定や観測結果と一緒に残す
- 会話の雰囲気や一時的な思考ではなく、次の作業に必要な durable fact を優先する

## Task Tracking

- task は 1 reviewable change に収まる大きさへ割る
- `Status`, `Owner`, `Open questions`, `Next step` を欠かさない
- subagent に渡すときは、この folder だけ読めば handoff できる状態を目指す

## Output Style

- 箇条書きで短く保つ
- 重複や言い換えを増やさず、更新差分が見えるように書く
- 推測は推測として書き、確認済みの事実と混ぜない
