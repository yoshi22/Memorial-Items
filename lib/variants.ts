export const STYLES = [
  { id: 'clean_illustration', label: 'クリーンイラスト', description: 'すっきりとした線画風、明るい色使い' },
  { id: 'soft_watercolor', label: 'やわらか水彩', description: 'ふんわりした水彩タッチ、温かみのある仕上がり' },
  { id: 'modern_portrait', label: 'モダンポートレート', description: 'モダンでスタイリッシュ、落ち着いた色調' },
] as const

export const SIZES = [
  { id: 'S', label: 'S（A4相当）', description: '約210×297mm' },
  { id: 'M', label: 'M（A3相当）', description: '約297×420mm' },
  { id: 'L', label: 'L（A2相当）', description: '約420×594mm' },
] as const

export const FRAMES = [
  { id: 'natural_wood', label: 'ナチュラルウッド', description: '明るい木目調の額縁' },
  { id: 'black', label: 'ブラック', description: 'シックな黒フレーム' },
  { id: 'white', label: 'ホワイト', description: '清潔感のある白フレーム' },
] as const

export type StyleId = (typeof STYLES)[number]['id']
export type SizeId = (typeof SIZES)[number]['id']
export type FrameId = (typeof FRAMES)[number]['id']
export type PaymentMethodId = 'unknown' | 'bank_transfer' | 'credit_card' | 'paypay_qr'

export function getStyleLabel(id: string) {
  return STYLES.find((s) => s.id === id)?.label ?? id
}
export function getSizeLabel(id: string) {
  return SIZES.find((s) => s.id === id)?.label ?? id
}
export function getFrameLabel(id: string) {
  return FRAMES.find((s) => s.id === id)?.label ?? id
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: '新規',
  in_review: '確認中',
  proof_uploaded: '初稿提示済み',
  revision_requested: '修正依頼中',
  approved: '承認済み',
  in_production: '制作中',
  shipped: '発送済み',
  completed: '完了',
  cancelled: 'キャンセル',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: '未払い',
  pending: '確認中',
  paid: '支払済み',
  refunded: '返金済み',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodId, string> = {
  unknown: '未選択',
  bank_transfer: '銀行振込',
  credit_card: 'クレジットカード',
  paypay_qr: 'PayPay QR',
}

export function getPaymentMethodLabel(id: string) {
  return PAYMENT_METHOD_LABELS[id as PaymentMethodId] ?? id
}
