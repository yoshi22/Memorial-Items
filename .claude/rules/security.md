# security.md

## Goal
顧客画像・proof・print master を安全に扱う。

## Rules
- admin page は認証必須
- customer page は署名トークンまたは推測困難な public token
- raw uploads / proofs / print masters は public にしない
- upload 時に MIME/type/size を検証
- secrets を repo に書かない
- 詳細な内部エラーを顧客に出さない
- 個人情報は必要最小限のみ保存
- 支払い情報の生データは保存しない
- 管理者操作メモを残す

## Do not
- public bucket に print master を置かない
- 画像URLをそのまま露出しない
- "temporary" のつもりで緩いポリシーを本番に残さない
