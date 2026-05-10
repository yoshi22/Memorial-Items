# 2026-05-10 12:00 — 問い合わせメールアドレス更新

## Summary
問い合わせ先メールアドレスをダミー値から実際のサービス用アドレスに差し替えた。

## Background
`contactEmail` が `contact@memorial-items.example` というプレースホルダーのままになっており、顧客からのお問い合わせが届かない状態だった。

## Changes
- `lib/public-business.ts` — `contactEmail` を `contact@memorial-items.example` から `yoshi.mario.developer@gmail.com` に変更

## Decisions
- ユーザー指定のアドレス `yoshi.mario.developer@gmail.com` をそのまま設定。
- フッター・お問い合わせページ・FAQページはすべて `businessInfo.contactEmail` を参照しているため、1箇所の変更で全画面に反映される。

## Validation
- `lib/public-business.ts` の該当行を目視確認。
- フッター・contact・faqページが `businessInfo.contactEmail` を参照していることをgrepで確認済み。

## Open Issues
- なし

## Next Steps
- Vercelへデプロイして本番環境に反映する。
