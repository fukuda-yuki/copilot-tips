---
title: GitHub Actions / CI
parent: Guides
nav_order: 50
description: .NET test と Playwright E2E を GitHub Actions に載せる入口
---

## このページの役割

このページは、`.NET test` と Playwright E2E を GitHub Actions へ段階的に載せるための入口です。v1 では、速く壊れを検知する最小構成と、権限を広げすぎない運用を優先します。

## 先に読むとよいページ

- 先に [30-testing-unit](30-testing-unit.md) と [40-testing-e2e-playwright](40-testing-e2e-playwright.md) を読んでおく前提です
- 既存 workflow の仕様化が必要なら [73-github-actions-workflow-spec](73-github-actions-workflow-spec.md)、broad CI/CD policy が必要なら [76-github-actions-cicd-best-practices](76-github-actions-cicd-best-practices.md) を併用します
- source の採用判断は [90-source-map](90-source-map.md) で確認できます

## MVC での典型ユースケース

- PR ごとに restore / build / unit test / E2E を回したい
- 複数の .NET バージョンや OS を matrix で確認したい
- `GITHUB_TOKEN` や secrets の権限を最小化したい

## Curated Items

| ID | 種別 | 用途 | MVC 適合度 | そのまま使えるか / 調整要否 | 併用候補 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| A01 | Instruction | GitHub Actions の CI/CD ベストプラクティスを Copilot に渡す | 高 | そのまま使いやすいが、組織ルールや reusable workflow の前提は追記が必要 | A02, A03 | [github-actions-ci-cd-best-practices.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/github-actions-ci-cd-best-practices.instructions.md) |
| A02 | Agent | workflow 設計や改善案を相談するときの専門 agent として使う | 中 | 既存 workflow と実行コストの制約を伝えないと広くなりすぎる | A01, A04 | [github-actions-expert.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/github-actions-expert.agent.md) |
| A03 | Official Docs | GitHub Actions で .NET をビルド / テストする最小構成を確認する | 高 | そのまま参照しやすい | A01, [40-testing-e2e-playwright](40-testing-e2e-playwright.md) | [Building and testing .NET](https://docs.github.com/ja/actions/automating-builds-and-tests/building-and-testing-net) |
| A04 | Official Docs | matrix を使って .NET バージョンや OS を増やす方法を確認する | 中 | 検証コストが増えるため、v1 では必要最低限に絞る | A03, A05 | [Using a matrix for your jobs](https://docs.github.com/ja/actions/using-jobs/using-a-matrix-for-your-jobs) |
| A05 | Official Docs | `GITHUB_TOKEN` の使い方と権限最小化の前提を確認する | 高 | そのまま参照できる。workflow ごとの `permissions` 調整は実装が必要 | A01, A02 | [Use GITHUB_TOKEN in workflows](https://docs.github.com/ja/actions/tutorials/use-github_token-in-workflows) |

## 最初の構成

1. A03 を基準に unit test を先に自動化する
2. E2E は [workflow テンプレート](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/examples/workflows/dotnet-test-playwright.yml) を元に別 step として追加する
3. `permissions` は A05 を基準に絞り、不要な write 権限を開けない
4. matrix は A04 を参考に、必要な .NET バージョンだけを段階的に増やす
5. 既存 workflow の観測結果を AI 向け Markdown 仕様へ落とす場合は [73-github-actions-workflow-spec](73-github-actions-workflow-spec.md) を使う
6. deploy / promotion / rollback まで含めた policy layer を作る場合は [76-github-actions-cicd-best-practices](76-github-actions-cicd-best-practices.md) を使う
