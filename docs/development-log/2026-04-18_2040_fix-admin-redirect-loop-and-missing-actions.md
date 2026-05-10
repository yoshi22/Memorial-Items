# 2026-04-18 20:40 — Fix admin redirect loop and missing order actions

## Summary
管理画面ログインページが無限リダイレクトするバグを修正し、注文詳細の Server Action ファイルが欠損していた問題を解消した。併せて `ADMIN_EMAILS` のプレースホルダーを実際のメールアドレスに更新した。

## Background
Puppeteer で全フローを E2E テストしたところ 3 つの問題が発覚した。(1) `/admin/login` が admin レイアウト内にあるため未認証時に無限リダイレクトが発生。(2) `components/admin/` 各コンポーネントが `@/app/admin/orders/[id]/actions` を import しているが該当ファイルが存在しなかった。(3) `uploadProof` が設定するステータスが `proof_sent` で、顧客 Proof 確認画面が期待する `proof_uploaded` と不一致だった。

## Changes
- `app/admin/layout.tsx` → 削除
- `app/admin/page.tsx` → 削除
- `app/admin/orders/` (旧) → 削除
- `app/admin/content/` (旧) → 削除
- `app/admin/(protected)/layout.tsx` — 認証が必要なルートのみラップする新レイアウト
- `app/admin/(protected)/page.tsx` — ダッシュボード
- `app/admin/(protected)/orders/page.tsx` — 注文一覧
- `app/admin/(protected)/orders/[id]/page.tsx` — 注文詳細
- `app/admin/(protected)/content/faq/` — FAQ 管理
- `app/admin/(protected)/content/examples/` — 作例管理
- `app/admin/orders/[id]/actions.ts` — **新規作成**: updateStatus / updatePayment / updateTracking / addAdminNote / uploadProof / uploadPrintMaster
- `app/admin/orders/[id]/actions.ts` — `proof_sent` → `proof_uploaded` に修正
- `.env.local` — `ADMIN_EMAILS` を実際のアドレスに更新

## Decisions
- ルートグループ `(protected)` でログインページをレイアウト外に置く方式を採用。middleware によるガードも選択肢だったが変更量が少ないこちらを優先した。
- `app/admin/orders/[id]/actions.ts` はルートグループ外に配置し、既存 import パスを変更せずに済むようにした。

## Validation
Puppeteer で以下を確認:
- LP / 作例 / FAQ ページ — 正常表示
- 注文フォームバリデーション — 空送信でエラー表示
- 注文フォーム正常送信 → `/order/submitted/[token]` にリダイレクト
- `/o/[token]` 顧客注文詳細 — 正常表示・写真表示
- `/admin/login` — ループなし正常表示
- 未認証で `/admin` → `/admin/login` にリダイレクト
- 管理画面ログイン → 注文一覧・注文詳細正常表示
- `/p/[token]` 修正依頼送信 — 成功
- `/p/[token]` 承認 — 成功・修正依頼履歴表示

## Open Issues
- Puppeteer の `setInputFiles` 相当ツールがないため、管理画面からの Proof 実アップロードは UI テスト不可（DB 直接挿入で代替）
- メール通知は `RESEND_API_KEY` 未設定のため no-op（コンソールログ出力のみ）

## Next Steps
- `RESEND_API_KEY` を設定してメール通知を有効化
- 実際のペット写真で Proof アップロードを手動テスト
