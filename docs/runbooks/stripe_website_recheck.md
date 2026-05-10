# stripe_website_recheck.md

> **Phase 3 用**。Stripe website verification が再開するまで使用しない。Phase 1/2 では本ドキュメントは参照不要。

## Purpose
Stripe の website verification が停止したときに、公開サイトで確認する項目を整理する。

## Public URLs to verify
- `https://memorial-items.vercel.app/`
- `https://memorial-items.vercel.app/order`
- `https://memorial-items.vercel.app/faq`
- `https://memorial-items.vercel.app/contact`
- `https://memorial-items.vercel.app/legal/commerce`
- `https://memorial-items.vercel.app/legal/privacy`
- `https://memorial-items.vercel.app/legal/terms`
- `https://memorial-items.vercel.app/legal/refund-policy`
- `https://memorial-items.vercel.app/legal/delivery`

## Checklist
1. サービス名が公開サイト上で確認できる
2. 何を販売しているかがトップページと注文ページで分かる
3. 問い合わせ先メールアドレスが公開されている
4. 返金・キャンセル方針が公開されている
5. 納品または配送ポリシーが公開されている
6. 特商法表記がある
7. 利用規約とプライバシーポリシーがある
8. フッターから各ページへ到達できる
9. 公開サイトの説明と Stripe account profile の説明に矛盾がない

## After updating the site
1. Vercel Production を再デプロイする
2. 各 URL が公開で読み込めることを確認する
3. Stripe Dashboard の website URL を再確認する
4. Stripe の account status が再審査に入るかを確認する

## Notes
- digital-first の current release と矛盾しないように公開コピーを維持する
