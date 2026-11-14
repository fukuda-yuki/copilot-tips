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
| 毎日 09:00 と `main` の更新時 (`board`) | Skill 評判ボードを集計して GitHub Pages に公開する ([下記](#skill-評判ボード)) |
| Claude Code の操作前 | 生成ファイルの手編集と、hook の回避 (`--no-verify`) を止める |

手動で実行する場合のコマンドです。

```bash
npm run validate   # 規約どおりか、生成ファイルが最新か、version を上げ忘れていないか
npm test           # スクリプトのテスト
npm run build      # 生成ファイルを更新し、dist/ に配布物を生成する (dist/ は commit しない)
npm run board      # Skill 評判ボードを dist/board/ に生成する (数字は 0。見た目の確認用)
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
eng/                                検証・ビルド・評判ボード用スクリプト
.githooks/ .claude/                 git hook と Claude Code の hook
```

Skill や Agent の実体はリポジトリ直下の `skills/` `agents/` に 1 つだけ置き、プラグインはそれを参照します。`agents/` と `instructions/` は中身ができたときに作ります。

## Skill を追加・変更する

1. `skills/<skill-name>/SKILL.md` を作る。frontmatter の `name` はフォルダ名と同じ、`description` は「いつ使うか」が分かる 1 行にする
2. 既存のプラグインの `plugin.json` に追加するか、新しい `plugins/<plugin-name>/` (`plugin.json` と `README.md`) を作る
3. 既存のプラグインの中身を変えたときは `version` を上げる。利用者側の更新検知に使われる
4. `npm run build` を実行し、`dist/plugins/<plugin-name>/` の中身が意図どおりか確認する

## 他者の著作物を元にした Skill

- ライセンスが再配布と改変を認めているものだけを入れる。元のライセンス文を `skills/<skill-name>/LICENSE.txt` に置き、出典と変更点を Skill 内とプラグインの README に書く (ライセンス上の義務)
- ライセンスが不明な文章 (製品に組み込まれたプロンプトを抜き出したものなど) は写さず、同じ目的の Skill を新しく書く

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

## Skill 評判ボード

Skill ごとの 👍 と感想を集計して GitHub Pages に公開するページです。サーバーは持たず、`.github/workflows/board.yml` が次の順に動きます。

1. `eng/board-collect.mjs` が Discussions から、Skill ごとの感想スレッドの 👍 (最初の投稿へのリアクション) とコメントを集計する。スレッドの無い Skill には自動でスレッドを作るので、Skill を `main` に入れるだけでボードに載る
2. その日の値を `board-data` ブランチの `history.json` に残す。リアクションには日時が無いので、「今週の増加」と「8 週の推移」はこの記録の差分から出す。`board-data` は Actions だけが更新する
3. `eng/board.mjs` が `skills/` と `plugins/` を読んで、ランキングと Skill ごとの詳細ページを `dist/board/` に生成し、Pages に公開する

Skill と感想スレッドの対応は、スレッド本文の先頭にある `<!-- copilot-tips-board skill: <skill-name> -->` で取ります。スレッドのタイトルやカテゴリを変えても対応は崩れません。この行は消さないでください。目印は誰でも書けるので、Actions かメンテナー (owner / member / collaborator) が立てたスレッドだけを採用します。作成者は、Skill を同梱するプラグインの `plugin.json` の `author` を出します。インストールのコマンドは README.md の「インストール」と同じもので、ずれるとテストが失敗します。

感想は書かれたまま Pages に転載されます。不適切な感想は GitHub 上で非表示 (Hide) か削除にしてください。非表示のコメントは集計から外れます。すぐ消したいときは、Actions の「Skill board」を手動で実行します。

### リポジトリ変数 (Settings → Secrets and variables → Actions → Variables)

| 変数 | 既定 | 意味 |
| --- | --- | --- |
| `BOARD_ENABLED` | なし (動かない) | `true` のときだけ集計と公開を行う |
| `BOARD_SHOW_AUTHORS` | `true` | `false` にすると、Skill の作成者と感想を書いた人の名前をページから伏せる |
| `BOARD_CATEGORY` | `General` | 新しい感想スレッドを作る Discussions のカテゴリ名 |

### 動かし始めるとき

ボードはリポジトリを公開してから動かします (GitHub Free では private リポジトリで Pages を使えず、他の人が 👍 を押せないため)。

1. Settings → General → Features で Discussions を有効にする
2. Settings → Pages の Source を「GitHub Actions」にする
3. 変数 `BOARD_ENABLED` を `true` にし、Actions の「Skill board」を手動で実行する (Run workflow)
