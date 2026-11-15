---
ask: プロンプトを監査して
---

## 監査レポート

**前提**

- **対象範囲:** リポジトリ内の `AGENTS.md`、`CLAUDE.md`、`skills/**/SKILL.md`、および参照ファイル。`.github/` には対象となる指示ファイルなし。秘密情報の可能性がある設定ファイルは未読。
- **対象モデル:** この監査を実行しているモデル。モデル固定の記述はなく、Copilot では他モデルでも読まれうるため、モデル依存の指摘は中確度以下。
- **変更:** なし。以下は提案 diff のみ。

最も影響が大きいのは、`imozuru` の description に具体例が過剰に列挙され、トリガー判定のコストと誤発火面が増えている点です。また、本文に過去の試行日・失敗談が複数残り、現在のルールと検証記録が混在しています。現在の方針を保ったまま、トリガーを意図カテゴリへ一般化し、本文から履歴叙述を除くのが妥当です。

| グループ | 件数 |
|---|---:|
| Group 1: 古いプロンプト表現 | 0 |
| Group 2: Skill / 設定ファイル | 2 |
| Group 3: ツール説明 | 該当なし |
| Group 4: リクエスト構成・アーキテクチャ | 該当なし |

### Finding 1

- **Location:** `skills/imozuru/SKILL.md:2`
- **Evidence:** `"「芋づる式に調べて」「この分野をキャッチアップしたい」..."`
- **Pattern:** Group 2「Trigger-case enumeration」
- **Why obsolete:** トリガー description に近い依頼文を多数列挙する形式は、追加例に依存して増殖し、意図の一般化よりも表現の一致に依存します。Skill の目的、適用範囲、近接する非対象をカテゴリで示す方が再利用性が高くなります。
- **Confidence:** Medium
- **Action:** `rewrite`

### Finding 2

- **Location:** `skills/imozuru/SKILL.md:50-72, 103, 129, 197`
- **Evidence:** `"試行では..."`、`"2026-10-12 の比較..."`、`"2026-10-14 には..."`、`"2026-10-12 の試行では..."`、`"React の試行では..."`
- **Pattern:** Group 2「History narratives」および「Patch accretion」
- **Why obsolete:** 過去の試行日・個別事故・実験結果が、現在の手順と同じ本文に混在しています。現在も有効なルールは残し、履歴の根拠は `references/theory.md` や変更履歴に分離した方が、モデルが現在の手順と過去の経緯を混同しません。
- **Confidence:** Medium
- **Action:** `rewrite`

**その他:** `AGENTS.md` の設計意図、`copilot-doctor`・`skill-creator` の手順、`imozuru/references/theory.md` の出典記録は、プロジェクト固有の文脈または根拠資料として維持します。自動検証コマンドは実行していませんが、参照されている主要な Skill・reference・script の存在は確認済みです。モデルによる事前・事後の行動評価は、この環境では実施できません。

## 修正案 diff

…
