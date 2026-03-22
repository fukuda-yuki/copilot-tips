---
title: GitHub Actions CI/CD Best Practices
parent: Guides
nav_order: 78
description: broad CI/CD policy と deploy / rollback の考え方
---

## このページの役割

このページは、GitHub Actions を build/test だけでなく deploy、promotion、rollback まで含めて整理する `github-actions-delivery-policy-guidance` plugin を説明します。既存の `dotnet-playwright-ci-guidance` を `.NET + Playwright CI` の実装層に残し、その上位で policy layer を持つ想定です。

## 対象シナリオ

- workflow 構造、trigger、env、secret、artifact、environment を全体設計したい
- PR checks と deploy workflow の責務を分けたい
- build once / promote many の形や rollback 導線を明確にしたい
- reusable workflow、matrix、cache を広域の CI/CD 観点で整理したい

## Plugin Catalog

| Plugin | 役割 | 同梱物 | 完成度 |
| --- | --- | --- | --- |
| `github-actions-delivery-policy-guidance` | broad CI/CD の policy layer と rollout 順序を整理し、deploy / promotion / rollback まで含めて設計する | skill: `github-actions-delivery-policy-guidance` / reference: `cicd-rollout-checklist` | thin |

## 進め方

1. CI と CD を分け、pull request で必要な checks と protected branch で必要な deploy を切り分けます
2. workflow / job / environment ごとに secrets と permissions を最小化します
3. cache と artifact を分離し、再利用対象と監査対象を混同しません
4. environment protection、manual approval、promotion、rollback を workflow 単位で明記します
5. reusable workflow や matrix は、保守性と可観測性を下げない範囲で使います

## 使い分けメモ

- `.NET test` と Playwright E2E の具体的な CI 組み立ては [50-github-actions](50-github-actions.md) と `dotnet-playwright-ci-guidance` を使います
- 既存 YAML の仕様化は [73-github-actions-workflow-spec](73-github-actions-workflow-spec.md) を使います
- この plugin は broad policy layer です。特定言語の build command には寄せません
