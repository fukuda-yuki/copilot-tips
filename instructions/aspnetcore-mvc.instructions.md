---
applyTo: "Controllers/**/*.cs, Services/**/*.cs, ViewModels/**/*.cs, Views/**/*.cshtml"
description: "ASP.NET Core MVC チーム向けの GitHub Copilot instruction テンプレート"
---

# ASP.NET Core MVC チーム向け instruction テンプレート

このテンプレートは、そのまま配布するための完成品ではありません。チームの命名規約、例外方針、テスト規約に合わせて調整して使います。

## 役割分離

- Controller は HTTP 入出力、認可、画面遷移の判断に集中させる
- ビジネスロジックは Service または UseCase に寄せる
- ViewModel は画面都合のデータ構造として扱い、永続化モデルを直接 View に渡さない

## 入力と検証

- POST の入力は専用 ViewModel に集約する
- `ModelState.IsValid` を前提にし、無効時の再表示に必要なデータを欠かさない
- バリデーションメッセージは View 側で表示されることを意識したコードを提案する

## 保守しやすさ

- Controller から直接データアクセスしない
- 長い action は private method で分割せず、Service 側へ責務移動を優先する
- `async` / `await` は I/O 境界で使い、同期ブロックを混ぜない

## テスト容易性

- Controller の戻り値、分岐、ViewModel 変換は unit test しやすい形を優先する
- Playwright E2E を壊しにくくするため、テストが必要な要素には安定した selector を用意する
- 「通すためだけのテスト」ではなく、失敗時に原因を特定しやすいテストコードを提案する

## 出力スタイル

- 変更理由を短く説明してからコードを出す
- 既存の ASP.NET Core MVC 構成に合わせ、勝手に Minimal API や SPA 前提へ寄せない
- 新しい依存を増やす場合は、なぜ必要かを一文で示す
