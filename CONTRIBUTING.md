# コントリビューションガイド

Skill / Agent / プラグインを追加・変更する人 (と AI エージェント) 向けの手順です。使い方は [README.md](README.md) を見てください。

## 準備

Node.js 22 以上が必要です。依存パッケージは無いので `npm install` は不要です。clone したら一度だけ次を実行します (Claude Code はセッション開始時に自動で設定します)。

```bash
npm run setup   # git hook を有効にする
```

## 変更の流れ

1. `main` から作業ブランチを切る
2. 下の手順に沿って編集し、commit する
3. `main` 宛ての Pull Request を作る。マージされると GitHub Actions が配布用の `marketplace` ブランチへ自動で反映する

`marketplace` ブランチは自動生成なので編集しません。

## 自動で確認されること

| いつ | 何をするか |
| --- | --- |
| commit 時 (`pre-commit`) | 生成ファイルを更新して commit に含め、検証とテストを実行する |
| commit 時 (`commit-msg`) | メッセージが `feat: ...` `fix: ...` `docs: ...` `chore: ...` などで始まるか確認する |
| push 時 (`pre-push`) | `main` / `marketplace` への直接 push を止め、`version` の上げ忘れを確認する |
| Pull Request (`validate`) | 検証・テスト・ビルドを実行する。通らないとマージできない |
| Claude Code の操作前 | 生成ファイルの手編集と、hook の回避 (`--no-verify`) を止める |

手動で実行する場合のコマンドです。

```bash
npm run validate   # 規約どおりか、生成ファイルが最新か、version を上げ忘れていないか
npm test           # スクリプトのテスト
npm run build      # 生成ファイルを更新し、dist/ に配布物を生成する (dist/ は commit しない)
```

## ディレクトリ構成

```text
skills/<skill-name>/SKILL.md        Skill 本体 (references/ や assets/ を同梱可)
agents/<agent-name>.agent.md        Copilot 用カスタムエージェント
instructions/<name>.instructions.md Copilot 用 instruction (プラグインには入らない)
plugins/<plugin-name>/plugin.json   プラグインの定義 (何を同梱するかの宣言だけ)
plugins/<plugin-name>/README.md     プラグインの説明
.github/plugin/marketplace.json     [生成] Copilot CLI / VS Code 用マーケットプレイス定義
.claude-plugin/marketplace.json     [生成] Claude Code 用マーケットプレイス定義
README.md                           「カタログ」の節は [生成]
eng/                                検証・ビルド用スクリプト
.githooks/ .claude/                 git hook と Claude Code の hook
```

Skill や Agent の実体はリポジトリ直下の `skills/` `agents/` に 1 つだけ置き、プラグインはそれを参照します。`agents/` と `instructions/` は中身ができたときに作ります。

## Skill を追加・変更する

1. `skills/<skill-name>/SKILL.md` を作る。frontmatter の `name` はフォルダ名と同じ、`description` は「いつ使うか」が分かる 1 行にする
2. 既存のプラグインの `plugin.json` に追加するか、新しい `plugins/<plugin-name>/` (`plugin.json` と `README.md`) を作る
3. 既存のプラグインの中身を変えたときは `version` を上げる。利用者側の更新検知に使われる
4. `npm run build` を実行し、`dist/plugins/<plugin-name>/` の中身が意図どおりか確認する

## plugin.json の書き方

[Agent Plugins 仕様 1.0.0](https://github.com/agentplugins/agent-plugins-spec) に従います。同梱内容はこのリポジトリ専用の名前空間に宣言し、配布時に取り除かれます。

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

`agents` は `./agents/<agent-name>.md` と書きます (元ファイルは `agents/<agent-name>.agent.md`)。

## 配布物の構成 (`marketplace` ブランチ)

```text
plugins/<plugin-name>/plugin.json                    仕様準拠の manifest (同梱宣言は除去済み)
plugins/<plugin-name>/skills/...                     実体化された Skill
plugins/<plugin-name>/com.github.copilot/agents/...  実体化された Agent
skills/ agents/ instructions/                        単体取得用のコピー
.github/plugin/ .claude-plugin/                      同じブランチ内の plugins/<name> を指す定義
README.md AGENTS.md CLAUDE.md                        「配布専用・編集は main へ」の案内つき
```
