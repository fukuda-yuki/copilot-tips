# Test Integrity Checklist

Use this checklist before accepting an AI-generated or hand-written test proposal.

## Required Labels

- Behavior Source:
- Failure To Catch:
- Why Not Implementation-Coupled:
- Test Type:

## Review Questions

- Does the test protect behavior that users or maintainers care about?
- Would the test still make sense after an internal refactor that preserves behavior?
- Is the test mislabeled as TDD even though it was added after the implementation existed?
- If it is characterization, is the reason for locking current behavior explicit?

## Red Flags

- Assertions tied to private implementation details
- Mocks that simply restate the implementation path
- Broad snapshot-style assertions with unclear failure meaning
- Missing explanation for why the test exists
