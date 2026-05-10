# 2026-05-03 03:15 — MFA 登録 QR コードが表示されない問題を修正

## Summary
`AdminMfaEnroll` で QR コードを `data:image/svg+xml;utf-8,` 形式の data URL として `<img>` に渡していたが、この形式は Chrome でサポートされていないため QR コードが表示されなかった。SVG を inline HTML として直接描画する方式に変更した。

## Background
MFA 登録ページ（`/admin/security/enroll-mfa`）で secret は表示されているが QR コードが表示されないとユーザーから報告。`data:image/svg+xml;utf-8,${encodeURIComponent(svg)}` は Firefox では動作するが Chrome では `<img>` が broken image になる既知の互換性問題。

## Changes
- `components/admin/security/AdminMfaEnroll.tsx`
  - `setQrCode()` に渡す値を raw SVG 文字列に変更（data URL エンコード廃止）
  - `<img src={qrCode}>` を `<div dangerouslySetInnerHTML={{ __html: qrCode }}>` に変更
  - `[&>svg]:h-full [&>svg]:w-full` で SVG サイズを親 div に合わせる

## Decisions
- `dangerouslySetInnerHTML` は SVG が Supabase 生成（信頼できるソース）でありかつ admin 認証済みページのみなので許容
- data URL の base64 化も選択肢だったが、inline SVG の方が確実でシンプル

## Validation
- `npm run typecheck`: エラーなし

## Open Issues
- なし

## Next Steps
- `npx vercel --prod` でデプロイ
- MFA 登録ページで QR コードが表示されることを確認
