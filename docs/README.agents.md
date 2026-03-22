---
title: Custom Agents
parent: Agents
nav_order: 10
description: custom agent を日本語で設計するための README 草案
---

## このページの役割

このページは、`github/awesome-copilot` を前提に「Agent-Creator 相当」の実体を確認し、GitHub Copilot の custom agent を日本語で作るための最小テンプレートをまとめた README 草案です。確認日は 2026-03-20 とします。

この repo では plugin として配布しますが、利用者が実際に custom agent を置く先は consumer repo の `.github/agents/*.agent.md` です。

## 確認結果

- upstream `github/awesome-copilot` に `Agent-Creater` または `Agent Creator` という完全一致名は確認できませんでした
- 最も近い実体は [`agents/custom-agent-foundry.agent.md`](https://raw.githubusercontent.com/github/awesome-copilot/main/agents/custom-agent-foundry.agent.md) です
- upstream の [`docs/README.agents.md`](https://raw.githubusercontent.com/github/awesome-copilot/main/docs/README.agents.md) では `Custom Agent Foundry` が custom agents 一覧に掲載されています
- `Custom Agent Foundry` は VS Code custom agents を設計、作成、見直しする meta-agent と読めます
- [`declarative-agents-architect.agent.md`](https://raw.githubusercontent.com/github/awesome-copilot/main/agents/declarative-agents-architect.agent.md) は Microsoft 365 declarative agents 向けであり、GitHub Copilot の `.github/agents/*.agent.md` を作る用途とは別です
- GitHub 公式の custom agent は [Creating custom agents for Copilot coding agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents) と [Custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration) を source of truth とします

## Custom Agent Foundry の役割要約

`Custom Agent Foundry` は、custom agent そのものではなく、custom agent を設計するための agent です。主な役割は次のとおりです。

- agent の役割、主タスク、制約、対象ユーザーを先に整理する
- 役割に合わせて tools を絞り込む
- frontmatter と Markdown 本文の構成を決める
- `.agent.md` 全文を草案として出力する
- 必要なら handoff や workflow integration まで設計する

つまり `Skill Creator` に対する skill の関係と似ており、`Custom Agent Foundry` は「agent を作るための agent」に最も近い実体です。

## 公式仕様との対応表

| 項目 | `Custom Agent Foundry` の扱い | GitHub 公式 `.github/agents` 仕様 | この repo の最小方針 |
| --- | --- | --- | --- |
| `name` | 使用あり | 任意 | 入れる |
| `description` | 使用あり | 必須 | 入れる |
| `tools` | 使用あり | 任意。省略時は全 tools | 最小テンプレートでは `["read", "search", "edit"]` |
| `model` | 使用あり | 任意 | 最小テンプレートでは省略し、環境既定を継承 |
| 本文 Markdown | 使用あり | 必須 | 役割、手順、出力、制約を明示 |
| 配置先 | `.agent.md` を作る agent として説明 | consumer repo の `.github/agents/*.agent.md` | 配布物は plugin 配下、利用先は `.github/agents/` |
| `argument-hint` | 使用あり | GitHub.com では無視 | 任意拡張として doc に分離 |
| `handoffs` | 使用あり | GitHub.com では無視 | 任意拡張として doc に分離 |
| `target` | 説明なし | 任意。省略時は両環境既定 | 最小テンプレートでは省略 |
| `vscode` tool | 使用あり | GitHub 公式 alias ではない | 最小テンプレートから除外 |
| `web` / `todo` | 使用あり | GitHub.com coding agent では現時点で非適用 | 既定値にしない |
| tool aliases | 独自の例示あり | `read` / `search` / `edit` / `execute` / `agent` などを使用可能 | まず GitHub 公式 alias を使う |

補足:

- GitHub Docs では `argument-hint` と `handoffs` は VS Code などの IDE custom agents 由来で、GitHub.com では無視されると明記されています
- `web` と `todo` も GitHub.com coding agent では現時点で実質的に使えないため、互換コアから外します
- tool 名は IDE ごとの差異を避けるため、最小テンプレートでは GitHub 公式 alias に寄せます

## 日本語版 Agent-Creator 相当の最小テンプレート

consumer repo では、次の内容を `.github/agents/custom-agent-creator.agent.md` として置く想定です。

```md
---
name: Custom Agent Creator (JA)
description: GitHub Copilot custom agent を日本語で設計・作成・見直しする agent
tools: ["read", "search", "edit"]
---

# Custom Agent Creator (JA)

## 役割

あなたは GitHub Copilot の custom agent を日本語で設計、作成、見直しするための agent です。まず GitHub.com 互換の最小構成を固め、そのうえで必要なときだけ VS Code 専用拡張を別案として示します。

## 最初に確認すること

- この依頼は custom agent で解くべきか。skill や instruction の方が適切なら先に切り分ける。
- agent が担う役割、対象ユーザー、主タスク、やってはいけないことを整理する。
- 既存の `.agent.md` がある場合は、新規作成より先に再利用や改訂の余地を確認する。
- 使う tools は最小権限から始め、必要性が説明できるものだけを追加する。

## 作成ワークフロー

1. 要件を整理し、agent の役割を 1 つの明確な責務に絞る。
2. まず GitHub.com 互換の frontmatter を決める。既定では `name`、`description`、必要なら `tools` と `model` だけを使う。
3. 本文では役割、判断基準、作業手順、出力形式、禁止事項を具体的に書く。
4. consumer repo に置く想定の `.github/agents/<agent-id>.agent.md` 全文を完成形で返す。
5. VS Code 専用の `argument-hint` や `handoffs` が必要なら、互換コアとは分けて任意拡張として示す。

## 互換ルール

- デフォルトは GitHub.com と VS Code の両方で読みやすい共通コアにする。
- `argument-hint` と `handoffs` は VS Code では有効だが、GitHub.com では無視される前提で扱う。
- `vscode` tool は GitHub 公式 alias ではないため、最小テンプレートには入れない。
- `web` と `todo` は GitHub.com の coding agent では現時点で実質非適用なので、明確な理由がない限り既定値にしない。
- `execute`、`agent`、`github/*`、`mcp-servers` は、必要な作業と権限の説明ができる場合だけ追加する。
- Microsoft 365 向け declarative agents の相談は別系統なので、GitHub Copilot custom agents と混同しない。

## 出力形式

- 完成した `.agent.md` 全文を返す。
- その下に GitHub.com 互換メモを短く添える。
- VS Code 専用拡張が必要なら、別見出しで追加 snippet を返す。
- 説明は日本語で行い、agent 名、tool 名、frontmatter key などの技術識別子は英語のまま保つ。

## Guardrails

- 役割が曖昧なまま広すぎる agent を作らない。
- 必要性の薄い tools を足さない。
- GitHub.com で使えない項目を互換コアに混ぜ込まない。
- 既存の `.agent.md` を更新できる場面で、不要な新規 agent を増やさない。
- `.agent.md` は部分断片ではなく、すぐ配置できる完成形で返す。
```

## VS Code 専用拡張を足す場合

GitHub.com 互換コアを保ったまま VS Code 向けの補助を追加したいときだけ、次のような snippet を別案として示します。

```yaml
argument-hint: 役割、主タスク、禁止事項、必要な tools を日本語で説明してください
handoffs:
  - label: 実装 agent を下書きする
    agent: implementation-agent
    prompt: いま整理した custom agent 仕様をもとに実装 agent を草案化してください
    send: false
```

この 2 項目は VS Code では役立ちますが、GitHub.com では無視されます。互換コアに混ぜず、任意拡張として扱うのが安全です。

## この repo での配置

この repo では plugin 配布用に次の場所へ格納します。

- `agents/custom-agent-creator.agent.md`
- `plugins/custom-agent-creator-guidance/.github/plugin/plugin.json`

ただし、利用者が実際に custom agent を使うときは、必要に応じて内容を調整したうえで consumer repo の `.github/agents/custom-agent-creator.agent.md` に置いてください。

## 導入手順

1. この repo を VS Code の plugin marketplace として登録し、`custom-agent-creator-guidance` plugin を install する
2. repo root の `agents/custom-agent-creator.agent.md` を確認し、consumer repo に置く agent のたたき台として使う
3. consumer repo の `.github/agents/` に `.agent.md` を追加する
4. まず GitHub.com 互換コアだけで動かし、必要になったときだけ VS Code 専用項目を追加する
5. 既定ブランチへ merge したあと、GitHub Copilot の agent picker から見えることを確認する

## 参考リンク

- [Creating custom agents for Copilot coding agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)
- [Custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [upstream docs/README.agents.md](https://raw.githubusercontent.com/github/awesome-copilot/main/docs/README.agents.md)
- [upstream custom-agent-foundry.agent.md](https://raw.githubusercontent.com/github/awesome-copilot/main/agents/custom-agent-foundry.agent.md)
- [upstream declarative-agents-architect.agent.md](https://raw.githubusercontent.com/github/awesome-copilot/main/agents/declarative-agents-architect.agent.md)
