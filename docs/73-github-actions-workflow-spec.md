---
title: GitHub Actions Workflow Spec
parent: Guides
nav_order: 75
description: workflow YAML を AI 向け Markdown 仕様へ落とす考え方
---

## このページの役割

このページは、既存の GitHub Actions workflow YAML から AI 向けの Markdown 仕様書を起こす `github-actions-workflow-spec-guidance` plugin を説明します。実装ファイルの逐語的な写経ではなく、review、運用標準化、将来の保守に使える仕様書へ落とすことを目的にしています。

## 対象シナリオ

- 既存 workflow はあるが、意図や境界が YAML を読まないと分からない
- trigger、secret、permission、artifact の扱いをレビューしやすくしたい
- 後続 agent に「何をする workflow か」を短く渡したい
- 実装変更の前に、まず現状仕様を整理したい

## Plugin Catalog

| Plugin | 役割 | 同梱物 | 完成度 |
| --- | --- | --- | --- |
| `github-actions-workflow-spec-guidance` | workflow YAML を観測し、`docs/workflow-specs/<workflow-id>.md` の形で AI 向け仕様書へ落とす | skill: `github-actions-workflow-spec-guidance` / reference: `workflow-spec-template` | thin |

## 出力の固定章立て

出力先は downstream repo の `docs/workflow-specs/<workflow-id>.md` に固定します。章立ては次の 9 つだけを使います。

1. `Purpose`
2. `Triggers`
3. `Inputs-Env-Secrets`
4. `Permissions`
5. `Cache`
6. `Job Graph`
7. `Artifacts`
8. `Failure Handling`
9. `Deployment-Rollback`

## 進め方

1. 対象 workflow の path、trigger、job 構成、needs 関係を先に観測します
2. `env`、`inputs`、`secrets`、`permissions` を抽出し、workflow 全体と job ごとに分けます
3. cache、artifact、deployment 関連の step を整理し、どこで状態を受け渡すかを短く書きます
4. 失敗時の stop 条件、retry、manual gate、rollback 導線を明記します
5. 将来こう変えたい話は混ぜず、まず現在の observed behavior を仕様化します

## 使い分けメモ

- `.NET test` と Playwright E2E の CI 自体を設計したい場合は [50-github-actions](50-github-actions.md) と `dotnet-playwright-ci-guidance` を優先します
- broader CI/CD policy を設計したい場合は [76-github-actions-cicd-best-practices](76-github-actions-cicd-best-practices.md) を使います
- この plugin は「いまある workflow を AI と人が読める仕様にする」用途に絞ります
