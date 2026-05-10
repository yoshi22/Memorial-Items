# 2026-04-19 09:00 — design refresh: Bone/Brass palette & typography

## Summary
Applied the "Quiet Keepsake" brand design from a Claude Design handoff bundle. Visual refresh only — logic, server actions, and routing are unchanged. Introduces warm Bone/Brass palette, Cormorant Garamond + Noto Sans JP typography, and a redesigned LP with richer sections.

## Background
User iterated a full-fidelity prototype in Claude Design (handoff bundle at `https://api.anthropic.com/v1/design/h/xjfGujlAXIz4bz0updFdhA`). The existing codebase used a monochrome gray palette with no brand character. The design brief (`docs/design-brief.md`) defined the visual direction and listed the files to update.

## Changes
- `app/globals.css` — replaced 11-line stub with Tailwind v4 `@theme` color tokens (Bone/Brass palette) and font-family variables; body reset with antialiasing and `font-feature-settings: "palt"`
- `app/layout.tsx` — added `next/font/google` for Cormorant Garamond, Noto Sans JP, Noto Serif JP; exposed as CSS variables on `<html>`
- `components/common/Nav.tsx` — sticky translucent header, brand mark + serif wordmark, brass-accent CTA pill
- `components/common/Footer.tsx` — palette swap to `bg-surface border-line text-ink-mute`
- `app/page.tsx` — rebuilt LP: center hero with layered framed-photo visual, numbered steps cards, styles cards, "Our Promise" trust section (inline SVG icons), examples section reskin, dark final CTA with brass button
- `components/proof/ProofReviewActions.tsx` — approve button raised to brass-accent dominant; reassurance banner added; approved/message states use accent-soft palette instead of green
- `components/order/OrderForm.tsx` — form grouped into three card sections (お客様情報 / 作品の仕様 / ペットのお写真) with serif section headings; all field copy/validation/logic unchanged

## Decisions
- Tailwind v4 `@theme` used for color tokens (generates semantic utilities: `bg-accent`, `text-ink-soft`, `border-line`, etc.). Font-family overridden in `@layer base :root {}` to pick up `next/font` runtime variables while keeping `@theme` static fallbacks.
- `!bg-accent !text-white` Tailwind v4 `!important` modifiers used on the approve button to reliably override cva defaults from shadcn Button without touching `components/ui/button.tsx`.
- `tailwind.config.ts` left as-is (dead code under v4, no `@config` reference in globals.css).
- No new copy invented beyond "Our Promise" section titles, which are lifted verbatim from `proto-lp.jsx` in the design bundle.

## Validation
- `npx tsc --noEmit` passes with zero errors.
- All preserved copy strings verified (CTA labels, form field labels, error messages, proof action labels) — unchanged from original.
- No changes to `lib/`, `components/ui/`, `app/**/actions.ts`, or admin routes.

## Open Issues
- Style thumbnail images in the Styles section use a striped placeholder div. Real style example images should be added to Supabase `content_examples` or a dedicated storage bucket and wired in to replace the placeholders.
- `docs/design-brief.md` mentions `components/ui/select.tsx` uses `border-input` and `bg-background` tokens — these are not in the new palette, so Select dropdowns may retain the old neutral look. Can be addressed when shadcn primitives are reskinned.

## Next Steps
- Replace Styles section placeholder divs with real artwork thumbnails once assets are available.
- Consider applying the Bone/Brass palette to `app/o/[token]/page.tsx` (customer order view) and `app/p/[token]/page.tsx` (proof page) for full visual consistency — those pages inherit palette via body but have hardcoded `border-gray-*` / `bg-gray-*` classes.
