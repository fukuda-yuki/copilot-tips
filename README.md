# copilot-tips (正本ブランチ: `staged`)

Skill / Agent / Instruction を、プラグインとして誰でも簡単にインストールできる形で配布する日本語カタログです。

> **利用したい方へ**: インストール方法とプラグイン一覧は、配布ブランチ [`main` の README](https://github.com/fukuda-yuki/copilot-tips/tree/main#readme) を見てください。
> このブランチ (`staged`) は編集用の正本です。

## 仕組み

```text
作業ブランチ ──Pull Request──> staged ──GitHub Actions──> main
                               正本 (ここを編集)          配布物 (自動生成・編集禁止)
```

- 編集はすべて `staged` 宛ての Pull Request で行います
- `staged` にマージされると、GitHub Actions が配布形式に変換して `main` に反映します
- `main` を直接編集しても、次の公開で上書きされます

## 構成

| 場所 | 内容 |
| --- | --- |
| `skills/` | Skill 本体 |
| `agents/` | GitHub Copilot 用カスタムエージェント |
| `instructions/` | GitHub Copilot 用 instruction |
| `plugins/` | プラグイン定義 (どの Skill / Agent を束ねるかの宣言) |
| `eng/` | 検証・ビルド用スクリプト |
| `.github/workflows/` | 検証 (`validate`)・公開 (`publish`)・宛先チェック (`check-pr-target`) |

## 開発

Node.js 22 以上が必要です。依存パッケージはありません。

```bash
npm test         # 検証とテスト
npm run build    # dist/ に配布物を生成して中身を確認する
```

詳しいルールと手順は [AGENTS.md](AGENTS.md) にまとめています。
