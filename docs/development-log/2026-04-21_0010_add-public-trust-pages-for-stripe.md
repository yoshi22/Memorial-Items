# 2026-04-21 00:10 Add public trust pages for Stripe

## Summary
- Stripe の website verification 対応として、公開面に contact と legal pages を追加
- LP、FAQ、注文完了導線を digital-first の current release に合わせて修正
- footer から問い合わせ先と各ポリシーページへ遷移できるようにした

## Why
- Stripe の private task に具体理由が出ていなくても、公開サイトに問い合わせ先、返金、納品、特商法、規約がない状態は審査停止要因になりやすい
- current release と異なる physical shipping 表現も解消が必要だった

## Files changed
- `lib/public-business.ts`
- `components/common/LegalPageShell.tsx`
- `app/contact/page.tsx`
- `app/legal/*`
- `components/common/Footer.tsx`
- `app/page.tsx`
- `app/faq/page.tsx`
- `app/order/page.tsx`
- `app/order/submitted/[token]/page.tsx`
- `docs/runbooks/stripe_website_recheck.md`
- `docs/test/stripe_website_verification_checklist.md`

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Follow-up
- placeholder の事業者情報、住所、問い合わせメールを実値に差し替える
- Vercel production に再デプロイして Stripe 再審査へ進む
