---
title: ASP.NET Core MVC
parent: Guides
nav_order: 20
description: ASP.NET Core MVC の責務分離と入力処理の基準
---

## このページの役割

このページは、ASP.NET Core MVC の責務分離を壊さずに Copilot を使うための基準を揃えるためのものです。本家 `awesome-copilot` には MVC 直球の素材が多くないため、このカテゴリは Microsoft Learn を中心に組み立てます。

## 先に読むとよいページ

- 先に [10-csharp-dotnet](10-csharp-dotnet.md) を読んでおくと、設計観点の重複が減ります
- テスト導線まで考える場合は、次に [30-testing-unit](30-testing-unit.md) に進みます

## MVC での典型ユースケース

- Controller に検索、変換、検証、永続化が混ざり始めたときの切り分け基準を確認する
- POST/Redirect/GET、入力検証、Model Binding の扱いをチームで揃える
- Razor View と ViewModel の責務をはっきりさせ、E2E テストしやすい HTML を保つ

## Curated Items

| ID | 種別 | 用途 | MVC 適合度 | そのまま使えるか / 調整要否 | 併用候補 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| M01 | Official Docs | ASP.NET Core MVC 全体の役割と構成要素をざっくり揃える | 高 | そのまま参照すればよい。チーム内の用語統一に向く | M02, M03 | [ASP.NET Core MVC の概要](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/overview?view=aspnetcore-9.0) |
| M02 | Official Docs | Controller / Action / ActionResult の責務を確認する | 高 | そのまま参照しやすい。戻り値の扱いやルーティングは実装方針に合わせて補足する | M01, [30-testing-unit](30-testing-unit.md) | [Controllers, actions, and action results](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/controllers/actions?view=aspnetcore-9.0) |
| M03 | Official Docs | フォーム入力、クエリ、Route からの値バインドの挙動を確認する | 高 | そのまま参照できる。ViewModel の切り方はチームルールが必要 | M02, [40-testing-e2e-playwright](40-testing-e2e-playwright.md) | [Model binding in ASP.NET Core](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/models/model-binding?view=aspnetcore-9.0) |
| M04 | Official Docs | Razor View の役割、描画の流れ、レイアウトや部分ビューの考え方を確認する | 高 | そのまま参照できる。デザインシステムや HTML 規約は別途足す | M01, M03 | [Views in ASP.NET Core MVC](https://learn.microsoft.com/ja-jp/aspnet/core/mvc/views/overview?view=aspnetcore-9.0) |

## 使い分けメモ

- C# / .NET の基準線は [10-csharp-dotnet](10-csharp-dotnet.md) で決め、MVC 特有の責務分離だけこのページで足すとぶれにくくなります
- チーム用の Copilot 指示は、[instruction テンプレート](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/instructions/aspnetcore-mvc.instructions.md) を出発点に、Controller と ViewModel の責務を明文化して作るのが安全です
- Web API を同居させている MVC アプリでも、v1 では API 専用 guidance を主軸にしません。理由は [Source Map](90-source-map.md) の除外項目を参照してください
