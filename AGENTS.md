# AGENTS.md

このリポジトリで作業する AI エージェント (Claude Code / GitHub Copilot など) と人間のメンテナー向けの手引きです。作業前に必ず読んでください。

## このリポジトリの目的

`github/awesome-copilot` のように、Skill / Agent / Instruction を **プラグインとして誰でも簡単にインストールできるカタログ** を提供します。利用者は次のようなコマンドで自分の環境に導入できます。

```bash
copilot plugin marketplace add fukuda-yuki/copilot-tips
copilot plugin install <plugin-name>@copilot-tips
```

オーナーはツールの内部に詳しくありません。説明は日本語で平易に行い、気づいた改善は積極的に提案してください。GitHub 側の設定 (ブランチ保護など) も、オーナーに手順を案内するのではなくエージェントが自分で行います。

## 最重要ルール: ブランチの役割

| ブランチ | 役割 | 編集してよいか |
| --- | --- | --- |
| `main` | **正本** (GitHub のデフォルトブランチ)。すべての実装・編集はここに入れる | Pull Request 経由で可 |
| `marketplace` | **配布専用**。GitHub Actions が `main` から自動生成する | **不可** (人もエージェントも直接編集しない) |

- 作業ブランチは `main` から切り、Pull Request は `main` 宛てに作る
- `marketplace` 宛ての Pull Request は `check-pr-target` workflow が失敗させる
- `marketplace` への直接 push、どちらのブランチへの force-push もしない

これは `github/awesome-copilot` の現在の方式 (`main` → `marketplace`) と同じです。

## 公開の流れ

```text
作業ブランチ ──PR──> main ──(Actions: publish.yml)──> marketplace
                     正本                              配布物
```

1. `main` 宛ての Pull Request で `validate.yml` が検証・テスト・ビルドの試行を行う
2. `main` にマージされると `publish.yml` が `npm run build` で `dist/` を生成する
3. `dist/` の中身で `marketplace` を丸ごと置き換える commit を積む (履歴は残る。差分が無ければ何もしない)

## 利用者がブランチを間違えない仕組み

`main` のプラグインは「何を同梱するか」の宣言だけで、Skill の実体が入っていません。そのまま配ると空のプラグインになります。これを防ぐため、`main` に置くマーケットプレイス定義は、各プラグインの取得元として `marketplace` ブランチを明示しています。

```json
"source": { "source": "github", "repo": "fukuda-yuki/copilot-tips", "path": "plugins/<name>", "ref": "marketplace" }
```

- 利用者が既定の `main` を登録しても、`marketplace` ブランチを登録しても、実体化済みのプラグインが入る
- `awesome-copilot` 本家はこの仕組みを持たず、Copilot CLI / VS Code に最初から登録されていることに頼っている。このリポジトリは組み込み登録されないので、定義ファイル側で保証する
- 例外は APM でプラグインのパスを直接指定する場合で、`#marketplace` を付ける必要がある (README に記載)

## ディレクトリ構成 (main)

```text
skills/<skill-name>/SKILL.md        Skill 本体 (references/ や assets/ を同梱可)
agents/<agent-name>.agent.md        Copilot 用カスタムエージェント
instructions/<name>.instructions.md Copilot 用 instruction (プラグインには入らない)
plugins/<plugin-name>/plugin.json   プラグインの定義 (何を同梱するかの宣言だけ)
plugins/<plugin-name>/README.md     プラグインの説明
.github/plugin/marketplace.json     [生成] Copilot CLI / VS Code 用マーケットプレイス定義
.claude-plugin/marketplace.json     [生成] Claude Code 用マーケットプレイス定義
README.md                           利用者向けの入口。「カタログ」の節は [生成]
eng/                                検証・ビルド用スクリプト (Node.js、外部依存なし)
.github/workflows/                  validate / publish / check-pr-target
```

- `agents/` と `instructions/` は中身ができたときに作る (現在は空)
- 中身 (Skill や Agent) は必ずリポジトリ直下の `skills/` `agents/` に 1 つだけ置き、プラグインはそれを **参照するだけ** にする
- [生成] のファイルは手で編集しない。`npm run build` が更新するので、その結果を commit する。古いままだと `validate` が失敗する

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

## 配布物の構成 (marketplace、自動生成)

```text
README.md                              main の README に「配布専用」の注意書きを足したもの
AGENTS.md / CLAUDE.md                  「ここは編集禁止、main へ」という案内
.github/plugin/marketplace.json        同じブランチ内の plugins/<name> を指す定義
.claude-plugin/marketplace.json        同上 (Claude Code 用)
plugins/<plugin-name>/plugin.json      仕様準拠の manifest (同梱宣言は除去済み)
plugins/<plugin-name>/skills/...       実体化された Skill
plugins/<plugin-name>/com.github.copilot/agents/...  実体化された Agent
skills/ agents/ instructions/          単体取得用のコピー
```

`eng/` や `.github/workflows/` などの開発用ファイルは `marketplace` には入りません。

## コマンド

```bash
npm run validate   # 正本が規約どおりか、生成ファイルが最新かを検証する
npm test           # スクリプトのテスト (このリポジトリ自体の検証を含む)
npm run build      # 生成ファイルを更新し、dist/ に配布物を生成する (dist/ は commit しない)
```

依存パッケージは無いので `npm install` は不要です (Node.js 22 以上)。

## 作業手順

### Skill を追加・変更する

1. `skills/<skill-name>/SKILL.md` を作る。frontmatter の `name` はフォルダ名と同じ、`description` は「いつ使うか」が分かる 1 行にする
2. 既存プラグインに入れるか、新しい `plugins/<plugin-name>/` (`plugin.json` と `README.md`) を作って宣言する
3. 変更したプラグインの `version` を上げる
4. `npm run build` を実行し、`dist/plugins/<plugin-name>/` の中身を確認する
5. `npm test` を通し、更新された生成ファイルも含めて commit する
6. `main` 宛てに Pull Request を作る

### ビルドや検証の仕組みを変える

- `eng/lib.mjs` の `CATALOG` がカタログ名・リポジトリ名・ブランチ名の唯一の定義
- 配布物の形を変えたら `eng/catalog.test.mjs` とこのファイルも更新する
- スクリプトは外部依存なしを保つ (publish を単純で壊れにくくするため)

## 規約

- 文章は日本語を基本とし、識別子・コマンド・ファイル名は英語のまま
- ファイル名・フォルダ名は小文字英数字とハイフン
- 改行コードは LF (`.gitattributes` で強制)
- commit メッセージは `docs: ...` `feat: ...` `fix: ...` `chore: ...` のような短い命令形
- LICENSE ファイルは置かない (オーナーの判断)
- 他者の著作物を元にした Skill は、ライセンスが再配布と改変を認めているものだけを入れる。元のライセンス文を `skills/<skill-name>/LICENSE.txt` に置き、出典と変更点を Skill 内とプラグインの README に書く (リポジトリ直下の LICENSE を置かない方針とは別で、これはライセンス上の義務)
- ライセンスが不明な文章 (製品に組み込まれたプロンプトを抜き出したものなど) は写さない。同じ目的の Skill を新しく書く

## 設計の背景

- `awesome-copilot` は正本のプラグインフォルダ内へ実体を書き込むが、このリポジトリは `dist/` へ別出力する。正本に生成物が紛れ込む事故を防ぐため
- `microsoft/apm` は利用者側のインストーラ。配布ブランチに仕様準拠の `plugins/<name>/plugin.json` があれば追加設定なしで入る
