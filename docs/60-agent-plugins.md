---
title: Agent Plugins
parent: Guides
nav_order: 60
description: plugin marketplace と install 導線の入口
---

## このページの役割

このページは、この repo を VS Code の plugin marketplace として配布し、ユーザーが必要な plugin を個別に選んで install できるようにするための入口です。taxonomy を整理し、MVC app、test strategy、CI、delivery policy、bootstrap、shared workflow、modernization を別 plugin として配る前提でまとめています。

## 先に読むとよいページ

- まず [20-aspnetcore-mvc](20-aspnetcore-mvc.md) で MVC の責務分離と入力処理の前提を確認しておくと、plugin の境界がぶれにくくなります
- テストや CI までまとめて配る前提では [30-testing-unit](30-testing-unit.md)、[40-testing-e2e-playwright](40-testing-e2e-playwright.md)、[50-github-actions](50-github-actions.md) を先に読んでおくとつながりやすいです
- 採用した source は [90-source-map](90-source-map.md) で確認できます

## MVC での典型ユースケース

- MVC app 実装、test strategy、CI、delivery policy を用途別 plugin として分けて配りたい
- repo bootstrap と shared workflow を別 plugin にし、導入と継続運用を混ぜたくない
- modernization 案件だけに execution skill と Socratic mentoring をまとめた plugin を配りたい
- VS Code 上で `@agentPlugins` を使い、install / enable / disable を plugin 単位で管理したい

## Curated Items

