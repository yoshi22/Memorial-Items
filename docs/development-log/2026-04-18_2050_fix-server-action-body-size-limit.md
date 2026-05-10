# 2026-04-18 20:50 — Fix Server Action body size limit for photo upload

## Summary
注文フォームで写真を添付して送信すると 413 エラーが発生していた。Next.js の Server Actions はデフォルト 1MB のボディサイズ制限があるため、`next.config.ts` で上限を拡張した。

## Background
顧客は 3〜5 枚、各 15MB 以内の写真を送信できる仕様。最大 75MB を超えるケースがあり、デフォルト 1MB 制限に抵触する。

## Changes
- `next.config.ts` — `experimental.serverActions.bodySizeLimit` を `'80mb'` に設定

## Decisions
5枚×15MB = 75MB が上限なので 80MB に設定した。将来的にファイルサイズ上限を緩和する場合は本値も合わせて更新すること。

## Validation
サーバー再起動後、実際の写真ファイルを添付した注文送信で 413 エラーが出ないことを確認する。

## Open Issues
なし
