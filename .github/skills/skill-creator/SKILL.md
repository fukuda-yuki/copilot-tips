---
name: skill-creator
description: Use this skill when the user wants to create a new GitHub Copilot agent skill, adapt an existing skill, improve a skill's trigger description, review a skill's structure, add validation and evaluation, or extract a reusable skill from repeated real-world work. This skill is for authoring and iterating on skills themselves.
license: Adapted for GitHub Copilot environments
---

# Skill Creator

Create, revise, and iteratively improve GitHub Copilot agent skills in a portable way.

This skill is for:
- creating a new skill from scratch
- adapting a skill from another ecosystem
- reviewing an existing skill for scope, trigger quality, and structure
- improving a skill after real executions
- adding lightweight validation, gotchas, and reusable helper assets
- refining a skill description so it triggers in the right situations

## Purpose

A good skill captures reusable expertise for a coherent class of tasks.

Use this skill to turn:
- repeated successful work
- repeated corrections
- project-specific conventions
- runbooks, schemas, examples, and failure cases

into a reusable skill folder with:
- `SKILL.md`
- optional `references/`
- optional `scripts/`
- optional `assets/`

## Core principles

Apply these principles throughout the process:

1. Start from real expertise
   - Prefer real project knowledge over generic best-practice prose.
   - Capture conventions, edge cases, decision rules, and tool choices the model would not reliably infer on its own.

2. Extract from real work
   - If the user has already completed this kind of task with the agent before, mine that interaction for:
     - the steps that worked
     - corrections that were necessary
     - required inputs and outputs
     - project-specific constraints

3. Synthesize from project artifacts
   - Prefer real source material over generic guidance.
   - Useful artifacts include runbooks, style guides, API specs, schemas, config files, code review comments, issue trackers, version control history, patches, and real failure cases.

4. Refine with execution
   - The first draft is rarely final.
   - Run representative prompts, inspect results, identify false positives, false negatives, wasteful steps, and confusing instructions, then revise.

5. Spend context wisely
   - Include what the model would likely get wrong without the skill.
   - Omit background knowledge the model already knows.
   - Keep instructions concise, procedural, and high-value.

6. Design coherent units
   - A skill should cover one coherent class of work.
   - If it tries to do too much, split it.
   - If it is too tiny to be reusable, broaden it.

## What to produce

When creating a new skill, produce:

1. Recommended skill path
2. `SKILL.md`
3. Any optional supporting files that are actually justified
4. A validation plan
5. Trigger-risk notes
6. Improvement notes for future iterations

When reviewing an existing skill, produce:

1. Scope diagnosis
2. Trigger diagnosis
3. Instruction-quality diagnosis
4. Bundling diagnosis
5. Recommended fixes
6. A revised skill draft when appropriate

## Standard workflow

Follow this workflow unless the user explicitly asks for a narrower engagement.

### Phase 1: Define the skill

1. Identify the job of the skill
   - What class of tasks should it handle?
   - What is in scope?
   - What is out of scope?
   - Is this better as a skill, a custom instruction, or a custom agent?

2. Identify the source of truth
   - Ask for or inspect the real materials that encode domain knowledge.
   - Prefer actual examples over hypothetical descriptions.

3. Define the trigger surface
   - Write the description around:
     - what the skill does
     - when it should activate
     - which adjacent situations should not activate it

4. Decide the control level
   - Be flexible when many approaches are valid.
   - Be prescriptive when order, safety, or exactness matters.

### Phase 2: Draft the skill

Create or revise the frontmatter and body.

The draft should include:
- purpose
- when to use
- when not to use
- inputs to inspect
- workflow
- output expectations
- validation guidance
- gotchas
- optional references/scripts/assets only when justified

### Phase 3: Add operational structure

For multi-step or fragile workflows, add:
- explicit checklist tracking
- validation loops
- plan-validate-execute pattern
- output templates when format matters

### Phase 4: Validate

Create realistic prompts and check:
- should the skill trigger?
- should it not trigger?
- are the instructions actionable?
- is the output format stable?
- is any step redundant, vague, or over-prescriptive?

### Phase 5: Iterate

After trial runs:
- add newly discovered mistakes to `## Gotchas`
- remove low-value text
- tighten or broaden the description as needed
- bundle repeated logic into `scripts/` where justified
- move deep detail into `references/` with explicit load conditions

## Drafting rules

### 1. Prefer procedures over declarations

Do not merely state facts about the domain.

Instead, tell the agent how to approach the task:
- what to inspect first
- what decisions to make
- what order to follow
- how to verify the result

### 2. Provide defaults, not menus

If multiple approaches are possible:
- choose one default
- mention alternatives only as exceptions or escape hatches

Do not present many equivalent options without a recommendation.

### 3. Match specificity to fragility

Use strict instructions when:
- the task is destructive
- order matters
- safety or correctness is fragile
- a validator exists
- consistency is important

