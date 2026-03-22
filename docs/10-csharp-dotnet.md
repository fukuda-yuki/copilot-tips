---
title: C# / .NET 基本
parent: Guides
nav_order: 10
description: Copilot に最初に渡す C# / .NET の基準線
---

## このページの役割

このページは、Copilot に最初に渡す C# / .NET の基準線を揃えるためのものです。MVC の話に入る前に、命名、非同期、例外処理、DI、保守性の前提を先に固定します。

## 先に読むとよいページ

- 最初に読むページです
- generic starter と shared workflow から入りたい場合は [71-github-copilot-starter](71-github-copilot-starter.md) と [72-spec-driven-workflow](72-spec-driven-workflow.md) を先に見ても構いません
- 次は [20-aspnetcore-mvc](20-aspnetcore-mvc.md) に進む前提で使います

## MVC での典型ユースケース

- Controller にロジックが寄り始めたときに、Service 側へ戻す基準を揃える
- `async` / `await`、例外処理、DI の扱いをチームでぶらさない
- Copilot の出力を「動くコード」だけでなく「保守できるコード」に寄せる

## Curated Items

| ID | 種別 | 用途 | MVC 適合度 | そのまま使えるか / 調整要否 | 併用候補 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | Instruction | C# の基本的な命名、可読性、例外処理、非同期の方針を Copilot に常時渡す | 高 | そのままベースにしやすい。既存規約があるなら命名や nullability だけ追記する | C02, C03 | [csharp.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/csharp.instructions.md) |
| C02 | Instruction | .NET の設計・分割・依存関係の考え方を補強する | 高 | MVC でもそのまま使いやすいが、層分割やフォルダー構成はチーム実装に合わせて補正する | C01, C04 | [dotnet-architecture-good-practices.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/dotnet-architecture-good-practices.instructions.md) |
| C03 | Skill | .NET のベストプラクティスをまとまった判断単位で適用する | 高 | そのまま読むより、チームの設計ルールに合わせて抜粋利用するのが向く | C01, C02 | [dotnet-best-practices/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/dotnet-best-practices/SKILL.md) |
| C04 | Agent | より広い文脈で .NET 設計や改善案を出させたいときの専門 agent として使う | 中 | 既存アーキテクチャの前提を明示しないと一般論に寄りやすい | C02, [30-testing-unit](30-testing-unit.md) | [expert-dotnet-software-engineer.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/expert-dotnet-software-engineer.agent.md) |

## おすすめの導入順

1. まず C01 をベースラインにする
2. MVC アプリの層分割で迷い始めたら C02 を足す
3. 設計レビューや長めの改善タスクでは C03 と C04 を使い分ける
4. この基準線を元に、チーム用の [instruction テンプレート](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/instructions/aspnetcore-mvc.instructions.md) を調整する
5. baseline を超えて expert 判断が必要なら [75-csharp-expert](75-csharp-expert.md) と `csharp-dotnet-architecture-expert-guidance` を使う
