# 13. Deployment and release checklist

## Summary
Define a concise checklist for promoting builds to production safely.

## Goals
- Ensure envs configured and secrets present.
- Verify smoke tests pass post-deploy.

## Non-Goals
- Full GitOps pipeline.

## Requirements
- Functional:
  - Checklist in docs; link from README.
  - Tagging and changelog notes practice.
- Non-functional:
  - Reproducible releases; roll-back path documented.

## Acceptance Criteria
- A release can be performed by following the checklist without gaps.

## Dependencies
- CI artifacts and environment configs.

## Risks & Mitigations
- Missed steps → keep checklist short and mandatory.

## Milestones
- M1: Checklist written.
- M2: Iterated after first deploy.

## Test Plan
- Unit: n/a.
- Integration: dry-run deploy script if added.
- E2E: post-deploy smoke (manual/automated).

## Open Questions
- What target hosting for frontend (e.g., Vercel) and deploy trigger?
