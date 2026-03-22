---
name: <skill-name>
description: Use this skill when <clear user intent>, especially when <specific triggering context>. Do not use it for <near-miss cases>.
---

# `Skill Title`

## Purpose

Describe what this skill is for and what success looks like.

## When to use

List the concrete situations, user intents, or task shapes that should activate this skill.

## When not to use

List adjacent cases that should not activate this skill.

## Inputs to inspect

List the files, signals, or context to inspect first.

Examples:

- repository files
- configuration files
- logs
- API specs
- issue descriptions
- existing outputs
- user-provided constraints

## Workflow

1. Inspect the relevant context.
2. Identify constraints, defaults, and hidden assumptions.
3. Create an intermediate plan if the work is fragile, destructive, or multi-step.
4. Produce the required artifact or transformation.
5. Validate the result.
6. Revise if validation fails.
7. Summarize key decisions, risks, and follow-up items.

## Gotchas

List the project-specific mistakes, hidden invariants, naming mismatches, or misleading signals that commonly cause errors.

Examples:

- The API returns success codes even for some logical failures.
- Two different field names refer to the same underlying identifier.
- The output must match an internal schema exactly.

## Output

Describe the expected deliverable.

Examples:

- revised source file
- markdown report
- issue comment draft
- migration plan
- release checklist
- test cases

If the format matters, specify it.

## Validation

List the checks that should be performed before finalizing.

Examples:

- verify required fields are present
- compare against a known-good example
- ensure formatting matches the requested shape
- confirm the output addresses all requested constraints

## Trigger risks

### Over-trigger risks

- Describe nearby cases that might accidentally activate this skill.

### Under-trigger risks

- Describe valid cases that might fail to activate this skill.

## References

List optional supporting files only if needed, and say exactly when to read them.

Example:

- Read `references/api-errors.md` only when the API returns an unexpected response shape.

## Assets

List optional templates or static resources only if needed, and say exactly when to use them.

Example:

- Use `assets/report-template.md` when the user asks for a formal findings report.