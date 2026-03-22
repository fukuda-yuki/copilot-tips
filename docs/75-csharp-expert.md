---
title: C# Expert
parent: Guides
nav_order: 77
description: C# / .NET の expert guidance の説明
---

## このページの役割

このページは、`csharp-dotnet-architecture-expert-guidance` plugin を使って C# / .NET の設計、セキュリティ、async/await、DI、CQRS、SOLID、テスト、性能改善を一段深く扱うための入口です。既存の `csharp-dotnet-coding-baseline-guidance` より広く、設計判断や改善相談まで扱います。

## 対象シナリオ

- baseline を超えて、設計や改善方針まで専門的に相談したい
- fat controller、曖昧な DI、同期ブロック、責務過多を減らしたい
- CQRS や layering を導入すべきかを比較したい
- EF Core を基本にしつつ、raw SQL / Stored Procedure の例外採用を厳密に判断したい

## Plugin Catalog

| Plugin | 役割 | 同梱物 | 完成度 |
| --- | --- | --- | --- |
| `csharp-dotnet-architecture-expert-guidance` | C# / .NET の設計、非同期、依存関係、テスト、性能改善を expert レベルで整理する | skill: `csharp-dotnet-architecture-expert-guidance` / agent: `csharp-dotnet-expert` / reference: `data-access-exception-checklist` | thin |

## 判断の優先順

1. public contract と責務境界を崩さない
2. sync-over-async、service locator、fat controller を避ける
3. testability と observability を先に確保する
4. data access は EF Core を既定にし、raw SQL / Stored Procedure は性能根拠つき例外にする
5. CQRS や分割は必要性が説明できる範囲で採用する

## Agent / Skill の分担

- Agent: `csharp-dotnet-expert`
  - 比較案、設計判断、改善順序、リスク整理を担当します
- Skill: `csharp-dotnet-architecture-expert-guidance`
  - 実装判断の観点、data access 例外判定、test / performance の確認順を担当します

## 使い分けメモ

- まず基準線だけをそろえたいなら [10-csharp-dotnet](10-csharp-dotnet.md) と `csharp-dotnet-coding-baseline-guidance` を使います
- modernization 案件で EF Core 例外判断まで絡む場合は [80-modernization](80-modernization.md) と併用します
- この plugin は .NET に寄せた expert guidance であり、generic starter や generic spec-driven の代替ではありません
