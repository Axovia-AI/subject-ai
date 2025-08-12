# 10. Privacy and data handling notice

## Summary
Communicate how user data is handled and provide a static privacy policy page in the app.

## Goals
- Add privacy link in footer and onboarding.
- Keep logs and analytics free of PII.

## Non-Goals
- Legal review beyond MVP template.

## Requirements
- Functional:
  - Static page in frontend with privacy policy text.
  - Link from footer and relevant dialogs.
- Non-functional:
  - Redaction helper in logging (planned observability).

## Acceptance Criteria
- Privacy policy page accessible and visible.
- No PII appears in logs or error messages.

## Dependencies
- Observability/logging utilities.

## Risks & Mitigations
- Incomplete policy → mark as MVP and iterate with counsel later.

## Milestones
- M1: Page and links.
- M2: Log redaction hooks.

## Test Plan
- Unit: link presence, route rendering.
- Integration: redaction utility unit tests.
- E2E: navigate to privacy page.

## Open Questions
- Any regional compliance requirements to note (GDPR/CCPA)?
