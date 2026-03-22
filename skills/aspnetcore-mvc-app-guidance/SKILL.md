---
name: aspnetcore-mvc-app-guidance
description: ASP.NET Core MVC の画面設計、Controller と ViewModel の責務分離、POST-Redirect-GET、ModelState、入力再表示、画面遷移を整理するときに使う skill。Playwright のテスト戦略や GitHub Actions の CI 設計が主題なら使わない。
---

# ASP.NET Core MVC App Guidance

## Purpose

ASP.NET Core MVC の画面実装を、HTTP 入出力、画面再表示、画面遷移、責務分離の観点で整理する。Controller に詰め込み過ぎず、ViewModel と service 境界を明確にした状態を成功とする。

## When to use

- 画面入力、一覧画面、編集画面、確認画面の流れを整理したいとき
- Controller / ViewModel / View / service の責務分離を見直したいとき
- `ModelState`、入力再表示、`POST -> Redirect -> GET` の扱いを揃えたいとき
- 画面遷移やバリデーション失敗時の戻り先をレビューしたいとき

## When not to use

- unit / integration / Playwright の分担が主題のとき
- GitHub Actions の workflow や CI 実行設計が主題のとき
- Minimal API や SPA の構成判断が主題のとき

## Inputs to inspect

- 対象 Controller と action
- 対象 ViewModel、form model、display model
- Razor View と partial
- 画面遷移図、URL 設計、route
- バリデーション要件、再表示要件、成功時メッセージ要件

## Workflow

1. 対象画面の GET と POST を分け、ユーザーの遷移を先に固定する。
2. Controller に残す責務を HTTP 入出力、認可、遷移判断だけへ絞る。
3. 画面専用 ViewModel を決め、入力値と再表示に必要な選択肢を欠かさない。
4. `ModelState` 失敗時の戻り先と、成功時の redirect 先を分けて確認する。
5. 検索、変換、永続化、業務判断は service または use case へ寄せる。
6. 変更後の画面遷移と責務分離を短く言語化し、レビューしやすい形にする。

## Gotchas

- EF Entity や永続化 model をそのまま View に渡すと画面都合の変更で責務が崩れやすい。
- 無効入力の再表示で選択肢や補助データを再生成し忘れると画面が壊れる。
- Controller で SQL、集計、整形を始めると後で unit test が重くなる。
- 成功時も失敗時も `return View(...)` に寄せると PRG が崩れやすい。

## Output

- MVC 画面実装の変更方針
- Controller / ViewModel / View / service の責務整理メモ
- 画面遷移、再表示、バリデーションのレビューコメント

## Validation

- Trigger する prompt:
  - `ASP.NET Core MVC の編集画面で POST 後に一覧へ戻す流れを整理したい`
  - `Controller が太ってきたので ViewModel と service の責務を切り分けたい`
  - `ModelState 失敗時の入力再表示と PRG を見直したい`
- Trigger しない prompt:
  - `Playwright で flaky な E2E を減らす selector 方針を決めたい`
  - `GitHub Actions で .NET test と Playwright をどう分けるか決めたい`
  - `ASP.NET Core を Minimal API に寄せるべきか相談したい`
- Near-miss prompt:
  - `MVC 画面の重要導線だけを Playwright に上げる基準を決めたい`
  - `MVC アプリのテストを GitHub Actions で段階的に回したい`

## Trigger risks

### Over-trigger risks

- ASP.NET Core MVC という語だけで test strategy や CI 設計の相談にも反応しやすい。
- View に触れる話でも、Playwright や workflow 設計が主題なら別 skill が適切になる。

### Under-trigger risks

- `Model binding`、`入力再表示`、`PRG`、`確認画面` などの語だけでは MVC skill と認識されない場合がある。
- `Controller が太い` `ViewModel がない` のようなレビュー依頼も有効な対象として扱う。
