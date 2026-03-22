---
title: Overview
parent: Guides
nav_order: 1
description: この repo の使い方と読む順番
---

このリポジトリの役割は、`github/awesome-copilot` や公式ドキュメントの中から、ASP.NET Core MVC の現場で判断材料になるものだけを選び、日本語で「どこで使うか」に寄せて整理することです。

## このガイドの使い方

- どの repo でも最初に generic starter と spec-driven の shared workflow を整え、その後で言語・テスト・CI/CD の guidance を足します
- まず C# / .NET の基準線を決め、その後で MVC の責務分離とテスト導線を足します
- E2E と CI は、アプリ本体の責務分離と単体テストの方針が固まってから導入します
- 使うソースは必ず [Source Map](90-source-map.md) で確認し、未採用のものはそのままカテゴリに載せません

## 読む順番

| 順番 | ページ | 目的 |
| --- | --- | --- |
| 1 | [71-github-copilot-starter](71-github-copilot-starter.md) | polyglot repo の instructions / agents / memory-bank starter を small step で持ち込む |
| 2 | [72-spec-driven-workflow](72-spec-driven-workflow.md) | `requirements / design / tasks` の発想を `memory-bank/spec / plan / task` に落とす |
| 3 | [10-csharp-dotnet](10-csharp-dotnet.md) | Copilot に渡す C# / .NET の基本線を揃える |
| 4 | [75-csharp-expert](75-csharp-expert.md) | C# / .NET の expert guidance と data access 例外判断を足す |
| 5 | [20-aspnetcore-mvc](20-aspnetcore-mvc.md) | MVC の責務分離と入力処理の前提を固める |
| 6 | [30-testing-unit](30-testing-unit.md) | xUnit などの単体テスト方針を揃える |
| 7 | [74-polyglot-test-integrity](74-polyglot-test-integrity.md) | implementation-friendly なテストを抑え、behavior source を明示する |
| 8 | [40-testing-e2e-playwright](40-testing-e2e-playwright.md) | 主要導線の E2E を Playwright で固める |
| 9 | [50-github-actions](50-github-actions.md) | `.NET test` と E2E を CI に乗せる |
| 10 | [73-github-actions-workflow-spec](73-github-actions-workflow-spec.md) | workflow YAML を AI 向け Markdown 仕様へ変換する |
| 11 | [76-github-actions-cicd-best-practices](76-github-actions-cicd-best-practices.md) | broad CI/CD policy と deploy / promotion / rollback を整理する |
| 12 | [60-agent-plugins](60-agent-plugins.md) | repo を plugin marketplace として配布する構成を足す |
| 13 | [70-agents-and-review](70-agents-and-review.md) | PR review と upgrade / modernization の入口を整理する |
| 14 | [80-modernization](80-modernization.md) | WebForms / WinForms から ASP.NET Core MVC への移行方針を small step で固める |
| 15 | [70-modernization-mentoring](70-modernization-mentoring.md) | 現行 WebForm / WindowsForm の移行を質問中心で進める mentoring plugin を使い分ける |
| 16 | [70-github-pages-catalog](70-github-pages-catalog.md) | `docs/` を GitHub Pages で公開する構成と更新手順を確認する |
| 17 | [90-source-map](90-source-map.md) | どのソースを採用し、何を保留にしたかを追う |

## Generic starter から始めたいとき

1. [71-github-copilot-starter](71-github-copilot-starter.md) を見て、`memory-bank/spec.md` / `plan.md` / `task.md` と `.github/copilot-instructions.md` の最小セットを入れる
2. [72-spec-driven-workflow](72-spec-driven-workflow.md) を見て、`memory-bank/spec.md` / `plan.md` / `task.md` の役割を固定する
3. file-specific な常時ルールは `.github/instructions/*.instructions.md` に分け、repo 全体ルールを肥大化させない
4. 長めの対話が必要な役割だけ `.github/agents/*.agent.md` を追加し、人格とファイルルールを混ぜない
5. generic な土台が固まってから、C# / テスト / CI/CD の個別 guidance を足す

## MVC での典型フロー

### 既存 MVC プロジェクトを改善したいとき

1. C# / .NET の instruction をベースラインとして入れる
2. MVC の責務分離と Model Binding の観点を確認する
3. Controller と Service の単体テストを追加する
4. 重要導線だけ Playwright E2E に載せる
5. GitHub Actions で PR ごとに自動実行する
6. review / upgrade に入る段階で [70-agents-and-review](70-agents-and-review.md) を見て、人手 review と modernization の境界を決める

### 新規 MVC アプリを立ち上げるとき

1. [ASP.NET Core MVC 向け instruction テンプレート](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/instructions/aspnetcore-mvc.instructions.md) をチーム規約に合わせて調整する
2. 単体テストの枠組みを先に作る
3. フォーム送信や遷移など、壊れると困る導線だけ先に E2E 化する
4. [workflow テンプレート](../examples/workflows/dotnet-test-playwright.yml) を元に CI を組む
5. チーム共有を始める段階で [60-agent-plugins](60-agent-plugins.md) を見て marketplace から必要な plugin を導入する

### 現行 WebForms / WinForms を次世代 MVC へ移したいとき

1. [10-csharp-dotnet](10-csharp-dotnet.md) と [20-aspnetcore-mvc](20-aspnetcore-mvc.md) で次世代側の責務分離を先に固める
2. [30-testing-unit](30-testing-unit.md) を前提に、先に失敗する test を書ける粒度まで task を割る
3. [80-modernization](80-modernization.md) を見て、1 振る舞いを 1 vertical slice として切り出す
4. `memory-bank/` と [memory bank instruction テンプレート](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/instructions/memory-bank.instructions.md) を使い、判断と未解決事項を markdown に残す
5. チーム共有や agent 利用を始める段階で [60-agent-plugins](60-agent-plugins.md) から `dotnet-modernization-guidance` を導入し、`modernization-modernizer` と `sensei-modernization-mentor` を使い分ける

## v1 の境界

- v1 は docs 中心です。Agent Plugins は Phase 2 の第1弾として追加済みです
- `review / upgrade` の入口とモダナイゼーション guidance は Phase 2 の第2弾として追加済みです
- モダナイゼーション mentoring plugin も同じ Phase 2 の第2弾として追加済みです
- repo 初期整備向けの generic starter plugin は Small Step Roadmap の第1弾として追加済みです
- spec-driven workflow、workflow 仕様化、test integrity、C# expert、broad CI/CD policy は Small Step Roadmap の第2弾として追加済みです
- hooks / MCP / 専用 review plugin や包括的な refactor pack は引き続き後続フェーズに回します
- marketplace は導入導線として持ちますが、本家サイトとの完全な構造同期は行いません
- サンプルは最小限に留め、「大量のコピペ素材集」にはしません

## 編集ルール

- 新しいソースを採用するときは、先に [Source Map](90-source-map.md) に行を追加します
- 各カテゴリページの curated item は、少なくとも `種別 / 用途 / MVC 適合度 / 調整要否 / 併用候補 / 出典` を持たせます
- 外部コンテンツはリンクと要約に留め、本文の転載はしません
