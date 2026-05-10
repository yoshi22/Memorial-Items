# testing.md

## Goal
売上と運用に直結する導線を壊さない。

## Priority test areas
1. 注文フォーム validation
2. 画像アップロード処理
3. order status transitions
4. proof upload / view / approve / revision request
5. token-based access control
6. admin auth guard

## Rules
- snapshot test 乱用禁止
- flaky test を残さない
- 単なる見た目より導線を優先
- integration test を重視
- critical path の E2E は最小限でよいが必須

## Do not
- スコープ外機能のテストを書かない
- 実際に使わない抽象レイヤのテストを書かない