| ID | 種別 | 用途 | MVC 適合度 | そのまま使えるか / 調整要否 | 併用候補 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | Official Docs | Agent Plugin の導入、Git URL からのインストール、管理方法を確認する | 高 | Preview 前提なので、表示されない場合の設定確認は追記が必要 | P02, P03 | [Agent plugins in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) |
| P02 | Official Docs | skill の配置、frontmatter、読み込み方を確認する | 高 | そのまま参照しやすい。skill 名と directory 名の一致は実装で守る必要がある | P01, P04 | [Use Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills) |
| P03 | Official Docs | agent の role と tools 制限を決める | 高 | そのまま参照しやすいが、使える tool 名は VS Code 側の提供状況に合わせて調整が必要 | P01, P02 | [Custom agents in VS Code](https://code.visualstudio.com/docs/copilot/customization/custom-agents) |
| P04 | Official Docs | `plugin.json` と marketplace directory structure の最小要件を確認する | 高 | VS Code 向けに配る場合でも、manifest と directory structure の確認に使いやすい | P01, P02 | [Creating a plugin for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating) |

## Plugin Catalog

| Plugin | 役割 | 同梱物 | 完成度 |
| --- | --- | --- | --- |
| `csharp-dotnet-coding-baseline-guidance` | C# / .NET の命名、非同期、例外、DI、層分割の基準線をそろえる | skill: `csharp-dotnet-coding-baseline-guidance` | thin |
| `csharp-dotnet-architecture-expert-guidance` | C# / .NET の設計、性能、セキュリティ、EF Core 例外判断を expert 観点で整理する | skill: `csharp-dotnet-architecture-expert-guidance` / agent: `csharp-dotnet-expert` / reference: `data-access-exception-checklist` | thin |
| `aspnetcore-mvc-app-guidance` | MVC 画面設計、Controller / ViewModel 分離、PRG、入力再表示を整理する | skill: `aspnetcore-mvc-app-guidance` / agent: `aspnetcore-mvc-guide` | 実用版 |
| `aspnetcore-mvc-test-strategy-guidance` | unit test、integration test、Playwright E2E の境界と locator 方針を整理する | skill: `aspnetcore-mvc-test-strategy-guidance` | thin |
| `dotnet-playwright-ci-guidance` | `.NET test` と Playwright の CI 設計を整理する | skill: `dotnet-playwright-ci-guidance` | thin |
| `github-actions-delivery-policy-guidance` | deploy / promotion / approval / rollback の policy layer を整理する | skill: `github-actions-delivery-policy-guidance` / reference: `cicd-rollout-checklist` | thin |
| `github-actions-workflow-spec-guidance` | 既存 GitHub Actions workflow を AI 向け Markdown 仕様へ落とす | skill: `github-actions-workflow-spec-guidance` / reference: `workflow-spec-template` | thin |
| `github-copilot-repo-bootstrap-guidance` | polyglot repo の初期整備で instructions / agents / memory-bank の最小雛形を入れる | skill: `github-copilot-repo-bootstrap-guidance` / assets: `starter-repo` / reference: `starter-rollout-checklist` | thin |
| `memory-bank-shared-workflow-guidance` | `memory-bank/spec / plan / task` を継続運用の shared workflow にする | skill: `memory-bank-shared-workflow-guidance` / reference: `spec-driven-checklist` | thin |
| `behavior-first-test-integrity-guidance` | behavior-first な test review で implementation-friendly なテストを抑止する | skill: `behavior-first-test-integrity-guidance` / agent: `polyglot-test-agent` / reference: `test-integrity-checklist` | thin |
| `dotnet-modernization-guidance` | WebForms / WinForms から ASP.NET Core MVC への移行を、vertical slice 実装支援と質問主導 mentoring の両方で整理する | skills: `dotnet-modernization-slice-guidance`, `dotnet-modernization-socratic-mentoring` / agents: `modernization-modernizer`, `sensei-modernization-mentor` | 実用版 + thin |
| `custom-agent-creator-guidance` | GitHub Copilot custom agent の設計、草案化、見直しを日本語で支援する | agent: `custom-agent-creator` | 実用版 |

## GitHub Pages Catalog

`github/awesome-copilot` と同じく、GitHub Pages 上で plugin / skill / agent / instruction をブラウズできる導線を持たせます。ただし専用の `website/` 実装は使わず、`docs/` 自体を GitHub Pages で公開する構成へ寄せます。

- このページは運用 overview です。詳細仕様は [70-github-pages-catalog](70-github-pages-catalog.md) に分離します
- 公開 site には Hub、plugin 一覧、skill 一覧、agent 一覧、instruction 一覧を含めます
- 詳細本文は Pages 上へ複製せず、GitHub 上の source file を正本とします
- source of truth は `agents/`、`skills/`、`instructions/`、`plugins/<plugin-id>/.github/plugin/plugin.json` です

## インストール手順

1. `chat.plugins.enabled` を有効にする
2. `chat.plugins.marketplaces` に `https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc.git` を追加する
3. Extensions view で `@agentPlugins` を開く
4. 必要な plugin を install し、初回 trust prompt を確認する
5. Installed view または Chat view の gear icon > Plugins で enable / disable を切り替える
6. bootstrap / workflow / CI / delivery policy plugin を入れた場合は `/skills list` で `github-copilot-repo-bootstrap-guidance`、`memory-bank-shared-workflow-guidance`、`github-actions-workflow-spec-guidance`、`github-actions-delivery-policy-guidance` が見えることを確認する
7. test integrity plugin を入れた場合は `/skills list` と `/agent` で `behavior-first-test-integrity-guidance` と `polyglot-test-agent` が見えることを確認する
8. C# expert plugin を入れた場合は `/skills list` と `/agent` で `csharp-dotnet-architecture-expert-guidance` と `csharp-dotnet-expert` が見えることを確認する
9. MVC plugin を入れた場合は `/skills list` と `/agent` で `aspnetcore-mvc-app-guidance` と `aspnetcore-mvc-guide` が見えることを確認する
10. モダナイゼーション plugin を入れた場合は `/skills list` と `/agent` で `dotnet-modernization-slice-guidance`、`dotnet-modernization-socratic-mentoring`、`modernization-modernizer`、`sensei-modernization-mentor` が見えることを確認する

## Troubleshooting

### GUI で先に試すこと

- `AGENT PLUGINS` ビューの refresh を押す
- `Developer: Reload Window` を実行する
- `chat.plugins.marketplaces` から marketplace URL を一度外して再追加する

VS Code は marketplace repo の clone と plugin list cache を内部で持つため、repo 側で plugin を追加しても一覧がすぐに追いつかない場合があります。通常は refresh で足りますが、追いつかない場合は次の internal cache clear を行います。

### internal cache clear

GUI で解消しない場合だけ、VS Code を閉じてから次を行います。

1. marketplace clone を削除する

```text
C:\Users\mwam0\AppData\Roaming\Code\agentPlugins\github.com\FUKUDA-YUKI\awesome-copilot-ja-dotnet-mvc
```

1. それでも追いつかない場合だけ global state を削除する

```text
C:\Users\mwam0\AppData\Roaming\Code\User\globalStorage\state.vscdb
```

- `state.vscdb` は VS Code 全体の UI state / cache も持つため、先に `state.vscdb.bak` へ rename するか backup を取ってから削除する
- 最小手順は clone directory の削除だけでよい。まずはそちらを先に試し、解消しない場合だけ `state.vscdb` まで進める
- 削除後は VS Code を起動し直し、`@agentPlugins` を開いて一覧を再取得する

## local path で使う場合

end-user 向けの正式導線は marketplace です。maintainer / advanced user がローカル clone から試す場合だけ、`chat.pluginLocations` に plugin directory を登録します。

```json
{
  "chat.pluginLocations": {
    "C:/path/to/awesome-copilot-ja-dotnet-mvc/plugins/aspnetcore-mvc-app-guidance": true,
    "C:/path/to/awesome-copilot-ja-dotnet-mvc/plugins/aspnetcore-mvc-test-strategy-guidance": false
  }
}
```

## 使い分けメモ

- marketplace manifest は [`.github/plugin/marketplace.json`](https://github.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/main/.github/plugin/marketplace.json) を基準に管理します
- plugin ごとの実体は `plugins/<plugin-id>/.github/plugin/plugin.json` と `skills/` / `agents/` に閉じます
- end-user 向け docs では marketplace install を主導線にし、`Chat: Install Plugin From Source` は案内しません
- repo の初期整備だけを generic に進めたいときは `github-copilot-repo-bootstrap-guidance` を先に使い、継続運用は `memory-bank-shared-workflow-guidance` に分けます
- workflow YAML の仕様化は `github-actions-workflow-spec-guidance`、CI の実行設計は `dotnet-playwright-ci-guidance`、delivery policy は `github-actions-delivery-policy-guidance` に分けます
- test quality gate は `behavior-first-test-integrity-guidance`、C# の深い設計判断は `csharp-dotnet-architecture-expert-guidance` に寄せます
- `dotnet-modernization-guidance` のような案件特化 plugin は、一般論の寄せ集めではなく execution と mentoring の境界を持たせます
- mentoring 系では `Agent = 人格`, `Skill = 手順`, `Instruction = 常時ルール` を混ぜず、instruction は別段で追加します
