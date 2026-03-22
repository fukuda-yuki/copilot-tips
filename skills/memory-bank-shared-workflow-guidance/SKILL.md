---
name: memory-bank-shared-workflow-guidance
description: `memory-bank/spec.md` `memory-bank/plan.md` `memory-bank/task.md` を shared source of truth として継続運用し、owner、next step、handoff を持つ workflow を回すときに使う skill。starter の初期導入や generic project bootstrap が主題なら使わない。
---

# Memory Bank Shared Workflow Guidance

## Purpose

`memory-bank/spec.md` `memory-bank/plan.md` `memory-bank/task.md` を継続運用の正本として使い、複数人や複数 agent が同じ task 状態を追えるようにする。1 つの active slice が明確で、handoff しやすい状態を成功とする。

## When to use

- `memory-bank` を日常的な shared workflow として運用したいとき
- owner、status、next step、handoff を揃えたいとき
- active slice と next slice を混ぜずに進めたいとき
- docs 更新や debt の記録を task 管理に組み込みたいとき

## When not to use

- `memory-bank` をこれから導入する初期 bootstrap が主題のとき
- ASP.NET Core MVC、CI、modernization の個別技術判断が主題のとき
- 単発の個人メモだけで task tracking が不要なとき

## Inputs to inspect

- `memory-bank/spec.md`
- `memory-bank/plan.md`
- `memory-bank/task.md`
- active slice と next slice の状態
- open questions、debt、docs 変更の必要性

## Workflow

1. `spec.md` で長寿命の目的、制約、非交渉条件を確認する。
2. `plan.md` では active slice を 1 つに絞り、次 slice は別枠に残す。
3. `task.md` に `Status` `Owner` `Next step` `Handoff note` を欠かさず書く。
4. behavior や workflow が変わるなら docs 更新を task に含める。
5. evidence と unknowns を task に残し、口頭前提を減らす。
6. handoff 可能な状態になるまで更新し、次の担当者が迷わない形にする。

## Gotchas

- brainstorming をそのまま `task.md` に積むと active slice が見えなくなる。
- owner と next step がない task は handoff で止まりやすい。
- bootstrap 用の判断と継続運用の判断を混ぜると file の役割が壊れる。
- docs 更新を別管理にすると task と実態がずれやすい。

## Output

- `memory-bank` 運用方針
- task 更新メモ
- `Spec updates` `Plan updates` `Task updates` `Debt or unknowns` `Next reviewable change` を含む handoff

## Validation

- Trigger する prompt:
  - `memory-bank/spec plan task を shared workflow として回したい`
  - `owner と handoff を持つ task 管理にしたい`
  - `active slice と next slice を分けて運用したい`
- Trigger しない prompt:
  - `repo に instructions と agents の starter を入れたい`
  - `GitHub Actions workflow を Markdown 仕様化したい`
  - `WebForms から移す次の 1 slice を実装順で決めたい`
- Near-miss prompt:
  - `GitHub Copilot 向けの最初の memory-bank 雛形を入れたい`
  - `modernization の実装 slice を small step で切りたい`

## Trigger risks

### Over-trigger risks

- `memory-bank` の語だけで bootstrap skill と競合しやすい。
- planning 一般論の相談でも、実際には shared workflow 運用ではない場合がある。

### Under-trigger risks

- `handoff` `owner` `next step` `task board` の語だけでもこの skill の対象になり得る。
- `requirements / design / tasks` を `memory-bank` に寄せたい相談も含める。

## References

- `memory-bank` の品質を見直すときだけ `references/spec-driven-checklist.md` を読む。
