---
name: csharp-dotnet-architecture-expert-guidance
description: C# / .NET の設計、性能、セキュリティ、async / await、DI、CQRS、EF Core と raw SQL / Stored Procedure の例外判断を上級者向けに整理するときに使う skill。日常的な命名規約や基本的な非同期の書き方だけが主題なら使わない。
---

# C# .NET Architecture Expert Guidance

## Purpose

C# / .NET の設計判断を、公開契約、保守性、性能、セキュリティ、観測性の観点で整理する。単なる好みではなく、根拠と tradeoff を伴う判断にすることを成功とする。

## When to use

- 設計境界、責務分離、依存関係の切り方を深く検討したいとき
- async / await、DI、CQRS の採否を architecture 観点で決めたいとき
- EF Core を既定としつつ raw SQL / Stored Procedure を例外採用すべきか判断したいとき
- 性能問題やセキュリティ上の懸念を設計変更へ落としたいとき

## When not to use

- 命名、例外、DI の基本線だけを揃えたいとき
- ASP.NET Core MVC の画面設計が主題のとき
- CI や plugin bootstrap が主題のとき

## Inputs to inspect

- 公開 API、公開型、既存 contract
- 性能計測、障害ログ、運用上の制約
- DI 構成、依存グラフ、observability の現状
- EF Core query、SQL、Stored Procedure、DB 制約
- 変更対象の test と監視

## Workflow

1. 守るべき公開契約と non-negotiable を先に固定する。
2. 問題が設計、性能、セキュリティ、運用のどこにあるかを切り分ける。
3. 一番単純な案を既定にし、例外案は必要条件が揃ったときだけ検討する。
4. raw SQL / Stored Procedure を提案するなら、EF Core では足りない根拠を要求する。
5. 変更が testability と observability に与える影響を確認する。
6. `Recommendation` `Tradeoffs` `Risks` `Tests to keep or add` `Data access note` の形で結論をまとめる。

## Gotchas

- 計測なしの最適化は architecture ではなく推測になりやすい。
- raw SQL を既定路線にすると、保守性と安全性が落ちやすい。
- `Task.Result` や `Wait()` を混ぜると sync-over-async が潜り込む。
- service locator や god service で一時的に楽をすると後で依存が壊れる。

## Output

- 上級者向け設計レビュー
- `Recommendation` `Tradeoffs` `Risks` `Tests to keep or add` `Data access note` を含む判断メモ
- data access 例外採用の可否と根拠

## Validation

- Trigger する prompt:
  - `EF Core では重い query があるので raw SQL に寄せるべきか判断したい`
  - `C# / .NET の依存境界と testability を設計観点で見直したい`
  - `CQRS を入れるべきか tradeoff ベースで整理したい`
- Trigger しない prompt:
  - `非同期メソッド名の付け方を揃えたい`
  - `Controller の PRG を見直したい`
  - `GitHub Actions の matrix を決めたい`
- Near-miss prompt:
  - `C# / .NET の日常的な命名と例外処理の基準を揃えたい`
  - `ASP.NET Core MVC の入力再表示をどう作るべきか相談したい`

## Trigger risks

### Over-trigger risks

- `C# / .NET` だけで coding baseline 相談にも反応しやすい。
- data access の話でも、単なる CRUD 実装相談なら baseline や MVC skill の方が適切なことがある。

### Under-trigger risks

- `性能` `依存が重い` `EF Core でつらい` のような短い相談でも architecture skill の対象になり得る。
- `raw SQL` や `stored procedure` の語がなくても、query shape と測定結果の相談は含める。

## References

- raw SQL または Stored Procedure を例外採用する前に `references/data-access-exception-checklist.md` を読む。
