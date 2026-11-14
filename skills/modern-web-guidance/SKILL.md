---
name: modern-web-guidance
description: Web UI を書く前に、Google の Modern Web Guidance から最新のブラウザ作法 (Baseline 準拠) を引く。モーダル・ダイアログ・ポップオーバー、フォームとバリデーション、表、ダークモード、View Transitions・アニメーション、スクロール演出、コンテナクエリやアンカー配置などのレイアウト、LCP/INP/CLS のパフォーマンス、アクセシビリティ、最新のブラウザ API の実装やレビューで使う。「モーダルを実装して」「アニメーションを付けたい」「この UI をモダンにしたい」「アクセシビリティを見て」「表示が遅い」などの依頼で使う。バックエンド、ビルド設定、Web UI 以外の作業には使わない。
---

# Modern Web Guidance

Web UI を作る前に、Google の Modern Web Guidance から「いまの Web プラットフォームでの正解」を取ってくる Skill です。

ガイド本文はこの Skill に同梱していません。`npx` で最新版の CLI を呼び、必要なガイドだけを取ります。上流は随時更新されるので、常に最新の内容が入ります。

- 上流: <https://github.com/GoogleChrome/modern-web-guidance>
- ドキュメント: <https://developer.chrome.com/docs/modern-web-guidance>

## 前提

- Node.js 22 以上と `npx` が必要です (CLI が起動時に確認します)
- 初回実行時に npm からパッケージを取得するため、ネットワークが必要です

## 手順

### 1. 検索する

**2〜5 語**で、対象を 1 つだけ書きます。

```bash
npx -y modern-web-guidance@latest search "light dismiss dialog"
npx -y modern-web-guidance@latest search "responsive data table"
```

出力は `[{"id":"...","description":"..."}, ...]` の JSON です。`description` を見て、使うガイドを決めます。

### 2. ガイドを取得する

```bash
npx -y modern-web-guidance@latest retrieve "dialog"
npx -y modern-web-guidance@latest retrieve "dialog,popover"
```

ID は複数指定できます (カンマ区切り)。タスクの中心になるガイドに加えて、`html` `css` `forms` `accessibility` `performance` `security` のような横断ガイドも必要に応じて取ります。

### 3. 実装に反映して確認する

取得したガイドに沿って書き、最後に次を確認します。

- ガイドが示すフォールバック / progressive enhancement の方針に沿っているか
- Baseline の条件 (使ってよいブラウザ範囲) を満たしているか
- ガイドにある「gotcha」に踏み込んでいないか (例: `fetchLater()` のペイロード上限)

## クエリの書き方

- 「動詞 + UI 部品」か「機能名」で書く (例: `animate dialog backdrop`, `scroll driven animation`)
- フレームワーク名は入れない (React / Vue / Tailwind など)
- アプリ固有の名詞 (画面名、コンポーネント名) は入れない
- 機能が複数あるときは検索を分ける (例: ダークモードと表を同時にやらない)

## 出力の扱い

- `retrieve` の出力が 9.5 KB を超えると、端末の切り詰めを避けるため一時ファイルに保存され、パスだけが表示されます。その場合はファイル読み取りツールで**全文**を読みます (`cat` や `head` で中略しない)
- 検索結果が 0 件、または関係ないものしか出ないときは、具体的な名詞に変えて**1 回だけ**再検索します。それでも無ければそのガイドは諦め、タスクは止めずに通常どおり実装します
- どのガイドがあるか全体を眺めたいときは `list` を使います (出力が大きいので、必要な場面に限る)

## 使えないとき

`npx` が無い、ネットワークが遮断されている、CLI が失敗する、といった場合はこの Skill を諦めて通常どおり実装し、その旨を一言添えます。代替として <https://developer.chrome.com/docs/modern-web-guidance> を参照するよう案内してもかまいません。**勝手に重量級の polyfill やレガシーなライブラリを追加しないでください。**

## 任意の設定

リポジトリ直下の `.mwgrc` (または `~/.mwgrc`) で、普段は出さないガイドを解禁できます。既定はどちらも無効です。

```bash
npx -y modern-web-guidance@latest set-allow-origin-trials       # Origin Trial 中の API
npx -y modern-web-guidance@latest set-allow-volatile-features   # 単一エンジンで入ったばかりの機能
```

チームで共有する場合は `.mwgrc` を commit します。

## プライバシー

CLI は既定で匿名の利用統計 (検索クエリの文字列、取得したガイド ID、OS、エージェント名、所要時間の段階値など) を送信します。止めたい場合は環境変数を設定します。

```bash
# macOS / Linux / Git Bash
DISABLE_TELEMETRY=1 npx -y modern-web-guidance@latest search "view transition"
```

```powershell
# Windows (PowerShell)
$env:DISABLE_TELEMETRY = "1"; npx -y modern-web-guidance@latest search "view transition"
```

## 出典

Modern Web Guidance は Google Chrome / Microsoft Edge / Mozilla Firefox / MDN のチームが中心になって整備しているプロジェクトで、ライセンスは Apache-2.0 です。この Skill はガイド本文を再配布せず、CLI の呼び出し方だけを案内します。
