---
name: dotnet-playwright-ci-guidance
description: GitHub Actions で `.NET test` と Playwright を回す CI を設計するときに、job 分割、permissions、matrix、cache、実行コストを整理するために使う skill。promotion、approval、rollback など delivery policy が主題なら使わない。
---

# Dotnet Playwright CI Guidance

## Purpose

`.NET test` と Playwright を GitHub Actions 上で無理なく回す CI を設計する。最小権限、段階的な job 分割、実行コストの管理が揃っている状態を成功とする。

## When to use

- restore / build / test / Playwright の job 構成を決めたいとき
- `.NET test` と Playwright を同じ workflow 内でどう分けるか整理したいとき
- `permissions`、matrix、cache、runtime cost を見直したいとき
- flaky な browser job を CI 観点で切り分けたいとき

## When not to use

- environment、approval、promotion、rollback が主題のとき
- 既存 workflow を Markdown 仕様へ起こすことが主題のとき
- MVC の test layer 分担が主題のとき

## Inputs to inspect

- 既存 workflow YAML
- `.NET test` と Playwright の実行時間
- secrets と `GITHUB_TOKEN` の必要権限
- browser setup、artifact、cache の有無
- flaky failure の傾向

## Workflow

1. 先に必須 gate を決め、`restore/build/test` と browser job を分ける必要があるか判断する。
2. `permissions` は workflow と job の両方で最小化する。
3. matrix は明確な価値がある軸だけに絞り、E2E をむやみに掛け算しない。
4. cache と artifact の役割を分け、再利用したいものだけを残す。
5. Playwright は unit test 成功後に段階的に追加し、実行コストと安定性を記録する。
6. 失敗時にどこを見るべきかが分かる job 名と出力に整える。

## Gotchas

- E2E を大きい matrix に載せると実行時間と flaky が急増しやすい。
- `GITHUB_TOKEN` に broad write permission を与えると不要な権限が残る。
- cache と artifact を混同すると deploy や再実行の議論が崩れる。
- local の不安定さを CI にそのまま持ち込むと切り分けが難しくなる。

## Output

- `.NET test` と Playwright を含む CI 設計メモ
- workflow review コメント
- job 分割、permissions、cache、matrix の提案

## Validation

- Trigger する prompt:
  - `GitHub Actions で .NET test と Playwright をどう分けるべきか決めたい`
  - `Playwright を CI に段階的に入れたい`
  - `permissions と matrix を最小限にした CI を設計したい`
- Trigger しない prompt:
  - `production deploy の approval と rollback を決めたい`
  - `workflow YAML を docs/workflow-specs に仕様化したい`
  - `ASP.NET Core MVC の Controller と ViewModel の責務を見直したい`
- Near-miss prompt:
  - `Playwright を unit test とどう住み分けるべきか決めたい`
  - `environment secrets と promotion path を整理したい`

## Trigger risks

### Over-trigger risks

- `GitHub Actions` だけで delivery policy skill や workflow spec skill と競合しやすい。
- Playwright の話でも、主題が test strategy か CI かを見誤りやすい。

### Under-trigger risks

- `permissions` `matrix` `cache` だけの相談でも、この skill の対象になり得る。
- `.NET test を先に通したい` のような小さい相談も CI 設計の一部として拾う。
