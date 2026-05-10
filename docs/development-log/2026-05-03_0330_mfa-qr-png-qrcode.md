# 2026-05-03 03:30 — MFA QR コードを PNG 生成方式に変更

## Summary
Supabase が返す SVG QR コードはスキャナーアプリで読み取れないケースがあるため、`data.totp.uri`（otpauth:// URI）から `qrcode` ライブラリで PNG QR コードを生成する方式に変更した。

## Background
inline SVG 表示は成功したが Authenticator アプリで読み取れないとユーザーから報告。SVG ベースの QR コードは一部の Authenticator アプリの QR スキャナーに対応していない既知の問題。PNG に変更することで確実に読み取れるようになる。

## Changes
- `package.json` — `qrcode` / `@types/qrcode` を追加
- `components/admin/security/AdminMfaEnroll.tsx`
  - `setQrCode` で Supabase の SVG の代わりに `QRCode.toDataURL(data.totp.uri)` で PNG data URL を生成
  - `qrcode` を dynamic import して初回のみロード
  - `<img src={qrCode}>` で表示（PNG data URL）

## Decisions
- `data.totp.uri`（otpauth://）から QR を生成するのが Authenticator アプリとの互換性が最も高い
- dynamic import で code splitting し、MFA 登録ページ以外への影響を避ける

## Validation
- `npm run typecheck`: エラーなし

## Open Issues
- なし

## Next Steps
- `npx vercel --prod` でデプロイ
- Authenticator アプリで QR コードを読み取れることを確認
