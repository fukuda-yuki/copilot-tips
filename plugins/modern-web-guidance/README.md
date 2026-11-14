# modern-web-guidance

Web UI (HTML / CSS / クライアント側 JavaScript) を書く前に、Google の [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) から最新の作法を引いてくるプラグインです。

LLM の学習データには古い書き方が大量に含まれているため、エージェントは放っておくとレガシーな実装 (自前のモーダル、JS でのスクロール制御、重い polyfill など) を書きます。このプラグインを入れると、エージェントは実装前に 250 件超のガイドから必要なものを検索し、Baseline に沿った書き方とフォールバックを取得してから書くようになります。

- skills: `modern-web-guidance`

## インストール

```bash
copilot plugin install modern-web-guidance@copilot-tips
```

## 前提

- **Node.js 22 以上** と `npx`
- 初回実行時に npm からパッケージを取得するため、ネットワークが必要

## 仕組み

ガイド本文はこのリポジトリに同梱していません。Skill が `npx -y modern-web-guidance@latest` を呼び、上流の最新ガイドを検索・取得します。上流が更新されれば、こちらを更新しなくても内容は新しくなります。

```bash
npx -y modern-web-guidance@latest search "light dismiss dialog"
npx -y modern-web-guidance@latest retrieve "dialog"
```

## 注意

- CLI は既定で匿名の利用統計を送ります。止めるには `DISABLE_TELEMETRY=1` を設定してください。
- ガイドは英語です。エージェント向けの内容なので、そのまま読ませて構いません。
- オフラインで完結させたい場合は、上流の `npx modern-web-guidance@latest install` を使うとガイドをローカルに配置できます (このプラグインはその方式ではありません)。

## 上流と併用する場合

上流の Skill も `modern-web-guidance` という名前です。両方入れると名前が重複するので、どちらか一方にしてください (このプラグインは上流の CLI を呼ぶだけなので、機能は同じです)。

## リンク

- 上流リポジトリ: <https://github.com/GoogleChrome/modern-web-guidance>
- ドキュメント: <https://developer.chrome.com/docs/modern-web-guidance>
