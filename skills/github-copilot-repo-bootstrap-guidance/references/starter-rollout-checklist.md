# Starter Rollout Checklist

Use this checklist when applying templates from `assets/starter-repo/` into a downstream repository.

## Minimum First Slice

- Add `memory-bank/spec.md`, `memory-bank/plan.md`, and `memory-bank/task.md`.
- Add `.github/copilot-instructions.md` with repo-wide rules only.
- Record what was adopted and what was deferred in `memory-bank/task.md`.

## Second Slice

- Add `.github/instructions/source-code.instructions.md` after confirming the main code globs.
- Add `.github/instructions/tests.instructions.md` after confirming the test file naming patterns.
- Add `.github/instructions/docs.instructions.md` after confirming where docs live.

## Optional Agent Slice

- Add `software-engineer.agent.md` when implementation work needs a dedicated persona.
- Add `architect.agent.md` when the repo needs option comparison and boundary design.
- Add `reviewer.agent.md` when findings-first review language should be standardized.
- Add `debugger.agent.md` when bug isolation and root-cause writeups should be standardized.

## Review Questions

- Is each rule in the correct layer: repo-wide instruction, path-specific instruction, or agent?
- Were only templates introduced that the team is ready to maintain?
- Were broad file globs adjusted to the actual repository layout?
- Does `memory-bank/task.md` include the owner, next step, and handoff note?
