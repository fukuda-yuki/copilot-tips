---
name: dotnet-modernization-slice-guidance
description: WebForms / WinForms から ASP.NET Core MVC へ移行するときに、1 つの legacy behavior を 1 つの vertical slice として TDD-first で実装計画し、EF Core を既定に進めるときに使う skill。質問主導の mentoring や現行分析そのものが主題なら使わない。
---

# Dotnet Modernization Slice Guidance

## Purpose

モダナイゼーションを大きな一括変換ではなく、review 可能な vertical slice に分けて進める。1 slice が 1 behavior を守り、test、code、handoff が揃っている状態を成功とする。

## When to use

- WebForms / WinForms から ASP.NET Core MVC への移行実装を small step で進めたいとき
- 1 つの legacy behavior を 1 つの slice に落としたいとき
- TDD-first で次の実装順を決めたいとき
- EF Core を既定にし、SQL / Stored Procedure を例外扱いにしたいとき

## When not to use

- 現行仕様の不明点を質問で掘りたいだけのとき
- 学習支援やジュニア mentoring が主題のとき
- repo bootstrap や plugin 導入が主題のとき

## Inputs to inspect

- legacy 画面、legacy code、SQL、運用上の制約
- 次に移す target behavior
- 既存 test と migration の進捗
- `memory-bank/spec.md` `memory-bank/plan.md` `memory-bank/task.md`
- EF Core で表現できるかどうかの判断材料

## Workflow

1. 次に移す behavior を 1 つだけ選び、境界を広げない。
2. 現行挙動を確認し、守るべき入力、出力、例外条件を先に固定する。
3. 可能なら test を先に置き、slice の合格条件を明確にする。
4. Controller / service / ViewModel / data access の変更点を slice 単位で切る。
5. data access は EF Core を既定にし、例外採用は根拠がある場合だけにする。
6. 実装後に `memory-bank` と open questions を更新し、次 slice へ渡せる状態にする。

## Gotchas

- 複数の behavior を 1 slice に混ぜると確認と rollback が難しくなる。
- 現行挙動を確定しないまま書き換えると regression の原因が追えない。
- raw SQL や Stored Procedure を既定にすると次世代側の保守性が落ちる。
- code、test、handoff を別々に進めると次の担当者が詰まりやすい。

## Output

- modernization の次 slice 提案
- TDD-first の実装順メモ
- `Tests to write first` `Code to change` `Open questions` `Memory-bank update` を含む handoff

## Validation

- Trigger する prompt:
  - `WebForms から ASP.NET Core MVC へ次の 1 slice を切りたい`
  - `legacy behavior を 1 つ選んで TDD-first で移行したい`
  - `EF Core を既定にした modernization 実装順を決めたい`
- Trigger しない prompt:
  - `ジュニア向けに質問中心で現行仕様を理解したい`
  - `repo-wide の instructions と memory-bank 雛形を入れたい`
  - `GitHub Actions の deploy approval を決めたい`
- Near-miss prompt:
  - `現行画面の仕様が分からないので質問で整理したい`
  - `memory-bank/spec plan task の運用だけを整えたい`

## Trigger risks

### Over-trigger risks

- modernization という語だけで mentoring skill の相談まで巻き取りやすい。
- implementation より discovery が主題の依頼には向かない。

### Under-trigger risks

- `次にどの画面を移すべきか` `1 task をどう切るべきか` も slice skill の対象。
- `TDD-first` の語がなくても、reviewable change を求める modernization 相談は含める。
