# AGENTS.md

このリポジトリで作業する AI エージェント (Claude Code / GitHub Copilot など) と人間のメンテナー向けの手引きです。作業前に必ず読んでください。

## このリポジトリの目的

`github/awesome-copilot` のように、Skill / Agent / Instruction を **プラグインとして誰でも簡単にインストールできるカタログ** を提供します。利用者は次のようなコマンド 1 つで自分の環境に導入できます。

```bash
copilot plugin marketplace add fukuda-yuki/copilot-tips
copilot plugin install <plugin-name>@copilot-tips
```

オーナーはツールの内部に詳しくありません。説明は日本語で平易に行い、気づいた改善は積極的に提案してください。

## 最重要ルール: ブランチの役割

| ブランチ | 役割 | 編集してよいか |
| --- | --- | --- |
| `staged` | **正本**。すべての実装・編集はここに入れる | Pull Request 経由で可 |
| `main` | **配布専用**。GitHub Actions が `staged` から自動生成する | **不可** (人もエージェントも直接編集しない) |

- 作業ブランチは必ず `staged` から切り、Pull Request は必ず `staged` 宛てに作る
- `main` 宛ての Pull Request は `check-pr-target` workflow が失敗させる
- `main` への直接 push、force-push、`main` の履歴の書き換えはしない
- `main` は GitHub のデフォルトブランチのままにする。利用者の `marketplace add` や `apm install` がデフォルトブランチを読むため
- セッション開始時に `main` が checkout されていたら、まず `git fetch origin staged` して `staged` を基準に作業する

## 公開の流れ

```text
作業ブランチ ──PR──> staged ──(Actions: publish.yml)──> main
                     正本                               配布物
```

1. `staged` 宛ての Pull Request で `validate.yml` が検証・テスト・ビルドの試行を行う
2. `staged` にマージされると `publish.yml` が `npm run build` で `dist/` を生成する
3. `dist/` の中身で `main` を丸ごと置き換える commit を積む (履歴は残る。差分が無ければ何もしない)

## ディレクトリ構成 (正本 = staged)

```text
skills/<skill-name>/SKILL.md        Skill 本体 (references/ や assets/ を同梱可)
agents/<agent-name>.agent.md        Copilot 用カスタムエージェント
instructions/<name>.instructions.md Copilot 用 instruction (プラグインには入らない)
plugins/<plugin-name>/plugin.json   プラグインの定義 (何を同梱するかの宣言だけ)
plugins/<plugin-name>/README.md     プラグインの説明
eng/                                検証・ビルド用スクリプト (Node.js、外部依存なし)
.github/workflows/                  validate / publish / check-pr-target
.github/skills/                     このリポジトリでの作業を助ける Skill (配布対象外)
```

中身 (Skill や Agent) は必ずリポジトリ直下の `skills/` `agents/` に 1 つだけ置き、プラグインはそれを **参照するだけ** にします。同じ Skill を複数のプラグインに入れても正本は 1 つです。

### plugin.json の書き方

[Agent Plugins 仕様 1.0.0](https://github.com/agentplugins/agent-plugins-spec) に従います。同梱内容はこのリポジトリ専用の名前空間 `io.github.fukuda-yuki.copilot-tips` に宣言します。

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-plugin",
  "description": "このプラグインで何ができるか",
  "version": "0.1.0",
  "author": { "name": "fukuda-yuki", "url": "https://github.com/fukuda-yuki" },
  "repository": "https://github.com/fukuda-yuki/copilot-tips",
  "extensions": {
    "io.github.fukuda-yuki.copilot-tips": {
      "skills": ["./skills/my-skill/"],
      "agents": ["./agents/my-agent.md"]
    }
  }
}
```

- `name` はフォルダ名と一致させる (小文字英数字とハイフン)
- `skills` は `./skills/<skill-name>/`、`agents` は `./agents/<agent-name>.md` (元ファイルは `agents/<agent-name>.agent.md`)
- 内容を変えたら `version` を上げる。利用者側の更新検知に使われる
- `plugins/<plugin-name>/` の中に `skills/` などの実体を置かない。配布時に Actions が生成する

## 配布物の構成 (main、自動生成)

```text
README.md                              カタログ一覧とインストール方法
AGENTS.md / CLAUDE.md                  「ここは編集禁止、staged へ」という案内
.github/plugin/marketplace.json        Copilot CLI / VS Code 用マーケットプレイス定義
.claude-plugin/marketplace.json        Claude Code 用マーケットプレイス定義
plugins/<plugin-name>/plugin.json      仕様準拠の manifest (同梱宣言は除去済み)
plugins/<plugin-name>/skills/...       実体化された Skill
plugins/<plugin-name>/com.github.copilot/agents/...  実体化された Agent
skills/ agents/ instructions/          単体取得用のコピー (apm install など)
```

`eng/` や `.github/workflows/` などの開発用ファイルは `main` には入りません。

## コマンド

```bash
npm run validate   # 正本が規約どおりか検証する
npm test           # 検証 + スクリプトのテスト
npm run build      # dist/ に配布物を生成する (dist/ は commit しない)
```

依存パッケージは無いので `npm install` は不要です (Node.js 22 以上)。

## 作業手順

### Skill を追加・変更する

1. `skills/<skill-name>/SKILL.md` を作る。frontmatter の `name` はフォルダ名と同じ、`description` は「いつ使うか」が分かる 1 行にする
2. 既存プラグインに入れるか、新しい `plugins/<plugin-name>/` (`plugin.json` と `README.md`) を作って宣言する
3. 変更したプラグインの `version` を上げる
4. `npm test` と `npm run build` を通し、`dist/plugins/<plugin-name>/` の中身を確認する
5. `staged` 宛てに Pull Request を作る

### ビルドや検証の仕組みを変える

- `eng/lib.mjs` の `CATALOG` がカタログ名・リポジトリ名・ブランチ名の唯一の定義
- 配布物の形を変えたら `eng/catalog.test.mjs` とこのファイルの「配布物の構成」も更新する
- スクリプトは外部依存なしを保つ (publish を単純で壊れにくくするため)

## 規約

- 文章は日本語を基本とし、識別子・コマンド・ファイル名は英語のまま
- ファイル名・フォルダ名は小文字英数字とハイフン
- 改行コードは LF (`.gitattributes` で強制)
- commit メッセージは `docs: ...` `feat: ...` `fix: ...` `chore: ...` のような短い命令形

## 設計の背景

- `awesome-copilot` も「正本ブランチ → Actions → 配布ブランチ」の 2 ブランチ方式。以前は `staged` → `main`、現在は `main` → `marketplace` に名前が変わっている。このリポジトリは、利用者がデフォルトブランチ指定なしでインストールできるよう `staged` → `main` を採用している
- `awesome-copilot` は正本のプラグインフォルダ内へ実体を書き込むが、このリポジトリは `dist/` へ別出力する。正本に生成物が紛れ込む事故を防ぐため
- `microsoft/apm` は利用者側のインストーラ。`main` に仕様準拠の `plugins/<name>/plugin.json` と `skills/<name>/SKILL.md` があれば、追加設定なしで `apm install` できる
