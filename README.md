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

`settings.json` の `chat.plugins.marketplaces` に `"fukuda-yuki/copilot-tips"` を追加し、拡張機能ビューで `@agentPlugins` を検索してインストールします。

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

## カタログ

<!-- catalog:start (自動生成。手で編集しない) -->

### プラグイン (2)

| プラグイン | 説明 | 同梱物 |
| --- | --- | --- |
| [`doctor`](plugins/doctor) | Copilot に読ませている指示ファイルや Skill を点検するプラグイン。設定の健康診断 (copilot-doctor) と、古い書き方・矛盾を見つけるプロンプト監査 (prompt-audit) を同梱。 | skill: `copilot-doctor`<br>skill: `prompt-audit` |
| [`skill-creator`](plugins/skill-creator) | Agent Skill を新しく作る・既存の Skill を見直す・description を改善するための手引きをまとめたプラグイン。 | skill: `skill-creator` |

### Skill (3)

| Skill | 説明 |
| --- | --- |
| [`copilot-doctor`](skills/copilot-doctor) | GitHub Copilot のカスタマイズ一式 (custom instructions、AGENTS.md、prompt file、Skill、カスタムエージェント) の健康診断をする。読み込まれない・壊れているファイル、常に読み込まれて重い指示、重複や矛盾、コードから分かるだけの記述を見つけ、修正案を出して同意を得てから直す。「Copilot の設定を診断して」「doctor」「instructions を整理・軽量化したい」「Skill が呼ばれない」などの依頼で使う。 |
| [`prompt-audit`](skills/prompt-audit) | プロンプト資産 (copilot-instructions.md、*.instructions.md、AGENTS.md、prompt file、Skill、カスタムエージェント、システムプロンプト、ツール説明) を監査し、古いモデル向けの書き方・現状と食い違う記述・ファイル間の矛盾を見つけて、根拠付きのレポートと修正案 (diff) を出す。「プロンプトを監査して」「instructions を見直して」「prompt audit」「カスタム指示が効かない・古い」などの依頼で使う。 |
| [`skill-creator`](skills/skill-creator) | Use this skill when the user wants to create a new GitHub Copilot agent skill, adapt an existing skill, improve a skill's trigger description, review a skill's structure, add validation and evaluation, or extract a reusable skill from repeated real-world work. This skill is for authoring and iterating on skills themselves. |

<!-- catalog:end -->

## Skill 評判ボード

[Skill 評判ボード](https://fukuda-yuki.github.io/copilot-tips/) では、Skill ごとの 👍 と感想の集計と、各 Skill の入れ方を見られます (リポジトリの公開後に有効になります)。

役に立った Skill があれば、ボードでその Skill を開き、「感想を書く」から GitHub の感想スレッドへ進んでください。最初の投稿に付けた 👍 が票になり、コメントが感想としてボードに載ります。集計は 1 日 1 回です。ボードの数字は人気投票で、利用回数ではありません。

## 仕組み

```text
作業ブランチ ──Pull Request──> main ──GitHub Actions──> marketplace
                               正本 (ここを編集)         配布物 (自動生成・編集禁止)
```

- 編集はすべて `main` 宛ての Pull Request で行います
- `main` にマージされると、GitHub Actions がプラグインを配布形式に組み立てて `marketplace` ブランチへ反映します
- 利用者は `main` を登録するだけで構いません。`main` のマーケットプレイス定義が、各プラグインの取得元として `marketplace` ブランチを指しています

Skill やプラグインを追加・変更する手順は [CONTRIBUTING.md](CONTRIBUTING.md) にあります。
