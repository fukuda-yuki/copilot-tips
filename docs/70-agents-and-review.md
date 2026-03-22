---
title: Agents and Review
parent: Guides
nav_order: 70
description: review と upgrade / modernization の入口
---

## このページの役割

このページは、既存の ASP.NET Core MVC アプリを保守フェーズで改善するときに、Copilot の code review と .NET upgrade / modernization をどう使い分けるかを整理する入口です。ここでは「自動化を増やすこと」よりも、「人手レビューを残したまま差分確認と upgrade 作業を段階化すること」を優先します。

## 先に読むとよいページ

- MVC の責務分離と入力処理の前提は [20-aspnetcore-mvc](20-aspnetcore-mvc.md) を先に読んでおくと判断がぶれにくいです
- upgrade 後の検証導線は [30-testing-unit](30-testing-unit.md)、[40-testing-e2e-playwright](40-testing-e2e-playwright.md)、[50-github-actions](50-github-actions.md) とつながります
- plugin / agent の配布前提を確認したい場合は [60-agent-plugins](60-agent-plugins.md) と [README.agents](README.agents.md) を参照してください
- 採用した source は [90-source-map](90-source-map.md) で確認できます

## MVC での典型ユースケース

- PR を出す前にローカル差分 review と PR review の両方を使い、明らかな壊れを先に落としたい
- Controller、ViewModel、Model Binding、再表示まわりの guardrail を review へ反映したい
- `TargetFramework`、NuGet package、CI workflow をまとめて見ながら安全に upgrade したい
- 複数 solution で繰り返す置換作業を custom upgrade instructions に切り出したい

## Curated Items

| ID | 種別 | 用途 | MVC 適合度 | そのまま使えるか / 調整要否 | 併用候補 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | Official Docs | Copilot code review の提供範囲、quota、人間レビュー前提を確認する | 高 | そのまま参照しやすい。excluded files と premium request の扱いはチーム運用に追記が必要 | R02, R03, R04 | [About GitHub Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review) |
| R02 | Official Docs | GitHub.com や IDE で review を起動する手順を確認する | 高 | そのまま参照しやすいが、利用環境ごとの導線整理は必要 | R01, R03 | [Using GitHub Copilot code review](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review) |
| R03 | Official Docs | `.github/copilot-instructions.md` と path-specific instructions で review 基準を揃える | 高 | 4,000 文字制限と `excludeAgent` の使い分けに注意が必要 | R01, R02, R04 | [Adding repository custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions) |
| R04 | Official Docs | commit 前に CLI から差分 review を挟む | 中 | ローカル diff 確認に向く。PR review の代替ではなく前段として使う | R01, R02 | [Requesting a code review with GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/agentic-code-review) |
| R05 | Official Docs | `modernize-dotnet` の対象範囲と対応環境を把握する | 高 | ASP.NET Core MVC も対象。Azure 移行機能は必要になったときだけ広げる | R06, R07 | [GitHub Copilot modernization overview](https://learn.microsoft.com/en-us/dotnet/core/porting/github-copilot-app-modernization/overview) |
| R06 | Official Docs | upgrade の 3 段階 workflow と `.github/upgrades` の使い方を確認する | 高 | そのまま参照しやすい。branch を切って段階ごとに確認する前提で使う | R05, R07, [50-github-actions](50-github-actions.md) | [How to upgrade a .NET app with GitHub Copilot modernization](https://learn.microsoft.com/en-us/dotnet/core/porting/github-copilot-app-modernization/how-to-upgrade-with-github-copilot) |
| R07 | Official Docs | 反復的な置換を custom upgrade instructions に逃がす | 中 | 変換単位を 1 ファイル 1 目的に絞ると扱いやすい | R03, R05, R06 | [Apply custom upgrade instructions for .NET upgrades](https://learn.microsoft.com/en-us/dotnet/core/porting/github-copilot-app-modernization/how-to-custom-upgrade-instructions) |

## 最初の運用順

1. R01 と R02 で、PR review をどの環境で回すかを先に決める
2. MVC 固有の review 観点は R03 を使い、`.github/copilot-instructions.md` または path-specific instructions に切り出す
3. commit 前のローカル差分には R04 を使い、PR review の前段で粗い問題を落とす
4. framework upgrade に入るときだけ R05 と R06 へ進み、`.github/upgrades/assessment.md` / `plan.md` / `tasks.md` を段階ごとに確認する
5. 同じ置換が複数 solution で繰り返し出るなら R07 で custom upgrade instructions を作る

## 使い分けメモ

- Copilot code review は human review の代替にしません。見落としや誤判定を前提に、人手レビューとセットで扱います
- code review には premium request quota と excluded files があるため、依存関係ファイルや lock file の確認を丸投げしません
- review 用 custom instructions は code review で先頭 4,000 文字までしか読まれません。冗長な一般論より、MVC で本当に見たい観点を短く残す方が有効です
- .NET modernization は branch 作成と `.github/upgrades` 配下の Markdown を伴う段階実行です。assessment / plan / tasks を人手で止めながら進める前提で使います
- 2026-03-21 確認時点では Microsoft Learn は `.NET Upgrade Assistant` を deprecated とし、主導線を GitHub Copilot modernization に寄せています。upstream の `dotnet-upgrade.agent.md` は参考になりますが、現行運用の source of truth にはしません
