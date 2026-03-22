---
title: Skill Creator
nav_exclude: true
description: skill-creator の人間向け README
---

GitHub Copilot 用の Agent Skill を作成・改善・レビューするための Skill です。

この Skill は、単に `SKILL.md` の雛形を出すだけではなく、**スコープ設計・トリガー文の改善・Gotchas の追加・Validation 設計・人間向けのレビュー観点整理**まで含めて、Skill の品質を引き上げることを目的としています。

---

## これは何か

`skill-creator` は、**Skill 自体を作るための Skill** です。

たとえば、次のような場面で使います。

- 新しい Skill をゼロから作りたい
- 既存 Skill の説明文が曖昧で、発火条件を改善したい
- Skill が広すぎる / 狭すぎるので整理したい
- `SKILL.md` に何を書けばよいか迷っている
- Validation やチェックリスト、テンプレートを追加したい
- 他環境向けの Skill を GitHub Copilot 向けに移植したい

---

## この Skill がやること

この Skill は、次のような成果物を作る支援をします。

- `SKILL.md` の新規作成
- 既存 `SKILL.md` の改善
- Skill の適用範囲（Scope）の整理
- description の改善
- 「いつ使うか / いつ使わないか」の明確化
- `Gotchas` の追加
- `Validation` の設計
- `references/` や `assets/` の切り分け
- 人間向けレビュー観点の整理

---

## 想定しているディレクトリ構成

この Skill は、次のような構成を想定しています。

```text
.github/
└─ skills/
   └─ skill-creator/
      ├─ SKILL.md
      ├─ README.md
      ├─ references/
      │  └─ skill-review-checklist.md
      └─ assets/
         └─ skill-template.md
```

---

## 使いどころ

次のような依頼で呼び出されることを想定しています。

- 「新しい GitHub Copilot Skill を作って」
- 「この Skill の description を改善して」
- 「この Skill、広すぎない？」
- 「Claude 用 Skill を Copilot 用に移植したい」
- 「Skill のレビュー観点を足して」
- 「Validation しやすい構造にして」

---

## この Skill の考え方

この Skill は、次の方針で Skill を作ります。

### 1. 実務に基づく

抽象論ではなく、**実際に繰り返し発生する作業**から Skill を抽出します。

### 2. 手順を重視する

単なる説明文ではなく、**何を見て、どう判断し、何を出力するか**を手順として書きます。

### 3. トリガー精度を重視する

「何に使う Skill か」だけでなく、**何には使わないか**も書きます。

### 4. コンテキストを節約する

`SKILL.md` には常時必要なことだけを書き、詳細は `references/` に逃がします。

### 5. 改善前提で作る

最初の版を完成品とみなさず、**実行 → 見直し → 改善**を前提にします。

---

## 出力の基本方針

この Skill が新しい Skill を作るときは、基本的に次を出力します。

1. 推奨ディレクトリパス
2. `SKILL.md`
3. 必要に応じた `references/` や `assets/`
4. Validation 方針
5. Trigger リスク
6. 改善ポイント

既存 Skill をレビューする場合は、次を出力します。

1. Scope の問題
2. Trigger の問題
3. Instruction の問題
4. 構造上の問題
5. 改善案
6. 改訂版の草案

---

## この Skill が重視するセクション

新しい Skill を作るときは、原則として次のセクションを含めます。

- `Purpose`
- `When to use`
- `When not to use`
- `Inputs to inspect`
- `Workflow`
- `Gotchas`
- `Output`
- `Validation`
- `Trigger risks`

必要に応じて、以下も追加します。

- `References`
- `Assets`
- `Scripts`

---

## Gotchas を重視する理由

Skill は、一般論よりも **「モデルが誤りやすい具体的な罠」** を持っていると強くなります。

たとえば、次のようなものです。

- API の HTTP ステータスだけでは成功判定できない
- 同じ意味の ID が複数の名前で登場する
- リリースブランチは再編集不可
- 出力フォーマットに厳密な制約がある

このような情報は、Skill の品質に直結します。

---

## Validation の考え方

この Skill は、Skill を作ったら終わりではなく、最低限の Validation を入れることを勧めます。

たとえば次のような確認です。

- 明らかに発火すべきプロンプト
- 発火してはいけないプロンプト
- 紛らわしい near-miss プロンプト
- 良い応答例
- よくある失敗例

---

## Subagents について

この Skill は、GitHub Copilot の環境で subagents が使える場合、それを**補助的に**利用することを想定しています。

たとえば次のような使い方です。

- description 候補の比較
- trigger 過剰発火の別視点レビュー
- 既存 Skill の並列点検
- Scope の広すぎ / 狭すぎ判定

ただし、この Skill 自体は **subagents 必須** ではありません。
subagents が使えない環境でも破綻しないように設計されています。

---

## この README の役割

このファイルは **人間向けの説明資料** です。
AI が読む主ファイルは `SKILL.md` です。

- `SKILL.md` … AI 向けの本体
- `README.md` … 人間向けの概要説明
- `references/` … 詳細な補助資料
- `assets/` … テンプレートや固定資産

---

## 関連ファイル

- `SKILL.md`
  Skill 本体。AI が実際に読む instructions。

- `references/skill-review-checklist.md`
  Skill のレビュー時に使う観点一覧。

- `assets/skill-template.md`
  新規 Skill 作成時のテンプレート。

---

## 運用メモ

この Skill を改善するときは、次の順で考えるのがおすすめです。

1. まず description を見直す
2. 次に Scope を見直す
3. 次に Workflow を具体化する
4. 失敗例を `Gotchas` に足す
5. 繰り返し使う部品を `references/` や `assets/` に分離する

---

## ライセンス・由来

この Skill は、Anthropic 公開の `skill-creator` の発想を参考にしつつ、GitHub Copilot で使いやすいように再構成したものです。

Claude 固有の評価基盤や配布方式には依存せず、GitHub Copilot の Skill 構成に合わせて調整しています。

[Creating agent skills for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills?utm_source=chatgpt.com)
[The Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?utm_source=chatgpt.com)
