---
description: Generate an implementation plan from a PRD with interactive user confirmation and save to docs/planning/implementation-plan.md
---

# Generate Implementation Plan Workflow

Inputs:
- prd_path (optional): Absolute or repo-relative path to the PRD markdown file. If not provided, the workflow will search the repository for likely PRD files first and then ask you to confirm.

Outputs:
- docs/planning/implementation-plan.md (created/overwritten on approval)

## Policy and Conventions
- Always ask for clarification when uncertain. See Uncertainty Handling.
- Tag exactly one item with [CURRENT-TASK] at any time.
- Default estimates to 3 days when not provided, mark as (default).
- Auto-renumber tasks/subtasks to avoid duplicates when regenerating.
- Follow the user's Testing/CI and planning rules stored in memories.

## Uncertainty Handling
1. If unsure about interpretation or next action, prompt the user:
   "I'm unsure how to proceed with <describe ambiguous part>. Would you like me to clarify or search for best practices?"
2. On approval, run a web search and summarize findings.
3. Confirm the recommended approach with the user before continuing.

## Steps

### 1) Locate, load, and parse the PRD
- Automatically search the repository for likely PRD candidates before prompting the user.
  - Filename heuristics: `prd.md`, `PRD.md`, `product-requirements*.md`, `product_requirements*.md`, `requirements*.md`, `spec*.md`, under `docs/`, `product/`, `specs/`, `requirements/`.
  - Content heuristics: Markdown files containing headings/keywords like "Product Requirements", "PRD", "Scope", "Features", "Acceptance Criteria".
- Present found candidates (with paths and first heading) and ask the user to confirm the correct PRD. If multiple, let the user choose. If none found, prompt the user to provide the `prd_path` or confirm proceeding without a PRD.
- Read file contents from the confirmed `prd_path`.
- If unreadable: report `Error: Cannot load PRD at {{ prd_path }}` and stop.

### 2) Clarify Technology Stacks
- Detect languages/frameworks/tools mentioned in PRD (back-end, front-end, infra, data/ML, mobile, embedded, etc.).
- Summarize detected stacks to the user and ask to confirm or edit the list.
- Wait for user response. Do not proceed until confirmed.

### 3) Propose Project Structure
- For each confirmed stack, draft a directory layout:
```
<project-root>/
├─ src/<stack-name>/
│  ├─ controllers/   # or equivalent
│  ├─ models/        # or equivalent
│  └─ <entrypoint>   # e.g., index.ts, main.cpp
├─ tests/<stack-name>/
└─ docs/
```
- Present combined multi-stack structure for approval.
- If changes are requested, update and re-present until approved.

### 4) Clarify Feature-to-Stack Mapping
- Extract each feature/deliverable from PRD.
- Ask: "Which stack(s) apply to each feature? Provide mappings like `Feature A: node-ts, python-flask`."
- Wait for approval/mappings before continuing.

### 5) Current Task Tagging and Task Generation
- Explain tagging rule first:
  "Current Task Tagging: Tag the task/subtask you are actively working on with [CURRENT-TASK]. Always move this tag to the next active item once the current one is complete."
- For each mapped feature, generate tasks using:
```
#<task_num>: <feature_summary> [ ] (est: <days> days) [CURRENT-TASK]  # only the first top-level task gets this tag
  #<task_num>.<subtask_num>: <implementation_step> [ ] (est: <days> days)
```
- If no estimate, use 3 days (default) and mark as `(default)`.
- Ensure there is only one [CURRENT-TASK] tag across the entire list.
- Auto-renumber tasks/subtasks if duplicates arise and notify the user in the review step.
- Append this note verbatim at the end:
  "Note: Remember to update this plan after each completed task or subtask by:
   1. Checking off [ ] to [x].
   2. Removing [CURRENT-TASK] from the completed item.
   3. Adding [CURRENT-TASK] to the next active task or subtask."

### 6) Review, Save, Commit & Iterate
- Display the full plan for user review.
- If edits are requested, accept inline modifications and regenerate consistently.
- On approval:
  - Create folder docs/planning/ if missing.
  - Write the plan to docs/planning/implementation-plan.md exactly as displayed.
  - If a VCS is configured and remote available, commit and push.

## Operational Checklist (for the agent)

- Search the repo for PRD candidates first; show results and request confirmation.
- Confirm prd_path exists and is readable.
- Extract stacks and features carefully; show citations from PRD where helpful.
- Keep interactions concise; use bullet points.
- Maintain a single source-of-truth plan in docs/planning/implementation-plan.md.
- Respect repo coding guidelines and mandatory testing/CI policies when turning tasks into code.

## Implementation Hints
- Use repo file reading to load PRD; fallback to asking user for the path.
- Use semantic parsing to find Features/Requirements, Non-Functional Requirements, Milestones, and Constraints; show what you detected for confirmation.
- For multi-stack repos, keep structure modular and avoid duplication; prefer centralized services where possible.
- When generating tasks, ensure each subtask has one clear purpose and avoid overlapping responsibilities.

## Ready-to-run Actions

// turbo
0. Search repository for PRD candidates (non-destructive)
- Command: |
    rg -n --hidden --glob "*.md" -e "^# .*Product Requirements|\bPRD\b|^# .*Scope|^# .*Features|Acceptance Criteria" . || true
    fd -H -p -a -t f -e md "^(?i)(prd|product[-_ ]requirements|requirements|spec).*" . || true

// turbo
1. Ensure output directory exists
- If approved to save: create directory if missing
  - Command: mkdir -p docs/planning

// turbo
2. Save the plan to file
- Command: tee docs/planning/implementation-plan.md > /dev/null <<'PLAN_EOF'
<rendered plan markdown goes here>
PLAN_EOF

// turbo
3. Commit and push (if git configured and desired)
- Command: |
    git add docs/planning/implementation-plan.md && \
    git commit -m "docs: add/update implementation plan generated from PRD" && \
    git push
