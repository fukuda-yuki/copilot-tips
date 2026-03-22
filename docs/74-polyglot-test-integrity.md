---
title: Polyglot Test Integrity
parent: Guides
nav_order: 76
description: implementation-friendly なテストを避けるための観点
---

## このページの役割

このページは、AI が現状実装に都合のよいテストを書いて満足することを抑制する `behavior-first-test-integrity-guidance` plugin を説明します。言語やフレームワークを固定せず、behavior source、failure mode、test type のラベルを必須にして、characterization test と TDD を混同しないようにします。

## 対象シナリオ

- 既存実装に迎合した後付けテストが増えやすい
- 「テストが通ること」だけが成功条件になっている
- characterization test と TDD の区別を明確にしたい
- agent にテストを書かせる前に、何を守るべきかを言語化したい

## Plugin Catalog

| Plugin | 役割 | 同梱物 | 完成度 |
| --- | --- | --- | --- |
| `behavior-first-test-integrity-guidance` | behavior-first でテスト案を調査し、実装迎合テストを弾き、characterization / TDD を明示する | skill: `behavior-first-test-integrity-guidance` / agent: `polyglot-test-agent` / reference: `test-integrity-checklist` | thin |

## 必須ラベル

各テスト提案には、少なくとも次の 4 つを含めます。

- `Behavior Source`
- `Failure To Catch`
- `Why Not Implementation-Coupled`
- `Test Type: Characterization | TDD`

## Agent / Skill の分担

- Agent: `polyglot-test-agent`
  - テスト案や既存テストを findings-first で批評し、迎合やラベル誤りを指摘します
- Skill: `behavior-first-test-integrity-guidance`
  - 仕様、既知不具合、ユーザーフロー、既存 docs から守るべき behavior を抽出します

## 使い分けメモ

- .NET MVC の unit test / integration test / Playwright E2E の境界整理なら [30-testing-unit](30-testing-unit.md) と [40-testing-e2e-playwright](40-testing-e2e-playwright.md) を先に見ます
- この plugin は言語横断の test quality gate です。フレームワーク別の実装手順は別 guidance に寄せます
- bugfix の characterization test を書く場合でも、なぜ current behavior を lock するのかを必ず添えます
