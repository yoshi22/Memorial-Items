# 2026-04-19 00:00 — Fix file upload UX, silent failures, and broken admin actions

## Summary
ファイルアップロード全体のサイズ制限を業界基準と照合し妥当と判断した上で、サイズ超過・サーバーエラー時のサイレント失敗を排除した。合わせて管理画面の機能不全（バケット名不整合・actions.ts 欠損）を修正し、error.tsx / not-found.tsx を追加した。

## Background
80MB ボディ制限追加（2026-04-18）の後続作業。Explore agent の網羅調査で以下が判明:
1. `uploadPrintMaster` が存在しないバケット `art-assets` へ書き込もうとして常に失敗
2. FAQ / 作例管理の `actions.ts` が未作成でページ起動時に Module not found
3. `OrderForm` / `ProofUploader` / `PrintMasterUploader` が Server Action の例外を catch せずサイレント停止
4. 注文時の写真アップロード失敗が握りつぶされ 0 件画像で受付完了画面に遷移
5. `app/error.tsx` / `app/not-found.tsx` が未作成で英語デフォルト画面が露出

## Changes
- `app/admin/orders/[id]/actions.ts` — `uploadPrintMaster` のバケット名 `'art-assets'` → `'print-masters'`
- `app/admin/(protected)/content/faq/actions.ts` — 新規作成: `upsertFaq` / `deleteFaq` / `toggleFaqPublished`
- `app/admin/(protected)/content/examples/actions.ts` — 新規作成: `upsertExample` / `deleteExample` / `toggleExamplePublished`（`examples` public bucket への画像アップロード含む）
- `lib/storage.ts` — `validateProofImage`（50MB/JPEG・PNG・WebP）を追加
- `components/order/OrderForm.tsx` — `startTransition` 内の `await submitOrder` を try/catch で包み、例外時にエラーメッセージ表示
- `components/order/PhotoUploader.tsx` — 合計サイズ（75MB上限）の表示・超過チェック追加、個別ファイルサイズ表示を KB→MB に変更
- `components/admin/ProofUploader.tsx` — ファイル選択時クライアントバリデーション（`validateProofImage`）追加、try/catch でサーバー例外をキャッチ、accept を JPEG/PNG/WebP に限定
- `components/admin/PrintMasterUploader.tsx` — 同上
- `app/order/actions.ts` — 写真アップロード成功数を集計し、3枚未満なら注文レコードを削除してエラーを返す
- `app/p/[token]/actions.ts` — `approveProof` / `requestRevision` 全体を try/catch で包み、DB例外を `{error}` に正規化
- `app/admin/login/page.tsx` — `error=no_code` に対応するエラーメッセージを追加
- `app/auth/signout/route.ts` — `process.env['APP_BASE_URL']` を `env.appBaseUrl` に統一
- `app/error.tsx` — 新規作成: RSC エラー時の日本語エラー画面（reset ボタン付き）
- `app/not-found.tsx` — 新規作成: 日本語 404 画面
- `docs/09_screen_transitions.md` — 注文エラー経路と 404 遷移を追記

## Decisions
- 顧客写真の 15MB/枚・合計 75MB は業界基準（スマホ写真 2〜15MB、大手 EC は 50〜100MB）と照合し妥当と判断、値は変更しない
- Proof / Print Master は 50MB/枚を上限とした（印刷向け高解像度 PNG を想定）
- `submitOrder` の try/catch は `redirect()` が Next.js ランタイムレベルで処理されるため、NEXT_REDIRECT の再スローは不要
- 写真アップロード部分失敗（3枚以上成功）は通過を許容し、全枚失敗 or 成功<3 のみロールバック

## Validation
- `npx tsc --noEmit` → エラーなし
- `npm run lint` → エラーなし
- 開発サーバーで各ページが起動することを確認する（手動）
- `/admin/content/faq` と `/admin/content/examples` で CRUD 操作を確認する（手動）
- `/admin/orders/[id]` で Print Master アップロードが `print-masters` バケットに入ることを確認する（手動）

## Open Issues
- Supabase bucket の `file_size_limit` は migration で設定していない（Supabase プロジェクト側のデフォルトに依存）。本番で問題が出た場合はマイグレーションで設定する
- ExamplesManager の `image_url` 更新後に既存の古い画像が Storage 上に残る（孤立オブジェクト）。運用規模が小さいうちは許容

## Next Steps
- 開発サーバーで一通り手動確認
- RESEND_API_KEY を設定してメール通知を有効化
