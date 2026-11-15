> [!IMPORTANT]
> このブランチ (`marketplace`) は **配布専用** で、GitHub Actions が [`main`](https://github.com/fukuda-yuki/copilot-tips/tree/main) から自動生成しています。直接編集しないでください。

# copilot-tips

GitHub Copilot などの AI エージェント向けの Skill / Agent / Instruction を、プラグインとして簡単にインストールできる日本語カタログです。

## インストール

`<plugin-name>` は下の [カタログ](#カタログ) にあるプラグイン名に置き換えてください。

### GitHub Copilot CLI

```bash
copilot plugin marketplace add fukuda-yuki/copilot-tips
copilot plugin install <plugin-name>@copilot-tips
```

### VS Code (GitHub Copilot)

`settings.json` に次の設定を追加し、拡張機能ビューで `@agentPlugins` を検索してインストールします。

```json
"chat.plugins.marketplaces": ["fukuda-yuki/copilot-tips"]
```

### Claude Code

```text
/plugin marketplace add fukuda-yuki/copilot-tips
/plugin install <plugin-name>@copilot-tips
```

### APM (Agent Package Manager)

```bash
apm install fukuda-yuki/copilot-tips/plugins/<plugin-name>#marketplace
```

APM でプラグインのパスを直接指定するときは、末尾の `#marketplace` (配布ブランチの指定) が必要です。Skill を 1 つだけ入れる場合は `apm install fukuda-yuki/copilot-tips/skills/<skill-name>` で入ります。

### npx skills

`<skill-name>` はカタログの Skill 名に置き換えてください。

```bash
npx skills add fukuda-yuki/copilot-tips --skill <skill-name>
```

## カタログ

<!-- catalog:start (自動生成。手で編集しない) -->

### プラグイン (4)

| プラグイン | 説明 | 同梱物 |
| --- | --- | --- |
| [`doctor`](plugins/doctor) | Copilot に読ませている指示ファイルや Skill を点検するプラグイン。設定の健康診断 (copilot-doctor) と、古い書き方・矛盾を見つけるプロンプト監査 (prompt-audit) を同梱。 | skill: `copilot-doctor`<br>skill: `prompt-audit` |
| [`imozuru`](plugins/imozuru) | 知らない分野を、用語・人・媒体から芋づる式にたどって原文を集め、抜き書きと詳細レポートにまとめるプラグイン。 | skill: `imozuru` |
| [`skill-board`](plugins/skill-board) | copilot-tips の Skill ボードをチャットの中から使うプラグイン。合う Skill を探す、使った Skill にいいねや感想を送る、新着を知る。 | skill: `skill-board` |
| [`skill-creator`](plugins/skill-creator) | Agent Skill を新しく作る・既存の Skill を見直す・description を改善するための手引きをまとめたプラグイン。 | skill: `skill-creator` |

### Skill (5)

| Skill | 説明 | 評判 |
| --- | --- | --- |
| [`copilot-doctor`](skills/copilot-doctor) | GitHub Copilot のカスタマイズ一式 (custom instructions、AGENTS.md、prompt file、Skill、カスタムエージェント) の健康診断をする。読み込まれない・壊れているファイル、常に読み込まれて重い指示、重複や矛盾、コードから分かるだけの記述を見つけ、修正案を出して同意を得てから直す。「Copilot の設定を診断して」「doctor」「instructions を整理・軽量化したい」「Skill が呼ばれない」などの依頼で使う。 | [いいね・感想](https://fukuda-yuki.github.io/copilot-tips/skills/copilot-doctor/) |
| [`imozuru`](skills/imozuru) | 知らない分野にキャッチアップするとき、汎用的な言葉から界隈の用語・中心の人・媒体（学会・雑誌・個人ブログ・動画・リポジトリ・一覧）を特定し、引用・リンク・著者を芋づる式にたどって、目当ての原文（論文も個人の記事や動画の字幕も）を要約せずそのまま ~/research/{話題}/sources/ に保存する。周ごとに map.md（用語・人・媒体・原文の一覧）を書き足し、調査の論点の全部に原文が付くか飽和したら止める。見張りのモードでは、map.md の媒体（Qiita・Zenn のタグ、note、YouTube、ブログ、arXiv）の新着を RSS で引いて原文の冒頭つきで並べる。「芋づる式に調べて」「この分野をキャッチアップしたい」「界隈の用語と人から掘って」「論文とか先行研究を漁って」「既存の技術を真似したいから元ネタを探して」「上手い人のやり方を集めて」「原文で落として」「〇〇って研究あるの？原典ほしい」「全然わからないから流れを掘って」「どういう界隈でどう呼ばれてるか知りたい」「〇〇の新着見て」「今週の〇〇の記事まとめて」「キャッチアップ」「imozuru watch」、英語では dig into this field / find the canonical papers on X / literature dive / what is new in X this week の依頼で使う。答えが1つの事実の確認（年・有無だけ・仕様1つ → そのまま検索）、手元の PC の中の資料を探す、読んだ資料の要約や解説を書く、には使わない。 | [いいね・感想](https://fukuda-yuki.github.io/copilot-tips/skills/imozuru/) |
| [`prompt-audit`](skills/prompt-audit) | プロンプト資産 (copilot-instructions.md、*.instructions.md、AGENTS.md、prompt file、Skill、カスタムエージェント、システムプロンプト、ツール説明) を監査し、古いモデル向けの書き方・現状と食い違う記述・ファイル間の矛盾を見つけて、根拠付きのレポートと修正案 (diff) を出す。「プロンプトを監査して」「instructions を見直して」「prompt audit」「カスタム指示が効かない・古い」などの依頼で使う。 | [いいね・感想](https://fukuda-yuki.github.io/copilot-tips/skills/prompt-audit/) |
| [`skill-board`](skills/skill-board) | copilot-tips の Skill ボードをチャットの中から使う。やりたいことに合う Skill を探して入れ方を示す、使った Skill にいいね (👍) や感想を利用者の gh で送る、新着・更新された Skill を知らせる。「〜に使える Skill ある?」「copilot-tips の Skill を見せて」「この Skill にいいね」「imozuru に感想を送って」「Skill の新着は?」などの依頼で使う。 | [いいね・感想](https://fukuda-yuki.github.io/copilot-tips/skills/skill-board/) |
| [`skill-creator`](skills/skill-creator) | Use this skill when the user wants to create a new GitHub Copilot agent skill, adapt an existing skill, improve a skill's trigger description, review a skill's structure, add validation and evaluation, or extract a reusable skill from repeated real-world work. This skill is for authoring and iterating on skills themselves. | [いいね・感想](https://fukuda-yuki.github.io/copilot-tips/skills/skill-creator/) |

<!-- catalog:end -->

## いいねと感想

[Skill の一覧](https://fukuda-yuki.github.io/copilot-tips/) で Skill を開くと、いいねと感想を送れます。GitHub のサインインが必要です。

`skill-board` プラグインを入れると、Copilot のチャットで「copilot-doctor にいいね」「合う Skill ある?」と頼んで、ブラウザを開かずに送る・探すができます。送信には `gh` (GitHub CLI) のサインインが必要です。

いいねと感想は、Skill ごとに 1 つある GitHub Discussions の感想スレッドから 1 日 1 回集計しています。これは人気投票で、利用回数ではありません。Copilot CLI や Claude Code は Skill が何回使われたかを作者に知らせないので、利用回数は載せていません。

## 仕組み

```text
作業ブランチ ──Pull Request──> main ──GitHub Actions──> marketplace
                               正本 (ここを編集)         配布物 (自動生成・編集禁止)
```

- 編集はすべて `main` 宛ての Pull Request で行います
- `main` にマージされると、GitHub Actions がプラグインを配布形式に組み立てて `marketplace` ブランチへ反映します
- 利用者は `main` を登録するだけで構いません。`main` のマーケットプレイス定義が、各プラグインの取得元として `marketplace` ブランチを指しています

Skill やプラグインを追加・変更する手順は [CONTRIBUTING.md](CONTRIBUTING.md) にあります。