Use lighter guidance when:
- multiple approaches are acceptable
- the task is exploratory
- local judgment is useful

### 4. Aim for moderate detail

Do not try to encode every edge case inline.

Use concise, stepwise guidance in `SKILL.md`.
Move deep detail to references only when needed.

### 5. Use progressive disclosure

Keep `SKILL.md` focused on what is needed on every activation.

When detailed supporting material is required:
- place it in `references/`
- tell the agent exactly when to read it

Good:
- Read `references/skill-review-checklist.md` before finalizing a new or revised skill.
- Read a deeper reference only when the task clearly requires it.

Bad:
- See `references/` for more details.

## Required sections for generated skills

When generating a new skill, use this structure unless there is a strong reason to adapt it.

### Frontmatter
- `name`
- `description`
- optional `license`

### Body
- `# <Skill Title>`
- `## Purpose`
- `## When to use`
- `## When not to use`
- `## Inputs to inspect`
- `## Workflow`
- `## Gotchas`
- `## Output`
- `## Validation`
- `## Trigger risks`
- `## References` (optional usage guidance only)
- `## Assets` (optional usage guidance only)

## Gotchas

Always consider whether the skill needs a `## Gotchas` section.

Use it for:
- environment-specific facts
- naming mismatches
- hidden invariants
- misleading signals
- recurring agent mistakes
- assumptions that are likely to be wrong

Good gotchas are concrete and corrective.

Examples:
- The staging API returns `200 OK` for authentication failures; inspect the response body, not the status code alone.
- `customerId`, `account_id`, and `uid` all refer to the same identifier in different systems.
- The release branch is immutable after creation; fixes must be made elsewhere and re-cut.

When a new recurring mistake is discovered during execution, add it here.

## Templates

If the output format matters, prefer a concrete template over abstract prose.

Use `assets/skill-template.md` when creating a new skill draft unless the user already provided a required structure.

## Checklists

For multi-step workflows with dependencies or quality gates, use a checklist.

Before finalizing a new or revised skill, read and apply:
- `references/skill-review-checklist.md`

## Validation loops

When validation is possible:
1. Draft the skill
2. Review it against the checklist
3. Create representative prompts
4. Inspect likely trigger behavior
5. Revise the skill
6. Finalize only after the revised draft is materially better than the previous one

## Plan-validate-execute

For batch, destructive, or hard-to-reverse work:
1. Create a structured plan
2. Validate the plan against the source of truth
3. Revise until valid
4. Execute only after validation passes

## Subagents

If subagents are available in the current Copilot environment, they may be used for isolated research, comparison, or review work.

Good uses:
- compare two candidate descriptions
- review trigger overreach independently
- analyze existing artifacts in parallel
- inspect whether a draft is too broad or too narrow

Do not make this skill depend on subagents.
Do not assume nested subagent orchestration.
Do not assume vendor-specific subagent features.

## Review rubric

Use this rubric whenever reviewing or revising a skill.

### A. Scope
- Is the skill solving one coherent class of tasks?
- Is anything clearly out of scope but still included?
- Is it too narrow to be reusable?

### B. Trigger quality
- Does the description say what the skill does and when to use it?
- Are near-miss cases likely to over-trigger it?
- Are obvious valid cases likely to under-trigger it?

### C. Context economy
- Does the skill mostly contain information the model would not already know?
- Is anything generic or redundant?

### D. Instruction quality
- Are the instructions procedural?
- Are defaults clear?
- Is the level of prescription appropriate to the fragility of the task?

### E. Structure quality
- Are gotchas present where needed?
- Is a template included where output format matters?
- Are checklist / validation loop / plan-validate-execute included when appropriate?

### F. Bundling quality
- Are `references/`, `scripts/`, and `assets/` actually useful?
- Is deep detail moved out of `SKILL.md` with explicit load conditions?
- Is any repeated logic still being reinvented?

### G. Validation quality
- Are there realistic positive prompts?
- Are there realistic negative or near-miss prompts?
- Is there a clear pass/fail basis?
- Is there a concrete next iteration path?

## Validation plan for skills created with this skill

Create a lightweight validation set with:
- 2 to 3 prompts that should clearly trigger the skill
- 2 to 3 prompts that should clearly not trigger it
- 2 near-miss prompts that are semantically adjacent

For each prompt, record:
- should trigger or should not trigger
- why
- what a good result would look like
- what a common failure would look like

After review, revise:
- the description if trigger behavior is wrong
- the workflow if the agent wastes steps
- the gotchas if a repeated mistake appears
- the assets if formatting is repeatedly inconsistent

## Output contract for this skill

When this skill is active, prefer:
- concrete rewrites over abstract commentary
- complete skill drafts over partial sketches
- explicit trigger-risk notes
- practical validation prompts
- portable guidance that works across Copilot environments

## Final guidance

The best skill is not the most comprehensive skill.

It is the skill that:
- activates reliably
- contains high-value instructions
- reflects real practice
- validates where possible
- improves through real use