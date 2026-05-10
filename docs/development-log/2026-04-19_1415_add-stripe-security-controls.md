# 2026-04-19 14:15 Add Stripe security controls

## Summary
- `/admin` に Basic 認証、MFA 導線、ロックアウト、セキュリティ通知、監査ログを追加
- 管理画面ログインを `Basic auth + allowlisted email + magic link + TOTP` に強化
- 画像アップロード制限をサーバー側でも明示適用
- security headers と運用 runbook / acceptance checklist を追加

## Why
- Stripe 申請で求められる管理者ログイン保護、ロックアウト、脆弱性対策、運用 controls を説明可能な状態にするため

## Files changed
- `middleware.ts`
- `lib/admin-security.ts`
- `lib/auth.ts`
- `lib/email.ts`
- `app/admin/security/*`
- `app/admin/login/*`
- `app/auth/callback/route.ts`
- `supabase/migrations/202604191500_admin_security_controls.sql`
- `docs/runbooks/security_ops.md`
- `docs/test/security_acceptance_checklist.md`

## Validation
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `supabase migration repair --status reverted 20260419`
- `supabase db push --linked --yes`
- Vercel env 反映と再デプロイは別途必要
