---
applyTo: "**/*Tests.cs, **/*.spec.js, **/*.spec.ts, **/*.test.js, **/*.test.ts, **/tests/**/*.py, **/test/**/*.py, **/*_test.go, **/*Test.java, **/*_spec.rb"
description: "現在の実装をなぞるだけでなく、振る舞いを重視したテストを書くためのテスト指示テンプレート。"
---

# Test Instruction Template

Adjust `applyTo` to match the actual repository before using this file.

## Test Intent

- Write tests against behavior, contracts, and failure modes rather than private implementation details.
- Name the behavior being protected and the failure the test should catch.
- Prefer stable fixtures and deterministic inputs over brittle environment coupling.

## Guardrails

- Do not add tests that only prove the current implementation happens to return the same value.
- Label characterization tests as characterization tests when they lock in current behavior.
- If the team says it is TDD, start with a failing test before the implementation change.

## Reviewability

- Keep each test focused on one reason to fail.
- Make test failures easy to diagnose from the assertion message and setup.
