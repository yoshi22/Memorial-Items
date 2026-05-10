# analytics.md

## Goal
最小限のファネル把握だけを行う。

## Naming
- snake_case
- 過度に細かいイベントを増やさない

## Required events
- lp_viewed
- examples_viewed
- order_started
- photo_uploaded
- order_submitted
- proof_viewed
- revision_requested
- proof_approved
- payment_marked_paid
- order_shipped  ※ ENABLE_PHYSICAL_SHIPPING=true の場合のみ発火

## Event properties
- order_id
- style
- size
- frame
- acquisition_source

## Rules
- PII を送らない
- 備考欄の生テキストは送らない
- analytics 実装より導線改善を優先する
- dashboard 前提でイベント数を増やさない
