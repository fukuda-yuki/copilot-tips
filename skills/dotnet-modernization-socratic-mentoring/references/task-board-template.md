# Modernization Task Board Template

モダナイゼーション案件を複数 agent や複数人で共有するときの最小台帳テンプレート。1 task は 1 つの legacy behavior に対応させ、仕様確認と移行判断を混ぜすぎない。

## 運用ルール

- `Status` は `todo`, `in_progress`, `blocked`, `decided`, `done` のいずれかにする。
- `Owner` は user 名、agent 名、またはチーム名を書く。
- `Evidence` には、現行コード、画面、SQL、ヒアリング、計測結果などの根拠を書く。
- `Chosen direction` は決定後だけ埋める。未決なら空欄のままにする。
- `Next step` は次に確認する 1 手だけを書く。

## Template

```md
# Modernization Task Board

## Task M-001

| Field | Value |
| --- | --- |
| Task ID | M-001 |
| Status | todo |
| Owner | unassigned |
| Legacy behavior | 現行画面や現行処理で実際に起きていることを書く |
| Unknowns | 不明な仕様、条件分岐、権限、例外処理を書く |
| Candidate options | 次世代で検討する 2〜3 案を書く |
| Chosen direction | 決まった案を書く |
| Evidence | コード、SQL、画面、ヒアリング、計測の根拠を書く |
| Next step | 次に確認することを書く |

## Task M-002

| Field | Value |
| --- | --- |
| Task ID | M-002 |
| Status | todo |
| Owner | unassigned |
| Legacy behavior |  |
| Unknowns |  |
| Candidate options |  |
| Chosen direction |  |
| Evidence |  |
| Next step |  |
```
