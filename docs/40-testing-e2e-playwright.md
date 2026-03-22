---
title: E2E / Playwright
parent: Guides
nav_order: 40
description: Playwright を使った E2E テストの入口
---

## このページの役割

このページは、ASP.NET Core MVC アプリの主要導線を Playwright で守るための出発点をまとめたものです。フォーム入力、一覧から詳細への遷移、検索、認可のように「画面をまたぐと壊れやすい箇所」を対象にします。

## 先に読むとよいページ

- 先に [30-testing-unit](30-testing-unit.md) を固めてから使う前提です
- CI に載せる段階では [50-github-actions](50-github-actions.md) とセットで見ます

## MVC での典型ユースケース

- 入力フォームの必須項目、バリデーション表示、保存後の遷移を自動確認する
- 管理画面や検索画面など、手動確認だと抜けやすい導線を固定する
- Model Binding や Razor の変更で HTML 構造が崩れたときに早く検知する

## Curated Items

| ID | 種別 | 用途 | MVC 適合度 | そのまま使えるか / 調整要否 | 併用候補 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| E01 | Instruction | .NET で Playwright テストを書くときの方針を Copilot に渡す | 高 | そのまま使いやすいが、対象 URL や命名規約はチームに合わせて追記する | E02, E03 | [playwright-dotnet.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/playwright-dotnet.instructions.md) |
| E02 | Skill | 既存画面を探索し、テスト化候補の情報を集める | 高 | 探索対象 URL や認証前提を明示する必要がある | E01, E04 | [playwright-explore-website/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/playwright-explore-website/SKILL.md) |
| E03 | Skill | シナリオから Playwright テストを起こすたたき台にする | 高 | そのままでは不安定な selector を選ぶことがあるので見直し必須 | E01, E05 | [playwright-generate-test/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/playwright-generate-test/SKILL.md) |
| E04 | Agent | 画面操作や E2E の観点でブラウザテストを進めたいときに使う | 中 | 既存テスト構成と対象シナリオを明示しないと広くなりすぎる | E02, E03 | [playwright-tester.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/playwright-tester.agent.md) |
| E05 | Official Docs | Playwright for .NET の基本構成と最初のテスト作成手順を確認する | 高 | そのまま参照できる | E01, E03 | [Playwright for .NET Introduction](https://playwright.dev/dotnet/docs/intro) |
| E06 | Official Docs | Locator の考え方を確認し、不安定な E2E を減らす | 高 | そのまま参照できる。HTML 側の `data-testid` 方針はチームで別途決める | E03, [20-aspnetcore-mvc](20-aspnetcore-mvc.md) | [Locators](https://playwright.dev/dotnet/docs/locators) |

## 使い分けメモ

- まず E02 で画面を探索し、E03 でテストのたたき台を作り、E06 を見ながら locator を安定化する流れが安全です
- テストコードだけでなく、View 側に安定した selector を入れる判断も必要です
- CI へ組み込む最初の雛形として、[workflow テンプレート](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/examples/workflows/dotnet-test-playwright.yml) を使えます
