import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE_BYTES = 15 * 1024 * 1024 // 15MB
const MAX_PROOF_SIZE_BYTES = 50 * 1024 * 1024 // 50MB
const ALLOWED_PROOF_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_EXAMPLE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export function validateImage(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type)) {
    return `対応フォーマットは JPEG/PNG/WebP/HEIC のみです（受信: ${file.type}）`
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `ファイルサイズは15MB以下にしてください（受信: ${(file.size / 1024 / 1024).toFixed(1)}MB）`
  }
  return null
}

export function validateProofImage(file: File): string | null {
  if (!ALLOWED_PROOF_MIME.includes(file.type)) {
    return `対応フォーマットは JPEG/PNG/WebP のみです（受信: ${file.type}）`
  }
  if (file.size > MAX_PROOF_SIZE_BYTES) {
    return `ファイルサイズは50MB以下にしてください（受信: ${(file.size / 1024 / 1024).toFixed(1)}MB）`
  }
  return null
}

export function validateExampleImage(file: File): string | null {
  if (!ALLOWED_PROOF_MIME.includes(file.type)) {
    return `作例画像は JPEG/PNG/WebP のみ対応しています（受信: ${file.type}）`
  }
  if (file.size > MAX_EXAMPLE_SIZE_BYTES) {
    return `作例画像は10MB以下にしてください（受信: ${(file.size / 1024 / 1024).toFixed(1)}MB）`
  }
  return null
}

export async function uploadToBucket(
  bucket: string,
  path: string,
  file: File,
): Promise<string> {
  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const { error } = await admin.storage
    .from(bucket)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return path
}

export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600,
): Promise<string> {
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error || !data) throw new Error(`Signed URL failed: ${error?.message}`)
  return data.signedUrl
}

export function getExtension(file: File): string {
  const parts = file.name.split('.')
  return parts.length > 1 ? (parts[parts.length - 1] ?? 'bin').toLowerCase() : 'bin'
}
