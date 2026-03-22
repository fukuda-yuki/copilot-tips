---
title: Modernization
parent: Guides
nav_order: 80
description: WebForms / WinForms から ASP.NET Core MVC への移行判断
---

## このページの役割

このページは、WebForms / WinForms の現行システムを ASP.NET Core MVC / C# / Razor / SQL の次世代システムへ移すときの判断基準を整理するためのものです。現行システムは「振る舞いの参照元」として扱い、テストしにくい構造まで次世代へ持ち込みません。

## 先に読むとよいページ

- 次世代側の設計基準は先に [10-csharp-dotnet](10-csharp-dotnet.md) と [20-aspnetcore-mvc](20-aspnetcore-mvc.md) で固めます
- TDD を前提にするため、あわせて [30-testing-unit](30-testing-unit.md) を先に見ておくと判断がぶれにくいです
- チーム共有や plugin 配布までつなぐ場合は [60-agent-plugins](60-agent-plugins.md) を見ます

## モダナイゼーションでの典型ユースケース

- 現行 WebForms / WinForms の 1 画面、1 振る舞い、1 ユースケースを small step で ASP.NET Core MVC に移したい
- EF Core を基本にしつつ、性能上の根拠がある場合だけ raw SQL や stored procedure を残したい
- TDD を前提にし、テストしにくい現行構造へ迎合せずに責務を切り直したい
- 複数 agent で作業しても引き継げるよう、memory bank を markdown で運用したい

## Curated Items

| ID | 種別 | 用途 | MVC 適合度 | そのまま使えるか / 調整要否 | 併用候補 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| L01 | Agent | 現行 repo の棚卸し、依存順序、small step の移行順を考える | 中 | framework upgrade 前提が強いので、そのまま全面適用せず slice planning に寄せて使う | L02, [30-testing-unit](30-testing-unit.md) | [dotnet-upgrade.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/dotnet-upgrade.agent.md) |
| L02 | Instruction | 現行 .NET Framework / WinForms / WebForms 側の制約を読むときの guardrail にする | 中 | 次世代側に持ち込むルールではない。あくまで現行資産を読むときの補助として使う | L01, [20-aspnetcore-mvc](20-aspnetcore-mvc.md) | [dotnet-framework.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/dotnet-framework.instructions.md) |
| L03 | Official Docs | EF Core を基本にしつつ、SQL / stored procedure を例外採用する境界と注意点を確認する | 高 | そのまま参照しやすい。`FromSql`、stored procedure、パラメータ化、構成制約を押さえる | L04, [20-aspnetcore-mvc](20-aspnetcore-mvc.md) | [SQL クエリ - EF Core](https://learn.microsoft.com/ja-jp/ef/core/querying/sql-queries) |
| L04 | Skill | 次世代側の EF Core 実装基準を補強する | 高 | 汎用 skill なので、transaction 境界や query object の切り方はチーム規約で補足する | L03, [10-csharp-dotnet](10-csharp-dotnet.md) | [ef-core/SKILL.md](https://github.com/github/awesome-copilot/blob/main/skills/ef-core/SKILL.md) |

## 進め方

1. 現行システムの構造ではなく、期待する振る舞いを 1 件選ぶ
2. 先に失敗する test を書ける粒度まで task を小さくする
3. Controller は HTTP 境界に限定し、業務判断、変換、永続化は Service または UseCase に寄せる
4. ViewModel は画面都合の入力と表示に閉じ、現行 DTO や永続化モデルをそのまま View に渡さない
5. 永続化は EF Core を既定にし、raw SQL や stored procedure は計測した性能差と保守影響を説明できる場合だけ例外扱いにする
6. 1 回の変更で code、test、memory bank 更新までを同じ粒度で閉じる

## Memory Bank の使い方

- `memory-bank/spec.md`: 案件の前提、非交渉事項、長期に守る方針を書く
- `memory-bank/plan.md`: いま着手すべき slice と、その次の slice を順序付きで保つ
- `memory-bank/task.md`: 進行中 task、未解決事項、直近の next step を保つ
- `memory-bank/knowledge.md`: 確認済みの事実、決定履歴、既知制約、ツール利用パターンを保つ
- チャットの全文は貼らず、後続の agent が再利用できる事実と判断だけを絶対日付付きで残します

## Agent / Skill / Instruction の分け方

- Agent: `modernization-modernizer` のように、判断スタイルと返し方を持つ人格として使います
- Skill: `dotnet-modernization-slice-guidance` のように、small step の進め方を繰り返し適用する手順として使います
- Instruction: [dotnet modernization instruction テンプレート](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/instructions/dotnet-modernization.instructions.md) や [memory bank instruction テンプレート](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/instructions/memory-bank.instructions.md) のように、対象ファイルへ自動適用するルールとして使います
- 質問主導で現行仕様を聞き出しながら進めたい場合は、[70-modernization-mentoring](70-modernization-mentoring.md) の `sensei-modernization-mentor` / `dotnet-modernization-socratic-mentoring` を併用します

## 使い分けメモ

- 現行コードの構造をどこまで残すか迷ったら、「テストしやすさを落としてまで残すべきか」で判断します
- raw SQL / stored procedure を残す場合でも、controller 直下へ置かず、例外扱いの query path として隔離します
- 複数 agent で動く場合は 1 task を 1 reviewable change に収まる大きさへ割り、memory bank を handoff 面として使います
