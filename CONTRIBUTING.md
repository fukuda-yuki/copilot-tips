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
| 毎日 09:00 と `main` の更新時 (`board`) | Skill ボードを集計して GitHub Pages に公開する ([下記](#skill-ボード)) |
| 手動 (`trigger-check`) | Skill の頼み方で本当に呼ばれるかを Copilot CLI で確かめる ([下記](#頼み方の確認)) |
| 手動 (`examples`) | 実例の無い Skill を Copilot CLI で動かし、実例のブランチを作る ([下記](#実例を載せる)) |
| Claude Code の操作前 | 生成ファイルの手編集と、hook の回避 (`--no-verify`) を止める |

手動で実行する場合のコマンドです。

```bash
npm run validate   # 規約どおりか、生成ファイルが最新か、version を上げ忘れていないか
npm test           # スクリプトのテスト
npm run build      # 生成ファイルを更新し、dist/ に配布物を生成する (dist/ は commit しない)
npm run board      # Skill ボードを dist/board/ に生成する (数字は 0。見た目の確認用)
```

## ディレクトリ構成

```text
skills/<skill-name>/SKILL.md        Skill 本体 (references/ や assets/ を同梱可)
agents/<agent-name>.agent.md        Copilot 用カスタムエージェント
instructions/<name>.instructions.md Copilot 用 instruction (プラグインには入らない)
plugins/<plugin-name>/plugin.json   プラグインの定義 (何を同梱するかの宣言だけ)
plugins/<plugin-name>/README.md     プラグインの説明
examples/<skill-name>.md            Skill の実例 (ボードに載せるだけで、配布物には入らない)
.github/plugin/marketplace.json     [生成] Copilot CLI / VS Code 用マーケットプレイス定義
.claude-plugin/marketplace.json     [生成] Claude Code 用マーケットプレイス定義
README.md                           「カタログ」の節は [生成]
eng/                                検証・ビルド・ボード用スクリプト
.github/DISCUSSION_TEMPLATE/        「ほしい Skill」の投稿フォーム
.githooks/ .claude/                 git hook と Claude Code の hook
```

Skill や Agent の実体はリポジトリ直下の `skills/` `agents/` に 1 つだけ置き、プラグインはそれを参照します。`agents/` と `instructions/` は中身ができたときに作ります。

## Skill を追加・変更する

1. `skills/<skill-name>/SKILL.md` を作る。frontmatter の `name` はフォルダ名と同じ、`description` は「いつ使うか」が分かる 1 行にする
   - `description` の最初の 1 文は、何をする Skill かにする。ボードの説明になる
   - 利用者の頼み方の例を `description` に「」で書く (「設定を診断して」)。AI が呼び出す手がかりになり、ボードには「頼み方」として並ぶ
   - 先に入れておくものがあれば、frontmatter の `compatibility` に書く (`compatibility: Python 3.10 以上`)。ボードの「必須環境」になる
2. 既存のプラグインの `plugin.json` に追加するか、新しい `plugins/<plugin-name>/` (`plugin.json` と `README.md`) を作る
3. 既存のプラグインの中身を変えたときは `version` を上げる。利用者側の更新検知に使われる
4. `npm run build` を実行し、`dist/plugins/<plugin-name>/` の中身が意図どおりか確認する

### 実例を載せる

入れる前に「頼むと何が返ってくるか」が分かるよう、ボードの Skill のページに実例を 1 つ載せられます。`examples/<skill-name>.md` に、実際に頼んだ言葉と、返ってきたものの抜粋 (40 行まで) を書きます。作った文面ではなく、実際の出力を貼ります。社内の名前やパスは消します。プラグインの `version` は上げなくて構いません。

手で書く代わりに、Actions の「Examples」を手動で実行すると、実例の無い Skill を Copilot CLI で実際に動かして作ります (`eng/examples.mjs`)。

```markdown
---
ask: プロンプトを監査して
---

(返ってきたものの抜粋。整形されず、書いたまま載る)
```

「Examples」の動き方です。

- 実例のある Skill は動かしません。作り直すときは、ファイルを消してから実行します
- 頼み方は、[頼み方の確認](#頼み方の確認) で呼ばれると確かめたものを先に使います。Skill と頼み方を指定して実行することもできます (語を埋める Skill はこちらで)
- 作業場所はこのリポジトリです。読めるのはその中と Web だけで、シェル・ファイルの書き込みは禁じます
- Skill の写しに「最初の行に目印を出す」を足して動かし、目印の出ない出力は実例にしません
- 結果は `examples/<実行番号>` ブランチに置かれ、実行結果の Summary に「Pull Request を作る」のリンクが出ます。中身を読んでからマージします
- secret `COPILOT_TOKEN` は頼み方の確認と同じものを使います。Skill 1 つにつき、少なくとも 1 回ぶんの利用枠を使います

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

`BOARD_ENABLED` が `true` のときは、配布物の 3 か所に [Skill ボード](#skill-ボード) のページへのリンクを足します。Skill を使う人がボードに辿り着けるようにするためで、正本には入れません。ボードが動いていない間はリンク切れになるので足しません。

- `README.md` の Skill の表に「評判」の列
- 各 `SKILL.md` の frontmatter に `metadata.feedback`。AI への指示である本文と `name` / `description` は変えない。frontmatter に `metadata` を書いた Skill には足さない
- `plugin.json` の `homepage`。Skill が 1 つならその Skill のページ、複数なら一覧。`homepage` を書いたプラグインは上書きしない

## Skill ボード

Skill の一覧と、Skill ごとのいいね・感想・入れ方を GitHub Pages に公開するページです。サーバーは持たず、`.github/workflows/board.yml` が次の順に動きます。

1. `eng/board-collect.mjs` が Discussions から、Skill ごとの感想スレッドの 👍 (最初の投稿へのリアクション) とコメントを集計する。スレッドの無い Skill には自動でスレッドを作るので、Skill を `main` に入れるだけでボードに載る
2. その日の値を `board-data` ブランチの `history.json` に残す。リアクションには日時が無く、後から推移を出すにはこの記録が要るため (いまのページでは使っていない)。`board-data` は Actions だけが更新する
3. `eng/board.mjs` が `skills/` と `plugins/` を読んで、一覧と Skill ごとのページを `dist/board/` に生成し、Pages に公開する。Skill のページには `description` の全文ではなく、最初の 1 文と頼み方 (「」の中) を出し、`examples/<name>.md` があれば [実例](#実例を載せる) を出す。「同梱」は Skill のフォルダにあるスクリプトと資料 (`.md` `.txt`) を数える。同じ内容を、エージェントが読む `skills.json` にも出す。Skill の公開日と最終更新日は `skills/<name>/` の git の履歴 (`main` に入った日) から取り、公開・更新から `FRESH_DAYS` (14) 日のあいだ New / Updated の印を付ける。浅い clone では日付を出さない

いいねと感想は GitHub の感想スレッドで受け付け、ページからはそこへリンクします。ページ内で送れるようにするには訪問者の GitHub トークンを発行する秘密鍵つきのサーバーか第三者の GitHub App が要るので、採っていません。外部のスクリプトを読み込まないことはテストが確かめます。

代わりに、チャットの中から送れるようにしています。`skills/skill-board` が `skills.json` を読み、利用者自身の `gh` でいいね・感想を送ります。`skills.json` には感想スレッドの id と入れ方を載せ、感想の本文は載せません (他人が書いた文をエージェントに読ませないため)。`skills.json` の項目を変えたら `skills/skill-board/SKILL.md` の表も直します (ずれるとテストが失敗します)。

Skill と感想スレッドの対応は、スレッド本文の先頭にある `<!-- copilot-tips-board skill: <skill-name> -->` で取ります。スレッドのタイトルやカテゴリを変えても対応は崩れません。この行は消さないでください。本文の文面 (`eng/board-collect.mjs` の `discussionBody`) は新しく作るスレッドにだけ使われます。Actions の権限では既存のスレッドを書き換えられないので、文面を変えたら既存のスレッドはメンテナーが手で直します。目印は誰でも書けるので、Actions かメンテナー (owner / member / collaborator) が立てたスレッドだけを採用します。作成者は、Skill を同梱するプラグインの `plugin.json` の `author` を出します。インストールのコマンドは README.md の「インストール」と同じもので、ずれるとテストが失敗します。入れ方は、全ページの上で選んだツール 1 つぶんだけを出します (選択はブラウザに残ります。選択肢は `TOOLS`)。一覧の各行の「入れるコマンドをコピー」も同じツールのコマンドです。一覧で複数の Skill を選ぶと、まとめて入れるコマンドと、その選択を渡すリンク (`?pick=<skill>,<skill>`) を出します (`bundleCommands`。同じ関数をページのスクリプトにも埋め込んでいます)。

感想は書かれたまま Pages に転載されます。不適切な感想は GitHub 上で非表示 (Hide) か削除にしてください。非表示のコメントは集計から外れます。すぐ消したいときは、Actions の「Skill board」を手動で実行します。

### ほしい Skill

Discussions の `Ideas` カテゴリ (`eng/board-collect.mjs` の `REQUEST_CATEGORY`) を、ほしい Skill の受付に使います。ボードは全ページの上に投稿フォームへのリンクを出し、要望があれば一覧のページに、開いている要望を票 (upvote) の多い順で並べます。カテゴリが無ければ何も出しません。

- 投稿フォームは `.github/DISCUSSION_TEMPLATE/ideas.yml`。ファイル名はカテゴリの slug と同じにします
- 作った・見送った要望は GitHub で閉じると一覧から外れます
- `skill-board` はチャットから同じカテゴリへ投稿します。本文の見出しはフォームの欄の名前とそろえます (ずれるとテストが失敗します)
- 要望の題は書かれたまま Pages に転載されます。`skills.json` には載せません

### 頼み方の確認

`eng/trigger-check.mjs` が、Skill の頼み方を 1 つずつ Copilot CLI に渡し、その Skill が呼ばれるかを確かめます。Actions の「Trigger check」を手動で実行します。まだ実際の Copilot CLI では動かしていません。初めて動かすときは、Skill を 1 つ指定して結果を確かめてください。名前を間違えたときは、指定できる Skill の名前が実行ログに出ます。

- 本物の Skill は動かしません。`name` と `description` だけを写し、本文を「目印を出して終える」に差し替えた写しを全 Skill ぶん置いて実行します。ツールの許可は与えません
- 結果は `board-data` ブランチの `triggers.json` に残り、次の「Skill board」の実行から、呼ばれると確かめた頼み方が先に並びます。ページに出る違いは並び順だけです
- 呼ばれなかった頼み方は、ページには出さず、実行結果の Summary に挙げます。`description` を見直すか、「」から外します
- Copilot CLI を実行できなかった頼み方は前回の結果のままにします。ボードはそのまま動きます
- `description` を変えた Skill の古い結果は使いません
- 1 つも実行できない・1 つも呼ばれないときは失敗し、結果を書き換えません。写しが読み込まれていない場合を「全部呼ばれなかった」と記録しないためです
- 「〜」「〇〇」の入った頼み方 (語を埋めて使うもの) は確かめません
- Copilot CLI は版を固定して入れます (`trigger-check.yml` の `COPILOT_CLI_VERSION`)。CLI を動かす job にはリポジトリへの書き込み権限を渡さず、結果の保存は別の job が行います
- 「Skill board」と同時には動きません。待っている間に毎日の「Skill board」が始まると、待っていた側が取り消されることがあります。そのときはもう一度実行します
- 準備: 「Copilot Requests」の権限だけを付けた fine-grained personal access token を作り、リポジトリの secret `COPILOT_TOKEN` に入れます。頼み方 1 つにつき、トークンの持ち主の Copilot の利用枠を 1 回ぶん使います

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
4. 配布物にボードへのリンクを入れるため、Actions の「Publish to marketplace」も手動で実行する
