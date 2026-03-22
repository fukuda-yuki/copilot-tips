---
title: Modernization Mentoring
parent: Guides
nav_order: 71
description: 質問中心の modernization mentoring plugin の説明
---

## このページの役割

このページは、現行 WebForm / WindowsForm のシステムを ASP.NET Core MVC ベースの次世代システムへ移行するときに、ジュニアエンジニアを質問で導く plugin を説明します。汎用 mentoring ではなく、モダナイゼーション案件に限定して判断を減らすことを目的にしています。

## 対象シナリオ

- 現行仕様が曖昧で、画面や DB 挙動を読み解きながら移行したい
- ジュニアエンジニアに、いきなり答えを渡すのではなく質問で導きたい
- 次世代システムの設計案を 2〜3 案で比較し、理由つきで選ばせたい
- EF Core を標準にしつつ、性能要件が厳しい箇所だけ SQL query / Stored Procedure を例外扱いにしたい

## Plugin Catalog

| Plugin | 役割 | 同梱物 | 完成度 |
| --- | --- | --- | --- |
| `dotnet-modernization-guidance` | モダナイゼーション案件で、現行分析と次世代案比較を質問中心で進める | skill: `dotnet-modernization-socratic-mentoring` / agent: `sensei-modernization-mentor` / reference: `task-board-template` | thin |

同じ plugin には、small step の実装計画を前へ進める `dotnet-modernization-slice-guidance` / `modernization-modernizer` も含まれます。実装主導の進め方は [80-modernization](80-modernization.md) を参照してください。

## 通常モード

- まず現行仕様の事実確認を優先します
- 曖昧な仕様は必ず質問し、推測で確定しません
- 次世代案は 2〜3 案に整理し、差分、利点、欠点、推奨案を示します
- コードを出す前に、なぜその設計や実装にするかを説明します

## 緊急モード

本番障害や強い納期制約がある場合だけ、説明付きの最小コード例を許可します。ただし、これは例外です。対応後は必ず短いデブリーフを行い、何を理解できたか、どこが未理解か、次に何を学ぶかを整理します。

## EF Core と SQL / Stored Procedure の扱い

- 標準案は EF Core です
- まず EF Core で Entity 設計、クエリ形状、投影、トランザクションを検討します
- SQL query や Stored Procedure の流用は、性能要件、既存 DB 資産、DB 固有機能、移行コストの根拠が明確なときだけ例外として扱います
- 例外採用時は、なぜ EF Core 単独では不足かを明記し、Data Access の境界を分けて残します

## 共有タスク台帳

- 対象 repo に `memory-bank/task.md` があれば、そこを共有台帳として使います
- `task-board-template` は root skill source の `skills/dotnet-modernization-socratic-mentoring/references/task-board-template.md` にあります
- 各 task には `Task ID / Status / Owner / Legacy behavior / Unknowns / Candidate options / Chosen direction / Evidence / Next step` を持たせます

## Agent / Skill / Instruction の分担

- Agent: `sensei-modernization-mentor`
  - 人格と対話モードを担当します。質問主体、比較提示、緊急時の例外運用を持ちます
- Skill: `dotnet-modernization-socratic-mentoring`
  - 現行分析から学習ふりかえりまでの手順を担当します
- Instruction:
  - Step 1 では追加しません
- Step 2 で `instructions/modernization-mvc.instructions.md` を追加し、`Controller / Service / ViewModel / View / Data / Repository` に対する常時ルールを分離します

## 使い始めの確認

1. marketplace から `dotnet-modernization-guidance` を install する
2. `/skills list` で `dotnet-modernization-socratic-mentoring` が見えることを確認する
3. `/agent` で `sensei-modernization-mentor` が見えることを確認する
4. 対象 repo に `memory-bank/task.md` があるかを確認し、必要なら共有台帳を準備する

## 使い分けメモ

- MVC 設計そのものの整理が主論点なら `aspnetcore-mvc-app-guidance` を優先します
- unit test と Playwright E2E の分担整理なら `aspnetcore-mvc-test-strategy-guidance` を使います
- GitHub Actions の workflow 設計なら `dotnet-playwright-ci-guidance` を使います
- この plugin は、現行分析、仕様質問、移行案比較、学習支援が主論点のときに使います
