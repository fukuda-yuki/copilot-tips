# Skill Review Checklist

Use this checklist before finalizing any new or revised skill.

## 1. Scope

- [ ] The skill solves one coherent class of tasks.
- [ ] The skill is not trying to replace all project instructions.
- [ ] The skill is broad enough to be reused.
- [ ] The skill is not so broad that it would trigger constantly.
- [ ] Out-of-scope cases are explicitly identified.

## 2. Trigger description

- [ ] The description states what the skill does.
- [ ] The description states when the skill should be used.
- [ ] The description includes near-miss cases that should not activate it.
- [ ] The wording is concrete, not generic.
- [ ] The description is short enough to stay clear.

## 3. Instruction quality

- [ ] The instructions are procedural.
- [ ] The instructions specify what to inspect first.
- [ ] The instructions define defaults where useful.
- [ ] The instructions avoid long menus of equivalent options.
- [ ] The level of strictness matches the task fragility.

## 4. Context economy

- [ ] The skill contains information the model would likely not infer reliably on its own.
- [ ] Generic background knowledge is minimized.
- [ ] Deep detail has been moved out of `SKILL.md` when appropriate.
- [ ] Each section earns its place.

## 5. Structure

- [ ] The skill includes `Purpose`.
- [ ] The skill includes `When to use`.
- [ ] The skill includes `When not to use`.
- [ ] The skill includes `Inputs to inspect`.
- [ ] The skill includes `Workflow`.
- [ ] The skill includes `Output`.
- [ ] The skill includes `Validation`.
- [ ] The skill includes `Trigger risks`.
- [ ] The skill includes `Gotchas` if there are recurring mistakes or hidden invariants.

## 6. Progressive disclosure

- [ ] Supporting detail is placed in `references/` only when necessary.
- [ ] The skill explicitly says when to read each supporting file.
- [ ] The skill does not tell the agent vaguely to "check references."

## 7. Templates and formatting

- [ ] A reusable template exists when output shape matters.
- [ ] The template is concrete enough to reduce formatting drift.
- [ ] The template is optional when the user provided a stronger required format.

## 8. Validation

- [ ] There are 2-3 prompts that should clearly trigger the skill.
- [ ] There are 2-3 prompts that should clearly not trigger the skill.
- [ ] There are near-miss prompts.
- [ ] Expected good behavior is described.
- [ ] Common failure modes are described.

## 9. Trigger risks

### Over-trigger risks

- [ ] Similar but different tasks may incorrectly invoke the skill.
- [ ] The description is tightened if this risk is high.

### Under-trigger risks

- [ ] Obvious valid use cases might fail to invoke the skill.
- [ ] The description is broadened if this risk is high.

## 10. Reusability

- [ ] Repeated logic is moved into assets, references, or scripts when justified.
- [ ] The skill can be reused across more than one conversation.
- [ ] The skill does not rely on one vendor's hidden runtime behavior.

## 11. Final pass

- [ ] The skill is shorter, clearer, and more actionable than the previous draft.
- [ ] The instructions reflect real work, not only abstract theory.
- [ ] The draft is ready for at least one real execution test.
