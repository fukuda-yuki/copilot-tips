---
title: Home
nav_order: 1
description: agents / skills / instructions / plugins の入口をまとめた docs hub
---

この docs は、`github/awesome-copilot` の repo 構成に寄せつつ、専用フロントエンドを持たず `docs/` そのものを GitHub Pages で公開するための Hub です。

公開サイトでは discovery を優先し、実体の source of truth は repo root に残します。

| 見たいもの | 入口 | 役割 |
| --- | --- | --- |
| Agent | [Agents](agents/) | どの agent を使うかを決める |
| Skill | [Skills](skills/) | どの skill を入れるかを決める |
| Instruction | [Instructions](instructions/) | 常時適用ルールのたたき台を探す |
| Plugin | [Plugins](plugins/) | install する plugin を決める |
| 解説 docs | [Guides](guides.md) | 読む順番と背景を追う |
| 参照元 | [Source Map](90-source-map.md) | 採用ソースを確認する |

## この repo の考え方

- `agents/`, `skills/`, `instructions/` が人間に見せる source of truth です
- `plugins/` は marketplace 配布用の宣言型 package です
- GitHub Pages では一覧ページだけを持ち、詳細本文は GitHub 上の実ファイルを正本とします
- rich filter や detail page を持つ専用 catalog は v1 では作りません

## 最初に見る順番

1. [Overview](01-overview.md) で全体像をつかむ
2. [Agents](agents/) / [Skills](skills/) / [Instructions](instructions/) から必要な素材を選ぶ
3. 実際に install する単位は [Plugins](plugins/) で確認する
4. 詳細な背景や採用理由は [Guides](guides.md) と [Source Map](90-source-map.md) で追う
