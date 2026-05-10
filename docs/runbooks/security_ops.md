# security_ops.md

## Purpose
実運用に向けて、管理画面・ログイン・アップロード・脆弱性対応の運用手順を定義する。

## Admin login controls
- `/admin` は Basic 認証で保護する
- 管理者は `ADMIN_EMAILS` に登録されたメールアドレスのみ許可する
- 管理者は magic link 後に TOTP MFA を完了しないと protected admin pages に入れない
- 失敗回数が 10 回に達したアカウントは 30 分ロックする
- ログイン成功時と MFA 登録時はセキュリティ通知メールを送る

## Required production env
- `ADMIN_BASIC_AUTH_USERNAME`
- `ADMIN_BASIC_AUTH_PASSWORD`
- `ADMIN_EMAILS`
- `SECURITY_ALERT_EMAILS`
- `ADMIN_LOCKOUT_THRESHOLD`
- `ADMIN_LOCKOUT_MINUTES`
- `ADMIN_MAGIC_LINK_MAX_REQUESTS`
- `ADMIN_MAGIC_LINK_WINDOW_MINUTES`

## Monthly checks
1. `npm audit` を実行して依存関係の重大脆弱性を確認する
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. Vercel production env に不要な管理者メールアドレスが残っていないか確認する
6. Security alert recipients が現行運用者に一致しているか確認する

## Quarterly checks
1. `/admin` が Basic 認証を要求することを確認する
2. 新規管理者メールで magic link + MFA 登録が機能することを確認する
3. TOTP を 10 回誤入力し、ロックアウトが発生することを確認する
4. 顧客アップロード画像、proof、print master が public bucket で公開されていないことを確認する
5. 許可外 MIME のファイルがアップロード拒否されることを確認する
6. 公開ページの security headers を確認する

## Antivirus policy
- 管理端末は OS 標準のマルウェア対策を有効にする
- 自動アップデートを有効にする
- 少なくとも月 1 回はフルスキャンを実行する
- 顧客から受領した画像を管理端末で開く前に、ローカル AV 対象の保存領域に置く

## Incident response
1. 不審な管理者ログイン通知を受けたら `ADMIN_BASIC_AUTH_PASSWORD` をローテーションする
2. `ADMIN_EMAILS` から該当メールを一時的に外す
3. Supabase Auth で該当セッションを失効させる
4. 開発ログに発生日、影響、対処内容を残す
