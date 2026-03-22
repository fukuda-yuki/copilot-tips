---
title: Spec Driven Workflow
parent: Guides
nav_order: 74
description: spec / plan / task を軸にした shared workflow
---

## このページの役割

このページは、`requirements.md / design.md / tasks.md` の発想を `memory-bank/spec.md`、`memory-bank/plan.md`、`memory-bank/task.md` に対応付けて運用する `memory-bank-shared-workflow-guidance` plugin を説明します。shared source of truth を 3 ファイルへ絞り、複数 agent や人が同じ task board を見て small step で進めるための plugin です。

## 対象シナリオ

- 要求、設計、実装 task が会話の中に散らばりやすい
- 技術負債、未解決事項、handoff 情報を durable に残したい
- 1 change ごとに docs 更新と owner 明記を強制したい
- `requirements/design/tasks` の発想は使いたいが、運用の正本は `memory-bank/` に寄せたい

## Plugin Catalog

| Plugin | 役割 | 同梱物 | 完成度 |
| --- | --- | --- | --- |
| `memory-bank-shared-workflow-guidance` | 要求、設計、task を `memory-bank/spec.md` / `plan.md` / `task.md` に対応付け、small step の shared workflow に落とす | skill: `memory-bank-shared-workflow-guidance` / reference: `spec-driven-checklist` | thin |

## 対応付け

| 発想 | 運用上の正本 | 何を書くか |
| --- | --- | --- |
| `requirements.md` | `memory-bank/spec.md` | 目的、成功条件、制約、非交渉事項 |
| `design.md` | `memory-bank/plan.md` | いま進める slice、設計方針、検証方法、次の候補 |
| `tasks.md` | `memory-bank/task.md` | owner、status、handoff、next step、evidence |

consumer repo に `requirements.md / design.md / tasks.md` が既にある場合は、mirror や export として扱います。agent 間 handoff の正本は `memory-bank/` に置きます。

## 進め方

1. まず `memory-bank/spec.md` に、案件の目的、制約、done の条件を固定します
2. 次に `memory-bank/plan.md` で active slice と validation を 1 つに絞ります
3. `memory-bank/task.md` に owner、open questions、next step を持つ reviewable task を切ります
4. docs や設計に影響がある変更は、task を閉じる前に該当ファイル更新を必須にします
5. 新しい技術負債や未解決事項は会話で流さず、task か spec へ残します

## 使い分けメモ

- generic starter の導入から始める場合は [71-github-copilot-starter](71-github-copilot-starter.md) を先に使います
- implementation handoff の粒度をそろえるのが主目的なら、この plugin を優先します
- workflow YAML の仕様化が目的なら [73-github-actions-workflow-spec](73-github-actions-workflow-spec.md) を使います
- modernization 案件の task board に寄せる場合は [70-modernization-mentoring](70-modernization-mentoring.md) と併用します
