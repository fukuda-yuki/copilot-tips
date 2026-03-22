---
applyTo: "**/*.c, **/*.cc, **/*.cpp, **/*.cs, **/*.go, **/*.java, **/*.js, **/*.jsx, **/*.php, **/*.py, **/*.rb, **/*.rs, **/*.ts, **/*.tsx"
description: "変更範囲を明確にし、小さくレビューしやすい修正を行いたいリポジトリ向けのソースコード指示テンプレート。"
---

# Source Code Instruction Template

Adjust `applyTo` to match the actual repository before using this file.

## Change Shape

- Prefer the smallest complete change that solves the task.
- Preserve public contracts unless the task explicitly calls for an interface change.
- Keep side effects near clear boundaries and avoid hiding I/O inside unrelated helpers.

## Maintainability

- Match existing naming, module layout, and error-handling conventions.
- Add short comments only when the code would otherwise be hard to understand.
- Avoid speculative abstractions that are not required by the current task.

## Verification

- Add or update tests when behavior changes.
- If a behavior is intentionally unchanged, do not refactor unrelated areas in the same change.
