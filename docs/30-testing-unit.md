---
title: Unit Testing
parent: Guides
nav_order: 30
description: 単体テストと結合テストの基本方針
---

## このページの役割

このページは、MVC アプリの改修を安全に進めるための単体テスト方針を固めるためのものです。v1 では xUnit を第一候補にしつつ、NUnit / MSTest を使っている既存チームも移行なしで読める構成にします。

## 先に読むとよいページ

- 先に [20-aspnetcore-mvc](20-aspnetcore-mvc.md) を読んでおくと、どこを unit test で守るか判断しやすくなります
- AI に test を書かせる前に quality gate を置きたいなら [74-polyglot-test-integrity](74-polyglot-test-integrity.md) も先に見ます
- E2E に進む前に、このページの方針を押さえる想定です

## MVC での典型ユースケース

- Controller が薄く、Service や ViewModel 変換がテストしやすい形かを確認する
- フォーム検証、権限分岐、失敗時の戻り先などを unit test で押さえる
- E2E だけに依存せず、壊れた原因を局所化できる構成にする

## Curated Items

| ID | 種別 | 用途 | MVC 適合度 | そのまま使えるか / 調整要否 | 併用候補 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| U01 | Skill | xUnit ベースで C# の unit test を組み立てる | 高 | xUnit 採用チームならそのまま使いやすい | U04, U05 | [csharp-xunit/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/csharp-xunit/SKILL.md) |
| U02 | Skill | NUnit を使う既存チーム向けの代替案として使う | 中 | 既存資産があるチーム向け。新規採用の第一候補ではない | U04, U05 | [csharp-nunit/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/csharp-nunit/SKILL.md) |
| U03 | Skill | MSTest を標準にしている組織向けの代替案として使う | 中 | Microsoft 系の既存標準が強い組織では導入しやすい | U04, U05 | [csharp-mstest/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/csharp-mstest/SKILL.md) |
| U04 | Official Docs | unit test の粒度と保守性の基準を確認する | 高 | そのまま参照できる。フレームワークに依存しにくい | U01, U05 | [Unit testing best practices](https://learn.microsoft.com/ja-jp/dotnet/core/testing/unit-testing-best-practices) |
| U05 | Official Docs | MVC Controller の action をどうテストするかを確認する | 高 | そのまま参照しやすい。プロジェクト固有の認可や filter は補足が必要 | U01, U04 | [Test controller logic in ASP.NET Core](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/controllers/testing?view=aspnetcore-9.0) |
| U06 | Official Docs | MVC アプリ全体の結線や DI を含めた integration test の入口を確認する | 高 | そのまま参照しやすい。DB や認証はプロジェクトごとに調整が必要 | U01, [50-github-actions](50-github-actions.md) | [Integration tests in ASP.NET Core](https://learn.microsoft.com/ja-jp/aspnet/core/test/integration-tests?view=aspnetcore-9.0) |

## おすすめの進め方

1. 新規チームは U01 と U04 を基準にする
2. 既存チームは U02 または U03 を選び、テストの粒度だけ U04 に寄せる
3. Controller の入出力は U05、アプリ結線は U06 で守る
4. implementation-friendly なテストや誤った TDD ラベルを抑止したい場合は [74-polyglot-test-integrity](74-polyglot-test-integrity.md) を併用する
5. 主要導線の確認は次の [40-testing-e2e-playwright](40-testing-e2e-playwright.md) に分ける
