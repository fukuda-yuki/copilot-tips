# doctor

GitHub Copilot に読ませている設定ファイル (custom instructions、`AGENTS.md`、prompt file、Skill、カスタムエージェント) を点検するプラグインです。Claude Code の `/doctor` と `/doctor prompt-audit` に相当する機能を、Copilot で使えるようにしました。

- skills: `copilot-doctor`, `prompt-audit`

## 使い方

Copilot のチャットで、次のように頼みます。

| やりたいこと | 頼み方の例 | 使われる Skill |
| --- | --- | --- |
| 設定全体の健康診断 | 「Copilot の設定を診断して」 | `copilot-doctor` |
| 指示文の書き方の監査 | 「このリポジトリのプロンプトを監査して」 | `prompt-audit` |
| 特定のファイルだけ監査 | 「`.github/copilot-instructions.md` を prompt audit して」 | `prompt-audit` |

どちらも、まず読み取りだけで点検してレポートと修正案を出します。ファイルを書き換えるのは、利用者が同意した後だけです。commit はしません。

## 2 つの Skill の違い

- `copilot-doctor`: ファイルが正しく読み込まれるか、重複や矛盾がないか、毎回読み込まれる指示が重すぎないかを見ます。
- `prompt-audit`: 指示文の中身を見ます。古いモデル向けの強調や手順の押し付け、現状と食い違う記述、ファイル間の矛盾を、根拠と確度を付けて指摘します。

## 出典とライセンス

- `prompt-audit` は、[anthropics/skills](https://github.com/anthropics/skills) の `claude-api` Skill に含まれる `shared/prompt-audit.md` (Copyright Anthropic, PBC、Apache License 2.0) を GitHub Copilot 向けに改変したものです。変更点は `references/prompt-audit.md` の冒頭に、ライセンス全文は Skill 内の `LICENSE.txt` にあります。
- `copilot-doctor` は、このリポジトリで新しく書いたものです。Claude Code の `/doctor` の文章は使っていません。
