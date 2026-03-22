# `eng/` スクリプト

このディレクトリには、plugin パッケージを検証し、marketplace メタデータを生成し、公開可能な plugin ペイロードを具体化するために使用される Node.js メンテナンススクリプトが含まれています。

スクリプトは意図的に小さく保ちます。各スクリプトの責任を限定し、このドキュメントはメンテナーのための操作エントリーポイントとして扱ってください。

## 概要

| ファイル | 使用元 | 目的 | 出力先 |
| --- | --- | --- | --- |
| `constants.mjs` | すべてのスクリプト | リポジトリルートと共有ディレクトリのパス定義 | なし |
| `validate-plugins.mjs` | `npm run plugin:validate` | ステージング済み plugin パッケージと参照元アセットを検証 | なし |
| `generate-marketplace.mjs` | `npm run plugin:generate-marketplace` | plugin manifest から marketplace 定義を再生成 | `.github/plugin/marketplace.json` |
| `materialize-plugins.mjs` | `npm run plugin:materialize` | 参照されている skill と agent を plugin フォルダ内にコピー | `plugins/<plugin-id>/{skills,agents}` |

## スクリプトの責務

### `constants.mjs`

リポジトリルートおよび共有ディレクトリのパス解決を一元化します:

- `ROOT_FOLDER`
- `AGENTS_DIR`
- `SKILLS_DIR`
- `PLUGINS_DIR`
- `MARKETPLACE_FILE`

リポジトリレイアウトが変わった場合は、このファイルを最初に更新してください。

### `validate-plugins.mjs`

`plugins/` の各 plugin ディレクトリをチェックし、ステージング元が一貫していない場合は即座に失敗します。

現在のチェック項目：

- `.github/plugin/plugin.json` が存在する
- `README.md` が存在する
- plugin ルートの旧形式 `plugin.json` が存在しない
- 具体化された `agents/`、`skills/`、`assets/`、`references/` ディレクトリがステージング元に存在しない
- manifest 内に `name`、`description`、`version` が設定されている
- すべての skill 参照が既存の `skills/<skill-id>/SKILL.md` を指している
- すべての agent 参照が既存の `agents/<agent-id>.agent.md` を指している

`plugins/`、`skills/`、`agents/` のいずれかを変更した後に実行してください。

### `generate-marketplace.mjs`

すべての plugin ディレクトリをスキャンして `plugins/<plugin-id>/.github/plugin/plugin.json` を読み込み、`.github/plugin/marketplace.json` を再生成します。

注意すべき動作：

- 有効な manifest を持つディレクトリのみが含まれます
- plugin エントリはディレクトリ名でソートされます
- 出力は完全に再生成され、インプレース修正ではありません

plugin 名、説明、バージョンを変更したり、plugin ディレクトリを追加・削除した後に実行してください。

### `materialize-plugins.mjs`

ステージング元の manifest から公開可能な plugin ペイロードを作成します。

各 plugin について、スクリプトは以下を実行します：

1. `.github/plugin/plugin.json` を読み込む
2. plugin ディレクトリ内の既存の具体化済み `skills/`、`agents/`、`assets/`、`references/` フォルダを削除
3. 参照された skill フォルダを `skills/` からコピー
4. 参照された agent ファイルを `agents/` からコピー

このスクリプトは通常の執筆用ではなく、公開出力向けです。具体化された結果をローカルで検査する場合は、別のクローンまたは一時的な worktree で実行してください。

## 推奨ワークフロー

### ソースアセットを更新する場合

1. `skills/`、`agents/`、`instructions/`、`plugins/` のファイルを編集します。
2. `npm run plugin:validate` を実行します。
3. plugin manifest が変更された場合は、`npm run plugin:generate-marketplace` を実行します。
4. 編集したファイルに対して Markdown lint とリンクチェックを実行します。

### 公開出力を検証する場合

1. 一時的なクローンまたは worktree を作成します。
2. `npm run plugin:materialize` を実行します。
3. そこで生成された plugin ペイロードを検査します。
4. 具体化されたディレクトリをステージング元ブランチにコミットしないこと。

## コマンド

```powershell
npm run plugin:validate
npm run plugin:generate-marketplace
npm run plugin:materialize
```

## Manifest 規約

plugin スクリプトは以下の manifest 規約を想定しています：

- `skills` エントリは `./skills/<skill-id>` スタイルのパスを使用
- `agents` エントリは `./agents/<agent-id>.md` スタイルのパスを使用
- 参照される skill コンテンツは `skills/<skill-id>/` に存在
- 参照される agent ソースは `agents/<agent-id>.agent.md` に存在

新しい manifest 形式をサポートする必要がある場合は、検証と具体化のロジックを一緒に更新してください。

## メンテナンスに関する注記

- 各スクリプトは 1 つのジョブに焦点を当てて保つ。
- パスロジックを複製するのではなく、`constants.mjs` の更新を優先する。
- 出力動作を変更する場合は、ここに想定される入出力を文書化する。
- 新しいスクリプトを追加する場合は、必要に応じて `package.json` に npm script も追加する。
