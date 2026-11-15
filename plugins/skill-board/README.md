# skill-board

[Skill ボード](https://fukuda-yuki.github.io/copilot-tips/) を、Copilot のチャットの中から使うプラグインです。

- skills: `skill-board`

## 使い方

| やりたいこと | 頼み方の例 |
| --- | --- |
| 合う Skill を探す | 「instructions を整理するのに使える Skill ある?」 |
| いいねを送る | 「copilot-doctor にいいね」「いまの Skill にいいね」 |
| 感想・不具合を送る | 「imozuru に感想を送って。PDF の保存が速かった」 |
| 新着を知る | 「Skill の新着は?」 |

いいねと感想は、あなたの GitHub アカウントの名前で感想スレッドに公開されます。感想は、送る文面を確認してから送ります。

## 必要なもの

- いいねと感想の送信に [GitHub CLI](https://cli.github.com/) (`gh`)。`gh auth login` でサインインしておきます。無い場合は、送り先のリンクを案内します。
