# imozuru

知らない分野を、原文にたどりつくまで芋づる式に掘るプラグインです。用語・中心の人・知見が集まる媒体を押さえ、引用・リンク・著者をたどって原文を集めます。調べている間は原文を要約せず、最後に抜き書きのページと詳細レポートを作ります。

- skills: `imozuru`

## 使い方

Copilot のチャットで、次のように頼みます。

| やりたいこと | 頼み方の例 |
| --- | --- |
| 知らない分野のキャッチアップ | 「この分野をキャッチアップしたい」 |
| 用語と人から掘る | 「界隈の用語と人から掘って」 |
| 論文・先行研究を探す | 「論文とか先行研究を漁って」 |
| 元ネタを探す | 「既存の技術を真似したいから元ネタを探して」 |
| 原文を保存する | 「原文で落として」 |
| 新着を見張る | 「〇〇の新着見て」「今週の〇〇の記事まとめて」 |

結果は既定で `~/research/<話題>/` に残ります。`map.md` に用語・人・媒体・原文の一覧、`sources/` に原文、`report.html` に抜き書き、`digest.html` に詳細レポートができます。

## 必要なもの

- Python 3.10 以上。スクリプトは標準ライブラリだけで動きます。
- 任意: `pdftotext` (poppler か Xpdf。無ければ `pdfminer.six`) で PDF の本文を取り出します。
- 任意: `pdftoppm` と `tesseract` で、文字の層が無い PDF を OCR します。日本語は `jpn` と `jpn_vert` の言語データを使います。
- 任意: `yt-dlp` で YouTube の字幕を、[ax](https://github.com/yusukebe/ax) で HTML を markdown にします。

無い場合の動きは SKILL.md の「道具」にあります。

## 出典とライセンス

- [MaryCache/imozuru](https://github.com/MaryCache/imozuru) の `skills/imozuru/`、commit `808407e501bc5a1e596655b0a6d62e1f3b20ba1b` (v2.2.0) を元にしています。MIT License (Copyright (c) 2026 MaryCache)。ライセンス全文は `skills/imozuru/LICENSE.txt` にあります。
- このリポジトリでの変更: frontmatter を Copilot 向けに整え (description を1行に、`license` を追加)、Claude Code 固有の表現 (軽いモデル名・`/imozuru` のスラッシュコマンド・検索の記録に書く道具名) と、上流のリポジトリにしか無い `examples/` への参照を外しました。スクリプトと `references/` `assets/` は上流のままです。
