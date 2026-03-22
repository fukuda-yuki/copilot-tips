---
title: GitHub Copilot Starter
parent: Guides
nav_order: 73
description: generic starter plugin の説明
---

## このページの役割

このページは、polyglot repo の初期整備で使う `github-copilot-repo-bootstrap-guidance` plugin を説明します。.NET や modernization の前提を入れる前に、GitHub Copilot 向けの共通土台を small step でそろえることを目的にしています。

## 対象シナリオ

- repo に `.github/copilot-instructions.md`、path-specific instructions、custom agents、`memory-bank/` がまだそろっていない
- Agent、Skill、Instruction の役割が混ざり始めており、境界を引き直したい
- 1 回で全面導入せず、reviewable change ごとに少しずつ bootstrap したい
- 言語やフレームワークを決め打ちせず、generic な雛形から始めたい

## Plugin Catalog

| Plugin | 役割 | 同梱物 | 完成度 |
| --- | --- | --- | --- |
| `github-copilot-repo-bootstrap-guidance` | repo-wide rules、file-specific rules、対話 agent、memory-bank の土台を分けて導入する | skill: `github-copilot-repo-bootstrap-guidance` / assets: `starter-repo` / reference: `starter-rollout-checklist` | thin |

## 同梱テンプレート

| パス | 役割 |
| --- | --- |
| `.github/copilot-instructions.md` | repo 全体に効く最小ルールだけを置く |
| `.github/instructions/source-code.instructions.md` | source code にだけ効く常時ルールを分離する |
| `.github/instructions/tests.instructions.md` | テストコードの観点を分離する |
| `.github/instructions/docs.instructions.md` | README / docs の更新ルールを分離する |
| `.github/agents/software-engineer.agent.md` | 実装を small step で進める agent 雛形 |
| `.github/agents/architect.agent.md` | 設計比較と境界整理を行う agent 雛形 |
| `.github/agents/reviewer.agent.md` | findings-first の review を行う agent 雛形 |
| `.github/agents/debugger.agent.md` | 再現、切り分け、根本原因整理を行う agent 雛形 |
| `memory-bank/spec.md` | 長期に守る前提、制約、成功条件を残す |
| `memory-bank/plan.md` | いま進める slice と次の slice を残す |
| `memory-bank/task.md` | 共有タスク台帳と handoff 情報を残す |

## 使い始めの順番

1. marketplace から `github-copilot-repo-bootstrap-guidance` を install し、`/skills list` で skill が見えることを確認します
2. まず `memory-bank/spec.md`、`memory-bank/plan.md`、`memory-bank/task.md` の 3 点だけを入れ、shared source of truth を作ります
3. 次に `.github/copilot-instructions.md` を repo-wide rules だけに絞って入れます
4. file pattern で分けるべき内容だけ `.github/instructions/*.instructions.md` に移します
5. 長めの対話モードが必要な役割だけ `.github/agents/*.agent.md` を持ち込みます
6. 採用した雛形と見送った雛形を `memory-bank/task.md` に残し、次の agent が引き継げる状態にします

## Agent / Skill / Instruction の分担

- Agent:
  - `.github/agents/*.agent.md` を使い、人格、対話モード、推論スタイルを定義します
- Skill:
  - `github-copilot-repo-bootstrap-guidance` を使い、どの順で雛形を入れるか、何を後回しにするかを進めます
- Instruction:
  - `.github/copilot-instructions.md` と `.github/instructions/*.instructions.md` を使い、自動適用されるルールを分離します

この plugin 自体は skill-only plugin です。starter 雛形の正本は `skills/github-copilot-repo-bootstrap-guidance/assets/starter-repo/` に置き、publish 時に plugin 配下へ materialize します。repo 本体へ自動展開はしません。

## 使い分けメモ

- この plugin は generic starter です。MVC、テスト、CI、modernization の固有ルールは別 plugin で足します
- `.github/copilot-instructions.md` に file-specific rule や長い workflow を詰め込みすぎないようにします
- agent にファイルパターン別ルールを書かず、instruction に寄せます
- 既存 repo に近いファイルがある場合は、上書きではなく merge 前提で調整します
