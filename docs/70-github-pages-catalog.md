---
title: GitHub Pages Catalog
parent: Guides
nav_order: 72
description: docs/ をそのまま GitHub Pages で公開する構成の仕様
---

## このページの役割

このページは、独自 Astro 実装を持たず `docs/` そのものを GitHub Pages で公開する構成を maintainer / contributor 向けに仕様化するためのページです。目的は「repo root の `agents/` `skills/` `instructions/` を docs 側から見つけられる状態を、低コストで維持すること」です。

- end-user 向けの概要説明は [60-agent-plugins](60-agent-plugins.md) に残します
- このページでは source of truth、Pages publish 条件、docs 情報設計、更新手順を明記します
- repo settings はこの docs からは変更できないため、手動設定が必要な箇所も明示します

## source of truth

| パス | 役割 | 変わるもの |
| --- | --- | --- |
| `docs/_config.yml` | Just the Docs と GitHub Pages の基本設定 | nav、search、base URL、theme の挙動 |
| `docs/index.md` | Pages の Hub top | 入口導線、読む順番、section link |
| `docs/agents/index.md` | agent 一覧 | docs から辿れる agent の一覧 |
| `docs/skills/index.md` | skill 一覧 | docs から辿れる skill の一覧 |
| `docs/instructions/index.md` | instruction 一覧 | docs から辿れる instruction の一覧 |
| `docs/plugins/index.md` | plugin 一覧 | install 単位の plugin 一覧 |
| `agents/*.agent.md` | agent 本文の正本 | GitHub 上で開く agent の詳細本文 |
| `skills/*/SKILL.md` | skill 本文の正本 | GitHub 上で開く skill の詳細本文 |
| `instructions/*.instructions.md` | instruction 本文の正本 | GitHub 上で開く instruction の詳細本文 |
| `plugins/<plugin-id>/.github/plugin/plugin.json` | plugin 構成の正本 | plugin の同梱物、version、description |
| `.github/plugin/marketplace.json` | marketplace 公開 metadata の正本 | 公開 description、公開 version |

Pages 上で配るのは discovery 用の index だけです。各 resource の本文は GitHub 上の source file を正本とし、Pages 内へ detail page を複製しません。

## ディレクトリ構成

```text
repo-root/
├─ agents/
│  └─ *.agent.md
├─ skills/
│  └─ <skill-id>/SKILL.md
├─ instructions/
│  └─ *.instructions.md
├─ plugins/
│  └─ <plugin-id>/
│     ├─ .github/plugin/plugin.json
│     └─ README.md
└─ docs/
   ├─ _config.yml
   ├─ index.md
   ├─ agents/index.md
   ├─ skills/index.md
   ├─ instructions/index.md
   ├─ plugins/index.md
   └─ *.md
```

`docs/` は publish 用 site root、repo root の `agents/` `skills/` `instructions/` は本文の正本、`plugins/` は install 単位です。この 3 役を混ぜません。

## Pages の構成

### 採用技術

- GitHub Pages の source は branch publish を使います
- theme は Just the Docs を remote theme で使います
- search は Just the Docs 標準の client-side search に任せます
- rich filter、plugin/version facet、resource detail page は v1 では持ちません

### 公開 URL

| 種別 | URL |
| --- | --- |
| top | `/` |
| agent index | `/agents/` |
| skill index | `/skills/` |
| instruction index | `/instructions/` |
| plugin index | `/plugins/` |
| guide index | `/guides/` |

既存の numbered docs は guide として公開します。旧 Astro site の detail URL は引き継ぎません。

### nav のルール

- top-level nav は `Home`, `Agents`, `Skills`, `Instructions`, `Plugins`, `Guides`, `Source Map` を基本にします
- guide 系 docs は front matter の `parent: Guides` と `nav_order` で束ねます
- `docs/README.agents.md` は `Agents` の子として扱います
- 人間向け補助資料で nav に出したくないものは `nav_exclude: true` を使います

### link のルール

- `docs/` を Pages source にすると、repo root への相対リンクは 404 になります
- `agents/` `skills/` `instructions/` `plugins/` の本文リンクは GitHub absolute URL にします
- `examples/workflows/*.yml` のような補助資料も、Pages から辿る場合は GitHub absolute URL にします

## GitHub Pages publish 条件

### repository settings

GitHub Pages の repository settings は次に合わせます。

1. Source: `Deploy from a branch`
2. Branch: `main`
3. Folder: `/docs`

この設定は workflow から変更しません。maintainer が repository settings で手動設定します。

### workflow 側の扱い

- `docs-quality.yml` は docs lint / link / Jekyll build validation を担当します
- `publish.yml` は `staged` から `main` へ publish するときに plugin materialize と marketplace 生成だけを担当します

## 更新手順

### agent / skill / instruction を追加するとき

1. repo root の正本を追加する
2. 必要なら plugin manifest に同梱物を追加する
3. docs の対応 index を同じ PR で更新する
4. link check と Jekyll build validation を通す

自動反映されないもの:

- docs index への掲載
- 使いどころの説明
- plugin との対応表

### plugin を追加するとき

1. `plugins/<plugin-id>/.github/plugin/plugin.json` を追加する
2. `plugins/<plugin-id>/README.md` を追加する
3. `.github/plugin/marketplace.json` を更新する
4. `docs/plugins/index.md` に行を追加する

### theme / nav を調整するとき

1. `docs/_config.yml` を更新する
2. front matter を直したページの nav を確認する
3. `docs-quality.yml` の Jekyll build validation が通ることを確認する

## 非目標

- Pages 上で agent / skill / instruction の detail HTML を自動生成しない
- `eng/` を v1 の Pages 導線に含めない
- 本家 `github/awesome-copilot` の UI や build pipeline をそのまま再現しない

## 補足

- root の `instructions/` は `examples/instructions/` から昇格した正本です
- maintainer は repository settings の Pages source を `main:/docs` に保ってください
