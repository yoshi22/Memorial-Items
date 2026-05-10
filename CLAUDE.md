# CLAUDE.md

## Project overview
This repository is a pre-PMF MVP for a pet custom framed-art service.
Customers upload pet photos, choose a style/size/frame, review a proof, request revisions or approve it, and receive a framed physical product.

This project does **not** aim to build a general-purpose AI image generation platform.
This project exists to validate whether customers will pay for:
1. strong likeness ("it really feels like my pet"),
2. a trustworthy proof-and-revision process,
3. a ready-to-display physical output.

## Core principles
- Keep the product **manual-first**.
- Optimize for **operational reliability**, not architectural elegance.
- Prefer **simple implementations** over future-proof abstractions.
- If a choice is unclear, reduce scope instead of increasing flexibility.
- The repository should support:
  - order intake,
  - proof management,
  - revision tracking,
  - print-master storage,
  - admin operations.

## Hard constraints
- This is **pre-PMF**, not a scale-ready platform.
- Do not introduce abstractions for multi-product, multi-tenant, marketplace, or B2B2C use cases.
- Do not build a customer-facing real-time image generation feature.
- Do not build an internal AI generation pipeline inside the app.
- External art production tools are allowed and expected.
- `docs/specs/current_release.md` must describe **MVP scope only**.
- Do not add "future roadmap" content into MVP specs.
- Manual admin steps are acceptable if they reduce engineering complexity.

## Product boundaries
### Included
- Marketing pages
- Order form
- Photo upload
- Admin order management
- Proof upload/review/approval
- Revision requests
- Print-master upload/storage
- Shipping status updates
- Basic content management for FAQ/examples

### Excluded
- Mobile apps
- Customer self-editing tools
- Real-time AI art generation
- Unlimited product variations
- Fully automated payment/refund orchestration
- Review/recommendation/social features
- Loyalty programs, coupons, referrals
- Complex warehouse/inventory automation

## Engineering principles
- Use Next.js App Router and TypeScript.
- Use Supabase for auth, database, and storage.
- Keep business rules explicit.
- Use enum-like status values for order lifecycle.
- Keep page responsibilities narrow and obvious.
- Store proof assets and print-master assets separately.
- Treat uploaded customer photos and print masters as sensitive assets.

## Required docs discipline
Before implementing any feature:
1. Read `docs/specs/current_release.md`
2. Read related docs in `docs/`
3. Confirm the feature is inside MVP scope
4. If the feature expands scope, do not implement it without first updating docs and explicitly recording the decision in `docs/05_decisions_log.md`

## Required code-change discipline
When changing code:
- Update the minimum necessary files only.
- If DB changes, add a migration.
- If user/admin flow changes, update docs.
- If analytics-relevant flow changes, update event mapping.
- If art workflow changes, update `docs/08_art_production.md` and/or `docs/runbooks/art_workflow.md`.
- If a screen/route/email-link changes, update `docs/09_screen_transitions.md`.

## Development log discipline
When code or config changes, update `docs/development-log/`:
- Create `YYYY-MM-DD_HHMM_<short-title>.md` using `docs/development-log/_template.md`
- Fill all 7 headings (Summary / Background / Changes / Decisions / Validation / Open Issues / Next Steps)
- Keep entries short, factual, and scannable
- Hooks will block task completion if code/config changed without a new/updated log
- To skip enforcement for a no-op session, delete `.claude/state/code_changes.json`

## Screen-transition doc discipline
When routes, navigation, or email links change, update `docs/09_screen_transitions.md`:
- Keep the mermaid flowchart in sync with actual transitions
- Update the route table and access levels
- Hooks will block task completion if route files changed without updating this doc
- To skip enforcement for a no-op session, delete `.claude/state/route_changes.json`

## Definition of done
A change is done only if:
- it is within MVP scope,
- code compiles,
- critical path tests pass,
- docs are updated where relevant,
- the implementation keeps the app simpler, not more abstract.

## Priority order when trade-offs happen
1. Customer trust
2. Operational clarity
3. Delivery speed
4. Code elegance
5. Future extensibility
