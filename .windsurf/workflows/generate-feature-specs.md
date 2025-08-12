---
description: Generate feature specification files from the implementation plan's features into docs/features/<feature_number>-<feature_name>.md
---

# Generate Feature Specifications Workflow

Inputs:
- implementation_plan_path (optional): Path to the implementation plan. Default: `docs/planning/implementation-plan.md`.

Outputs:
- One file per feature at `docs/features/` named `<feature_number>-<feature_name-slug>.md`.

## Policy and Conventions
- Align features 1:1 with the implementation plan's feature sections.
- Filenames must be stable: `<number>-<slugified-name>.md` (lowercase, spaces -> '-', non-alnum removed).
- Never duplicate or drift: if a feature is renamed/renumbered in the plan, regenerate or rename accordingly.
- Ask for clarification when uncertain.

## Uncertainty Handling
1. If detection of features is ambiguous, prompt:
   "I'm unsure how to parse features from the plan (ambiguity: <describe>). Would you like me to clarify or search for best practices?"
2. On approval, optionally perform a quick search and summarize patterns.
3. Confirm the approach and proceed.

## Steps

### 1) Load Implementation Plan
- Determine `implementation_plan_path` (default `docs/planning/implementation-plan.md`).
- If file does not exist or unreadable: report `Error: Cannot load implementation plan at {{ implementation_plan_path }}` and stop.

### 2) Detect Features in Plan
- Parse the plan for feature sections using robust heuristics (support multiple formats):
  - H2 sections like: `## Feature <num>: <name>` or `## <num>: <name>` or `## #<num>: <name>`.
  - Task-style lines near a Features section: `#<num>: <name>`.
- Extract ordered list of `(number, name)` pairs.
- Present detected list to the user for confirmation/editing before proceeding.

### 3) Prepare Output Structure
- Ensure directory `docs/features/` exists.
- Compute target filenames: `<number>-<slug(name)>.md` (e.g., `1-user-authentication.md`).
- For existing files, ask whether to overwrite, skip, or append placeholder sections.

### 4) Generate Feature Spec Files
- For each confirmed feature, create a Markdown spec with the following structure:
```
# <number>. <name>

## Summary
Concise problem statement and the value this feature delivers.

## Goals
- 

## Non-Goals
- 

## Requirements
- Functional:
- Non-functional:

## Acceptance Criteria
- 

## Dependencies
- 

## Risks & Mitigations
- 

## Milestones
- M1: 
- M2: 

## Test Plan
- Unit:
- Integration:
- E2E:

## Open Questions
- 
```
- Optionally include a reference to the relevant section in `implementation-plan.md`.

### 5) Review, Save, Commit & Iterate
- Display generated filenames and a short preview of each spec's header for review.
- If edits requested, update and regenerate.
- On approval:
  - Save files to `docs/features/`.
  - If VCS is configured, commit and push.

## Operational Checklist (for the agent)
- Confirm `implementation_plan_path` exists and is readable.
- Detect features with multiple patterns; show results and wait for user confirmation.
- Keep filenames deterministic; ensure no duplicates.
- Keep interactions concise.

## Ready-to-run Actions

// turbo
0. Validate implementation plan exists
- Command: test -f "${PLAN:=docs/planning/implementation-plan.md}" || { echo "Error: Cannot load implementation plan at ${PLAN}"; exit 1; }

// turbo
1. Ensure output directory exists
- Command: mkdir -p docs/features

// turbo
2. Dry-run parse and list detected features (Python, non-destructive)
- Command: |
    python3 - <<'PY'
    import os, re, sys, json
    PLAN = os.environ.get('PLAN','docs/planning/implementation-plan.md')
    try:
        text = open(PLAN, 'r', encoding='utf-8').read()
    except Exception as e:
        print(f"Error: Cannot load implementation plan at {PLAN}: {e}")
        sys.exit(1)

    # Patterns: H2 headings and task lines
    h2_pat = re.compile(r'^##\s*(?:Feature\s*)?(?:#)?(\d+)\s*[:\-]\s*(.+)$', re.IGNORECASE | re.MULTILINE)
    task_pat = re.compile(r'^#(\d+)\s*:\s*(.+)$', re.MULTILINE)

    feats = []
    seen = set()

    for m in h2_pat.finditer(text):
        num, name = m.group(1), m.group(2).strip()
        key = (int(num), name)
        if key not in seen:
            feats.append((int(num), name))
            seen.add(key)

    if not feats:
        for m in task_pat.finditer(text):
            num, name = m.group(1), m.group(2).strip()
            key = (int(num), name)
            if key not in seen:
                feats.append((int(num), name))
                seen.add(key)

    feats.sort(key=lambda x: x[0])

    print("Detected features:")
    for n, name in feats:
        print(f"- #{n}: {name}")

    if not feats:
        print("No features detected. Please adjust the plan format or provide guidance.")
    PY

// turbo
3. Generate feature spec files (set WRITE=1 to actually write)
- Command: |
    python3 - <<'PY'
    import os, re, sys, pathlib
    PLAN = os.environ.get('PLAN','docs/planning/implementation-plan.md')
    WRITE = os.environ.get('WRITE','0') == '1'
    OUTDIR = pathlib.Path('docs/features')
    OUTDIR.mkdir(parents=True, exist_ok=True)

    def slugify(s: str) -> str:
        s = s.strip().lower()
        s = re.sub(r'[^a-z0-9\s\-]', '', s)
        s = re.sub(r'\s+', '-', s)
        s = re.sub(r'-+', '-', s)
        return s.strip('-')

    try:
        text = open(PLAN, 'r', encoding='utf-8').read()
    except Exception as e:
        print(f"Error: Cannot load implementation plan at {PLAN}: {e}")
        sys.exit(1)

    h2_pat = re.compile(r'^##\s*(?:Feature\s*)?(?:#)?(\d+)\s*[:\-]\s*(.+)$', re.IGNORECASE | re.MULTILINE)
    task_pat = re.compile(r'^#(\d+)\s*:\s*(.+)$', re.MULTILINE)

    feats = []
    seen = set()

    for m in h2_pat.finditer(text):
        num, name = m.group(1), m.group(2).strip()
        key = (int(num), name)
        if key not in seen:
            feats.append((int(num), name))
            seen.add(key)

    if not feats:
        for m in task_pat.finditer(text):
            num, name = m.group(1), m.group(2).strip()
            key = (int(num), name)
            if key not in seen:
                feats.append((int(num), name))
                seen.add(key)

    if not feats:
        print("No features detected. Nothing to generate.")
        sys.exit(0)

    feats.sort(key=lambda x: x[0])

    TEMPLATE = """# {num}. {name}

## Summary
Concise problem statement and the value this feature delivers.

## Goals
- 

## Non-Goals
- 

## Requirements
- Functional:
- Non-functional:

## Acceptance Criteria
- 

## Dependencies
- 

## Risks & Mitigations
- 

## Milestones
- M1: 
- M2: 

## Test Plan
- Unit:
- Integration:
- E2E:

## Open Questions
- 
"""

    for num, name in feats:
        fname = f"{num}-{slugify(name)}.md"
        path = OUTDIR / fname
        if path.exists() and not WRITE:
            print(f"[dry-run] would overwrite: {path}")
            continue
        if not WRITE:
            print(f"[dry-run] would write: {path}")
            continue
        content = TEMPLATE.format(num=num, name=name)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"wrote: {path}")
    PY

// turbo
4. Commit and push (if git configured and desired)
- Command: |
    git add docs/features/*.md && \
    git commit -m "docs: add feature specs generated from implementation plan" && \
    git push
