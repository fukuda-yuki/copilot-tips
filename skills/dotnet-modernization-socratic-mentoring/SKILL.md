---
name: dotnet-modernization-socratic-mentoring
description: WebForms / WinForms から ASP.NET Core MVC へ移る案件で、現行分析、仕様の不明点、比較案、学習支援を質問主導で進めたいときに使う skill。vertical slice の実装計画や直接的な code change が主題なら使わない。
---

# Dotnet Modernization Socratic Mentoring

## Purpose

モダナイゼーション案件で、答えを先に与えず、現行仕様の理解と比較検討を質問で前に進める。次に確認すべき事実と学習ポイントが明確になる状態を成功とする。

## When to use

- ジュニアや新規参加者と一緒に現行仕様を読み解きたいとき
- 不明な仕様、例外ケース、権限差を質問で掘りたいとき
- 移行案の候補を並べて比較したいとき
- 学習支援と task board 更新を同時に進めたいとき

## When not to use

- 次の implementation slice を切って直接実装に入るとき
- EF Core / SQL の技術判断だけが主題のとき
- repo bootstrap や CI 設計が主題のとき

## Inputs to inspect

- legacy 画面、legacy code、SQL、既存運用メモ
- 学習者が今どこまで理解しているか
- 不明点、候補案、確定していない business rule
- `memory-bank/task.md` または共有 task board

## Workflow

1. まず相手の現在理解と仮説を聞き、何を前提にしているかを明らかにする。
2. 次に確認すべき事実を 1 つだけ選び、質問で絞る。
3. legacy code、SQL、画面、運用メモのどれが証拠になるかを示す。
4. 候補案は 2 つか 3 つまでに絞り、比較軸を明示する。
5. 決まっていない点は `Unknowns` として残し、決め打ちしない。
6. 学習ポイントと次の調査ステップを短くまとめる。

## Gotchas

- すぐ答えを出すと、現行分析や学習が飛びやすい。
- `Unknowns` と `Chosen direction` を混ぜると議論が崩れる。
- 証拠なしの推測を確定扱いすると task board が汚れる。
- mentoring のつもりで implementation まで進めると別 skill の責務になる。

## Output

- 質問主導のレビューコメント
- 現行分析メモ
- 候補案の比較表
- 次に確認する 1 手と学習ポイント

## Validation

- Trigger する prompt:
  - `WebForms の現行仕様を質問しながら整理したい`
  - `ジュニア向けに移行案の候補を比較しながら進めたい`
  - `現行画面の unknowns を task board に残しつつ学習支援したい`
- Trigger しない prompt:
  - `次の modernization slice を実装順付きで決めたい`
  - `EF Core か raw SQL かを architecture 観点で判断したい`
  - `GitHub Copilot の starter 雛形を repo に入れたい`
- Near-miss prompt:
  - `次の 1 behavior を TDD-first で移行したい`
  - `legacy ではなく memory-bank の運用だけを整えたい`

## Trigger risks

### Over-trigger risks

- modernization と mentoring の語だけで execution skill と競合しやすい。
- analysis と implementation を同時に求める依頼では、どちらが主題かを見誤りやすい。

### Under-trigger risks

- `進め方を教えて` `何を確認すべき?` のような短い依頼も mentoring skill の対象になる。
- `task board` や `unknowns` の整理だけでも質問主導なら対象に含める。

## References

- 複数人で共有する task board が必要なときだけ `references/task-board-template.md` を読む。
