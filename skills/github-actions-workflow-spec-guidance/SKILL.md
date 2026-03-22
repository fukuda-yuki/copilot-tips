---
name: github-actions-workflow-spec-guidance
description: 既存の GitHub Actions workflow YAML を観測し、`docs/workflow-specs/<workflow-id>.md` の Markdown 仕様へ整理するときに使う skill。新しい CI や delivery policy を設計することが主題なら使わない。
---

# GitHub Actions Workflow Spec Guidance

## Purpose

既存 workflow YAML の observed behavior を、レビューしやすい Markdown 仕様へ変換する。意図の推測ではなく、YAML と実行結果から確認できる事実を整理することを成功とする。

## When to use

- 既存 workflow を AI や人が読みやすい仕様書へ落としたいとき
- trigger、jobs、permissions、artifact、deploy の現状を棚卸ししたいとき
- YAML を直接読む負担を減らしたいとき

## When not to use

- workflow 自体を新規設計したいとき
- `.NET test` と Playwright の job 分割が主題のとき
- approval、promotion、rollback の policy 設計が主題のとき

## Inputs to inspect

- workflow YAML
- run log、artifact、environment の observed behavior
- 関連 README や運用メモ
- `docs/workflow-specs/` の既存仕様書

## Workflow

1. workflow の path、name、trigger、jobs、`needs` を読み取る。
2. workflow-level と job-level の `permissions`、`env`、inputs、secrets を分けて記録する。
3. cache、artifact、approval、deploy、rollback の事実を YAML から拾う。
4. 意図が読み取れない箇所は推測で埋めず、`未確定事項` として残す。
5. `docs/workflow-specs/<workflow-id>.md` に固定章立てで出力する。
6. spec と YAML の差分がないかを最後に見直す。

## Gotchas

- `なぜそうしたか` を推測で書くと仕様書の信頼性が下がる。
- secrets や environment の境界を省略すると保守時に誤読されやすい。
- job の実行順と artifact の受け渡しを落とすと仕様書の価値が下がる。
- spec 作成のついでに workflow 設計を変え始めると役割が崩れる。

## Output

- `docs/workflow-specs/<workflow-id>.md`
- `観測した workflow` `仕様書の出力先` `未確定事項` `レビュー観点` を含む棚卸しメモ

## Validation

- Trigger する prompt:
  - `既存 GitHub Actions workflow を docs/workflow-specs に仕様化したい`
  - `workflow YAML の observed behavior を Markdown に落としたい`
  - `jobs と permissions を人が読める仕様書に変えたい`
- Trigger しない prompt:
  - `deploy approval と rollback policy を新規に設計したい`
  - `.NET test と Playwright の CI 構成を決めたい`
  - `memory-bank/task.md の運用を整えたい`
- Near-miss prompt:
  - `GitHub Actions の broad CI/CD policy を整理したい`
  - `.NET test と E2E をどの job に置くべきか決めたい`

## Trigger risks

### Over-trigger risks

- workflow YAML を見せられるだけで、設計相談にも反応しやすい。
- GitHub Actions 全般の話でも、実体が spec 化ではなく設計なら別 skill が適切になる。

### Under-trigger risks

- `仕様書にしたい` `棚卸ししたい` `observed behavior をまとめたい` も有効な合図。
- `docs/workflow-specs` の語がなくても、既存 YAML の説明書化は対象に含める。

## References

- 出力形を固定したいときだけ `references/workflow-spec-template.md` を読む。
