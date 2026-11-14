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

### プラグイン (1)

| プラグイン | 説明 | 同梱物 |
| --- | --- | --- |
| [`skill-creator`](plugins/skill-creator) | Agent Skill を新しく作る・既存の Skill を見直す・description を改善するための手引きをまとめたプラグイン。 | skill: `skill-creator` |

### Skill (1)

| Skill | 説明 |
| --- | --- |
| [`skill-creator`](skills/skill-creator) | Use this skill when the user wants to create a new GitHub Copilot agent skill, adapt an existing skill, improve a skill's trigger description, review a skill's structure, add validation and evaluation, or extract a reusable skill from repeated real-world work. This skill is for authoring and iterating on skills themselves. |

<!-- catalog:end -->

## 仕組み

```text
作業ブランチ ──Pull Request──> main ──GitHub Actions──> marketplace
                               正本 (ここを編集)         配布物 (自動生成・編集禁止)
```

- 編集はすべて `main` 宛ての Pull Request で行います
- `main` にマージされると、GitHub Actions がプラグインを配布形式に組み立てて `marketplace` ブランチへ反映します
- 利用者は `main` を登録するだけで構いません。`main` のマーケットプレイス定義が、各プラグインの取得元として `marketplace` ブランチを指しています

開発のルールと手順は [AGENTS.md](AGENTS.md) にまとめています。
