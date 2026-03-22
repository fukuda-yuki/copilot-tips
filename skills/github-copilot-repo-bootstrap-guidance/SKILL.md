---
name: github-copilot-repo-bootstrap-guidance
description: GitHub Copilot 向けの repository instructions、path-specific instructions、custom agents、memory-bank の最小雛形を新規 repo や既存 repo へ段階的に導入するときに使う skill。導入後の継続的な task 管理や day-to-day の memory-bank 運用が主題なら使わない。
---

# GitHub Copilot Repo Bootstrap Guidance

## Purpose

GitHub Copilot 向けの土台を、一度に盛り込み過ぎず small step で導入する。repo-wide rules、path-specific rules、agent、memory-bank を混ぜずに入れられる状態を成功とする。

## When to use

- 新しい repo に Copilot 向けの最小セットを入れたいとき
- 既存 repo へ instructions、agents、memory-bank を段階導入したいとき
- repo-wide rules と path-specific rules の境界を引き直したいとき
- starter template をどこから入れるか決めたいとき

## When not to use

- `memory-bank/spec.md` `plan.md` `task.md` を日常運用したいとき
- repo 固有の実装規約や domain rule を深く設計したいとき
- modernization や CI の案件固有 guidance が主題のとき

## Inputs to inspect

- repo の主要ディレクトリ構成
- docs、tests、source code の glob
- 既存の instructions、agents、memory-bank
- 何を first slice に入れ、何を defer するか

## Workflow

1. repo 構成を見て、starter をそのまま使える範囲と調整が必要な範囲を分ける。
2. 最小 first slice として `memory-bank/spec.md` `plan.md` `task.md` を検討する。
3. `.github/copilot-instructions.md` には repo-wide rule だけを入れる。
4. path-specific instructions は実際の glob を確認してから追加する。
5. agent は明確な役割が見えたものだけを追加する。
6. 何を採用し、何を後回しにしたかを task または rollout note に残す。

## Gotchas

- 初回から全部の template を入れると維持コストが読めなくなる。
- repo-wide rule と path-specific rule を混ぜると調整が難しくなる。
- starter の glob を実 repo に合わせずコピーすると誤作動しやすい。
- bootstrap skill を継続運用の task 管理へ流用すると責務が崩れる。

## Output

- starter 導入計画
- どの雛形を first slice で入れるかの提案
- repo-specific な調整点メモ

## Validation

- Trigger する prompt:
  - `新しい repo に GitHub Copilot 向けの instructions と memory-bank の土台を入れたい`
  - `repo-wide rules と path-specific rules を分けて starter を導入したい`
  - `Copilot 用の最小セットを small step で入れたい`
- Trigger しない prompt:
  - `memory-bank/task.md の日常運用ルールを整えたい`
  - `ASP.NET Core MVC の unit test と Playwright の境界を決めたい`
  - `modernization の次 slice を実装順で決めたい`
- Near-miss prompt:
  - `memory-bank/spec plan task の shared workflow を整えたい`
  - `instructions はあるので次は plugin ではなく案件 task を運用したい`

## Trigger risks

### Over-trigger risks

- `memory-bank` という語だけで継続運用 skill と競合しやすい。
- starter の話でも、実際には repo 固有規約の設計が主題なことがある。

### Under-trigger risks

- `Copilot を入れたい` `雛形を整えたい` `bootstrap したい` も有効な合図になる。
- `agents` `instructions` `memory-bank` のいずれか一つだけでも、初期導入なら対象に含める。

## References

- 導入順を決める前に `references/starter-rollout-checklist.md` を読む。

## Assets

- `assets/starter-repo/.github/copilot-instructions.md` は repo-wide rules の雛形が必要なときに使う。
- `assets/starter-repo/.github/instructions/` は path-specific instruction の雛形が必要なときに使う。
- `assets/starter-repo/.github/agents/` は役割が明確な custom agent を足すときに使う。
- `assets/starter-repo/memory-bank/` は shared source of truth の雛形が必要なときに使う。
