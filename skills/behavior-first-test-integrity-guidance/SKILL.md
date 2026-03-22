---
name: behavior-first-test-integrity-guidance
description: behavior source、failure mode、characterization と TDD の区別、implementation-coupled な assertion の回避を軸にテスト案やレビューを整理するときに使う skill。MVC の test layer 分担や CI の実行設計が主題なら使わない。
---

# Behavior First Test Integrity Guidance

## Purpose

実装に迎合したテストを避け、守るべき振る舞いと失敗条件からテストを評価する。テストが何を守るのか、なぜその形なのかを明示できる状態を成功とする。

## When to use

- AI 生成テストや手書きテストの妥当性をレビューしたいとき
- behavior source と failure mode を明示してテストを整理したいとき
- characterization test か TDD かを正しくラベル付けしたいとき
- implementation-coupled な assertion を弾きたいとき

## When not to use

- ASP.NET Core MVC の unit / integration / Playwright 分担が主題のとき
- GitHub Actions 上でどう回すかが主題のとき
- テスト対象ではなくアプリ設計そのものが主題のとき

## Inputs to inspect

- 仕様、バグ報告、ユーザーフロー、受け入れ条件
- 既存テストと失敗時ログ
- 変更対象コードと公開振る舞い
- レビュー対象のテスト本文

## Workflow

1. 先に `Behavior Source` を決め、何の根拠でこのテストが必要か固定する。
2. そのテストが捕まえるべき `Failure To Catch` を一文で書く。
3. assertion が公開振る舞いに向いているかを見て、内部実装依存なら落とす。
4. `Characterization` か `TDD` かを実装の前後関係で正しくラベル付けする。
5. `Why Not Implementation-Coupled` を短く書き、テストの意味を保つ。
6. 最小の変更で意味のある保護になる形へ絞る。

## Gotchas

- private method や内部呼び出し順への assertion は、振る舞い保護にならない。
- 実装後に追加したテストを `TDD` と呼ぶと議論が崩れる。
- 大きい snapshot は failure の意味が曖昧になりやすい。
- mock が実装手順の写経になると、内部リファクタで無駄に壊れる。

## Output

- テストレビュー
- 振る舞いベースのテスト提案
- `Behavior Source` `Failure To Catch` `Why Not Implementation-Coupled` `Test Type` を持つメモ

## Validation

- Trigger する prompt:
  - `このテストが implementation detail に寄り過ぎていないか見てほしい`
  - `characterization test と TDD を区別してテスト案を整理したい`
  - `AI が出したテスト案を behavior-first でレビューしたい`
- Trigger しない prompt:
  - `Playwright と integration test の境界を決めたい`
  - `GitHub Actions で test job を分けたい`
  - `Controller の責務分離を見直したい`
- Near-miss prompt:
  - `ASP.NET Core MVC で重要導線だけを E2E にしたい`
  - `.NET test を CI でどの順に回すべきか決めたい`

## Trigger risks

### Over-trigger risks

- `test review` という語だけで MVC test strategy 相談にも反応しやすい。
- framework や runner の話でも、主題が integrity ではなく execution なら別 skill が適切になる。

### Under-trigger risks

- `この assertion 変じゃない?` `壊れやすい test を減らしたい` といった短い相談でも有効。
- `characterization` の語がなくても、現行挙動を固定したい相談は対象に含める。

## References

- raw なテスト案やレビューを確定する前に `references/test-integrity-checklist.md` を読む。
