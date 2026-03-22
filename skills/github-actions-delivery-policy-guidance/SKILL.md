---
name: github-actions-delivery-policy-guidance
description: GitHub Actions で deploy、promotion、environment、approval、artifact、rollback の policy layer を設計するときに使う skill。`.NET test` や Playwright の CI job 構成だけが主題なら使わない。
---

# GitHub Actions Delivery Policy Guidance

## Purpose

GitHub Actions の delivery workflow を、環境昇格、承認、artifact、rollback の観点で整理する。CI と deploy を混ぜず、運用時の判断線が明確な状態を成功とする。

## When to use

- deploy workflow の environment と promotion path を決めたいとき
- manual approval や protection rule を設計したいとき
- artifact と rollback の扱いを整理したいとき
- broad CI/CD policy を文章で揃えたいとき

## When not to use

- `.NET test` や Playwright の CI 実行設計が主題のとき
- 既存 workflow YAML を仕様書化したいだけのとき
- repo bootstrap や memory-bank 運用が主題のとき

## Inputs to inspect

- deploy 対象 environment と promotion 順序
- 現行 workflow と release 手順
- secrets、approval、protection rule
- build artifact と deploy artifact の流れ
- rollback 条件と運用時の復旧期待

## Workflow

1. PR validation と deployment workflow を明確に分ける。
2. environment ごとの promotion path と承認境界を決める。
3. build artifact をどこで確定し、どこで再利用するかを決める。
4. rollback を誰が、どの artifact / version に対して行うかを明記する。
5. secrets と permissions を environment 境界に沿って分離する。
6. `Lifecycle split` `Permissions and secrets` `Artifacts and cache` `Promotion and rollback` `Open risks` の形で残す。

## Gotchas

- CI と production deploy を同じ workflow に詰めると責務が濁りやすい。
- deploy 時に毎回 rebuild すると rollback が不透明になりやすい。
- environment secrets を build-time secrets と混ぜると漏えい範囲が広がる。
- rollback 経路が曖昧だと、事故時に人手判断が増える。

## Output

- broad CI/CD policy メモ
- deploy / promotion / rollback 設計レビュー
- `Lifecycle split` `Permissions and secrets` `Artifacts and cache` `Promotion and rollback` `Open risks` を含む方針書

## Validation

- Trigger する prompt:
  - `GitHub Actions の deploy approval と promotion path を整理したい`
  - `artifact と rollback を含む delivery policy を決めたい`
  - `environment ごとの secrets と protection rule を設計したい`
- Trigger しない prompt:
  - `.NET test と Playwright をどの job に分けるべきか決めたい`
  - `workflow YAML の observed behavior を Markdown 仕様にしたい`
  - `ASP.NET Core MVC の Controller から service へ責務を逃がしたい`
- Near-miss prompt:
  - `GitHub Actions の cache と matrix を見直したい`
  - `既存 workflow を読みやすい docs にしたい`

## Trigger risks

### Over-trigger risks

- `GitHub Actions` `CI/CD` だけで CI skill や workflow spec skill まで巻き取りやすい。
- artifact の語だけで cache 設計の相談にも反応しやすい。

### Under-trigger risks

- `approval` `promotion` `rollback` `environment` のいずれか一つでも主題なら有効な対象。
- deploy path を文章化したいだけの相談もこの skill に含める。

## References

- simple CI を超えて delivery policy を決めるときだけ `references/cicd-rollout-checklist.md` を読む。
