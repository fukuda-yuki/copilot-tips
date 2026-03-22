---
name: aspnetcore-mvc-test-strategy-guidance
description: ASP.NET Core MVC で unit test、integration test、Playwright E2E の境界、selector 方針、E2E に上げる導線の選び方を整理するときに使う skill。画面設計そのものや GitHub Actions の workflow 設計が主題なら使わない。
---

# ASP.NET Core MVC Test Strategy Guidance

## Purpose

ASP.NET Core MVC アプリのテスト責務を layer ごとに分け、壊れにくいテスト戦略を決める。重要導線だけを E2E に上げ、残りを unit または integration で守る状態を成功とする。

## When to use

- unit / integration / Playwright の分担を決めたいとき
- どの画面導線を E2E に上げるべきか整理したいとき
- selector や `data-testid` 方針を見直したいとき
- flaky な UI test を減らしたいとき

## When not to use

- Controller / ViewModel / PRG の設計自体が主題のとき
- GitHub Actions の job 分割、permissions、cache が主題のとき
- テスト内容ではなく deploy / rollback policy が主題のとき

## Inputs to inspect

- 既存の unit test、integration test、Playwright test
- 重要なユーザーフローと障害時の影響範囲
- DI 境界、外部依存、HTTP / DB の結線箇所
- flaky failure のログや再現条件
- 現在の selector と test data の扱い

## Workflow

1. まず守るべき画面導線と壊れたときの影響を列挙する。
2. 画面をまたがない判断は unit test、結線確認は integration test に寄せる。
3. 画面をまたぐ重要導線だけを Playwright E2E に残す。
4. Playwright では壊れにくい locator を優先し、必要なら `data-testid` を追加する。
5. 同じ失敗を複数レイヤーで重複検知しないよう、各 test の役割を短く説明する。
6. flaky 要因が UI 以外にある場合は E2E ではなく下位レイヤーへ戻す。

## Gotchas

- E2E だけで安心しようとすると原因切り分けが難しくなる。
- private method や内部実装の順序に依存した assertion はすぐ壊れる。
- CSS class や見た目依存 selector は UI 変更に弱い。
- 同じ導線を unit と E2E の両方で細かく重ねると保守負荷が増える。

## Output

- MVC アプリ向けのテスト分担方針
- E2E 対象導線の選定メモ
- flaky test の見直し案
- locator と `data-testid` の運用方針

## Validation

- Trigger する prompt:
  - `ASP.NET Core MVC で unit test と Playwright E2E の境界を決めたい`
  - `重要な画面導線だけを E2E に残したい`
  - `Playwright の selector が壊れやすいので方針を見直したい`
- Trigger しない prompt:
  - `Controller の責務を service に逃がしたい`
  - `GitHub Actions の permissions と matrix を見直したい`
  - `production deploy の rollback 手順を決めたい`
- Near-miss prompt:
  - `MVC アプリの POST/Redirect/GET を整理したい`
  - `.NET test と Playwright を CI でどう分けるか決めたい`

## Trigger risks

### Over-trigger risks

- `test` という語だけで CI skill や behavior-first skill と競合しやすい。
- Playwright だけが話題でも、主題が CI 実行なら別 skill が適切になる。

### Under-trigger risks

- `flaky` `selector` `data-testid` だけの相談でも有効。
- `integration test を入れるべきか` の相談も MVC test strategy の一部として拾う。
