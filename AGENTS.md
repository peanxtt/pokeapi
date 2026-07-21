# Engineering Workflow

## 1. Understand Before Changing

- Inspect the relevant code, tests, configuration, and repository instructions before editing.
- Identify the root cause and expected behaviour.
- Make reasonable, reversible assumptions when they do not materially change scope.
- Ask the user only when missing information would significantly affect the solution, introduce risk, or expand the task.

## 2. Planning

Create a written plan when the task involves one or more of the following:

- architectural or API decisions;
- unclear requirements or multiple plausible approaches;
- changes across several components;
- migrations, security-sensitive work, or meaningful regression risk;
- several dependent implementation and verification steps.

For small, obvious changes, proceed directly.

A useful plan should include:

- the intended outcome;
- affected areas;
- implementation steps;
- verification steps;
- important risks or assumptions.

Share or record the plan, then proceed without waiting unless user input is genuinely required.

If new evidence invalidates a key assumption, repeated attempts fail, or the scope changes materially, stop the current approach and revise the plan.

## 3. Task Tracking

- Use an existing project task-tracking convention when one is available.
- For long-running work, maintain checkable progress in the project’s designated task file.
- Do not create permanent tracking files for routine changes unless requested.
- Keep progress current and record verification results before completion.

## 4. Delegation and Parallel Work

Use subagents only when tasks are independent and parallelism provides a clear benefit, such as:

- repository exploration;
- external research;
- investigation of separate failure domains;
- independent review or verification.

Give each subagent one bounded, non-overlapping assignment. Keep tightly coupled implementation work with a single owner, and review all delegated findings before using them.

## 5. Implementation Standards

- Prefer the smallest complete change that addresses the root cause.
- Preserve existing behaviour outside the requested scope.
- Follow established project patterns unless there is a concrete reason to improve them.
- Avoid speculative abstractions, unrelated refactors, and temporary workarounds.
- Before finalizing a non-trivial solution, consider whether a simpler and more maintainable design achieves the same result.

## 6. Bug Fixing

For actionable bug reports:

1. Reproduce or establish evidence of the failure.
2. Identify the root cause.
3. Implement the minimal complete fix.
4. Add or update regression coverage when practical.
5. Verify both the corrected behaviour and relevant surrounding behaviour.

Proceed autonomously unless the fix requires a product decision, destructive action, sensitive access, or meaningful scope expansion.

## 7. Verification

Do not claim completion without proportionate evidence.

Depending on the change, verification may include:

- focused tests for changed behaviour;
- broader test, lint, type-check, or build commands;
- comparison of behaviour before and after the change;
- inspection of logs or generated output;
- review of the final diff for unintended changes.

If full verification is unavailable, run the strongest feasible checks and clearly disclose what remains unverified.

## 8. Corrections and Lessons

When user feedback reveals a reusable mistake pattern:

- record one concise, actionable lesson in the project’s designated lessons file;
- explain how to prevent recurrence;
- merge it with existing guidance rather than adding duplicates.

Do not record one-off preference changes or project-specific facts as general lessons.

## 9. Completion

Before reporting completion:

- review the diff for scope and clarity;
- confirm the requested behaviour is implemented;
- confirm relevant checks passed;
- remove temporary debugging code and artifacts;
- summarize what changed, how it was verified, and any remaining limitations.