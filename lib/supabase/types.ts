export type OrderStatus =
  | 'new'
  | 'in_review'
  | 'proof_uploaded'
  | 'revision_requested'
  | 'approved'
  | 'in_production'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded'
export type PaymentMethod = 'unknown' | 'bank_transfer' | 'credit_card' | 'paypay_qr'
export type RevisionStatus = 'open' | 'addressed' | 'closed'
export type ArtAssetType = 'reference' | 'selected_reference' | 'proof' | 'print_master'

export interface Order {
  id: string
  public_order_token: string
  public_proof_token: string
  customer_name: string
  customer_email: string
  pet_name: string
  style: string
  size: string
  frame: string
  payment_method: PaymentMethod
  must_keep_features: string | null
  notes: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  tracking_number: string | null
  created_at: string
  updated_at: string
}

export interface OrderImage {
  id: string
  order_id: string
  file_path: string
  original_filename: string | null
  mime_type: string | null
  file_size: number | null
  sort_order: number
  created_at: string
}

export interface Proof {
  id: string
  order_id: string
  version: number
  proof_image_url: string
  production_notes: string | null
  created_at: string
}

export interface RevisionRequest {
  id: string
  order_id: string
  proof_id: string
  request_text: string
  status: RevisionStatus
  created_at: string
}

export interface ArtAsset {
  id: string
  order_id: string
  asset_type: ArtAssetType
  file_url: string
  created_at: string
}

export interface AdminNote {
  id: string
  order_id: string
  note: string
  created_by: string | null
  created_at: string
}

export interface ContentExample {
  id: string
  title: string
  short_description: string | null
  image_url: string
  tags: string[]
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export type AdminSecurityEventType =
  | 'basic_auth_failed'
  | 'magic_link_requested'
  | 'magic_link_denied'
  | 'magic_link_throttled'
  | 'magic_link_failed'
  | 'mfa_enroll_started'
  | 'mfa_verified'
  | 'mfa_failed'
  | 'account_locked'
  | 'login_succeeded'

export interface AdminSecurityEvent {
  id: string
  email: string | null
  event_type: AdminSecurityEventType
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface AdminLoginProtection {
  email: string
  failed_attempts: number
  locked_until: string | null
  last_failed_at: string | null
  last_success_at: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'public_order_token' | 'public_proof_token' | 'created_at' | 'updated_at'>; Update: Partial<Order> }
      order_images: { Row: OrderImage; Insert: Omit<OrderImage, 'id' | 'created_at'>; Update: Partial<OrderImage> }
      proofs: { Row: Proof; Insert: Omit<Proof, 'id' | 'created_at'>; Update: Partial<Proof> }
      revision_requests: { Row: RevisionRequest; Insert: Omit<RevisionRequest, 'id' | 'created_at'>; Update: Partial<RevisionRequest> }
      art_assets: { Row: ArtAsset; Insert: Omit<ArtAsset, 'id' | 'created_at'>; Update: Partial<ArtAsset> }
      admin_notes: { Row: AdminNote; Insert: Omit<AdminNote, 'id' | 'created_at'>; Update: Partial<AdminNote> }
      content_examples: { Row: ContentExample; Insert: Omit<ContentExample, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ContentExample> }
      faq_items: { Row: FaqItem; Insert: Omit<FaqItem, 'id' | 'created_at' | 'updated_at'>; Update: Partial<FaqItem> }
      admin_security_events: { Row: AdminSecurityEvent; Insert: Omit<AdminSecurityEvent, 'id' | 'created_at'>; Update: Partial<AdminSecurityEvent> }
      admin_login_protection: { Row: AdminLoginProtection; Insert: Omit<AdminLoginProtection, 'created_at' | 'updated_at'>; Update: Partial<AdminLoginProtection> }
    }
  }
}
