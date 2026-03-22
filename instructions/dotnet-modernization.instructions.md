---
applyTo: "Controllers/**/*.cs, Services/**/*.cs, UseCases/**/*.cs, Repositories/**/*.cs, Data/**/*.cs, ViewModels/**/*.cs, Views/**/*.cshtml"
description: "WebForms / WinForms から ASP.NET Core MVC へ移るチーム向けの GitHub Copilot instruction テンプレート"
---

# .NET Modernization Instruction Template

このテンプレートは、現行システムを ASP.NET Core MVC へ作り替えるときの自動適用ルールのたたき台です。skill や agent の代わりではなく、対象ファイルに常時効かせる guardrail として使います。

## Small Vertical Slice

- 1 回の変更では 1 画面、1 振る舞い、1 ユースケースだけを扱う
- 現行システムの構造ではなく、保持すべき振る舞いを task の単位にする
- 複数の論点が混ざる場合は、先に task を割り直してからコード提案する

## TDD First

- 先に失敗する test を書ける粒度まで task を小さくする
- test が書きにくい場合は、現行構造を持ち込む前に境界の切り方を見直す
- 通すためだけのテストではなく、失敗時に原因を局所化できる形を優先する

## MVC への切り替え

- WebForms / WinForms の event-driven な画面状態管理や code-behind 的な責務を、そのまま MVC に持ち込まない
- Controller は HTTP 入出力、認可、画面遷移の判断に集中させる
- 業務判断、変換、永続化は Service または UseCase に寄せる
- ViewModel は画面都合の入力と表示に閉じ、永続化モデルや現行 DTO をそのまま View に渡さない

## Data Access

- 永続化は EF Core を既定にする
- raw SQL や stored procedure は、EF Core で厳しい理由が説明でき、性能根拠がある場合だけ例外採用する
- 例外 path は controller 直下に置かず、query service や repository に隔離する
- SQL を使う場合はパラメータ化とテストを前提にし、動的文字列結合を避ける

## Output Style

- なぜその slice を選ぶかを短く説明してからコードを出す
- 現行構造への迎合ではなく、次世代側の保守性とテスト容易性を優先する
- raw SQL / stored procedure を提案する場合は、例外理由と影響範囲を一文で添える
