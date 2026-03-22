# Repository Copilot Instructions

Use this file for repository-wide rules only. Move file-pattern-specific rules into `.github/instructions/*.instructions.md`.

## Repository Rules

- Prefer small, reviewable changes over broad one-shot rewrites.
- State assumptions, open questions, and non-obvious tradeoffs explicitly.
- Match the repository's existing naming, layout, and dependency boundaries.
- Update `memory-bank/spec.md`, `memory-bank/plan.md`, and `memory-bank/task.md` when decisions, scope, or handoff state changes.

## Boundaries

- Agent: persona and dialogue mode.
- Skill or prompt: repeatable workflow.
- Instruction: automatic rule tied to file patterns.

Do not hide file-pattern rules inside agent personas.

## Change Discipline

- Before larger work, record the intended slice in `memory-bank/task.md`.
- Keep tests and docs aligned with code changes when the repository requires them.
- Prefer minimal new dependencies and explain why they are needed.
