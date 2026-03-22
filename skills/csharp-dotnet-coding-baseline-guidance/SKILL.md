---
name: csharp-dotnet-coding-baseline-guidance
description: C# / .NET の日常実装で、命名、async / await、例外処理、DI、層分離、保守しやすい書き方の基準線を揃えるときに使う skill。性能最適化や設計方針の上級判断が主題なら使わない。
---

# C# .NET Coding Baseline Guidance

## Purpose

C# / .NET の日常開発で迷いやすい基準を揃え、保守しやすいコードへ寄せる。基本線を明快にし、余計な設計論へ広げないことを成功とする。

## When to use

- 命名、async / await、例外処理、DI の基準を揃えたいとき
- Controller / service / repository などの層分離を見直したいとき
- 日常的なレビュー観点を短くまとめたいとき
- 新しい依存や helper を入れる妥当性を確認したいとき

## When not to use

- CQRS、性能最適化、セキュリティ、data access 例外判断が主題のとき
- ASP.NET Core MVC の画面遷移や ViewModel 設計が主題のとき
- GitHub Actions や plugin 構成が主題のとき

## Inputs to inspect

- 変更対象の class と method
- 非同期境界と例外ハンドリング
- DI 登録、constructor injection の使い方
- Controller / service / data access の責務分割
- 新しく追加する dependency や utility

## Workflow

1. 対象コードの主論点を命名、非同期、例外、DI、層分離のどれかに絞る。
2. 命名は役割が伝わることを優先し、抽象的な名前や省略を避ける。
3. 非同期 I/O は end-to-end で `async` / `await` を通し、同期ブロッキングを混ぜない。
4. 例外は握り潰さず、意味のある境界で扱う。
5. DI は constructor injection を既定にし、責務が重い class は分割を検討する。
6. 変更理由を短く説明し、チームで再利用しやすい基準へ落とす。

## Gotchas

- `Task.Result` や `Wait()` は deadlock と可読性悪化の原因になりやすい。
- `catch (Exception)` で終えるだけの処理は原因を隠しやすい。
- static helper や service locator は依存を見えにくくする。
- Controller に業務判断や整形を積むと責務が崩れやすい。

## Output

- 日常実装の基準メモ
- code review コメント
- C# / .NET の基本方針に沿った修正案

## Validation

- Trigger する prompt:
  - `C# の async / await と例外処理の基準を揃えたい`
  - `Controller と service の責務分離を基本線で見直したい`
  - `DI と命名のレビュー観点を短くまとめたい`
- Trigger しない prompt:
  - `EF Core では無理な query なので raw SQL を採用すべきか判断したい`
  - `Playwright E2E をどこまで CI に載せるべきか決めたい`
  - `workflow YAML を Markdown 仕様に起こしたい`
- Near-miss prompt:
  - `C# / .NET の architecture を tradeoff 付きで判断したい`
  - `ASP.NET Core MVC の Controller で PRG をどう使うべきか相談したい`

## Trigger risks

### Over-trigger risks

- `C# / .NET` 一般論だけで architecture expert skill と競合しやすい。
- MVC の画面設計や workflow 設計まで巻き取ると広過ぎる。

### Under-trigger risks

- `保守しやすくしたい` `命名がぶれている` `非同期が怪しい` のような短い依頼も対象になる。
- review コメント整理も実装だけでなくこの skill の利用対象に含める。
