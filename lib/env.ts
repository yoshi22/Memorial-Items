function readEnv(name: string): string {
  return process.env[name]?.trim() ?? ''
}

function requireEnv(name: string): string {
  const value = readEnv(name)
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function requireFromValue(name: string, value: string | undefined): string {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return trimmed
}

export const env = {
  get supabaseUrl() {
    return requireFromValue('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
  },
  get supabaseAnonKey() {
    return requireFromValue('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  },
  get supabaseServiceRoleKey() {
    return requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  },
  brevoApiKey: readEnv('BREVO_API_KEY'),
  posthogKey: readEnv('POSTHOG_KEY'),
  stripePaymentLinkUrl: readEnv('STRIPE_PAYMENT_LINK_URL'),
  paypayPaymentUrl: readEnv('PAYPAY_PAYMENT_URL'),
  paypayQrImageUrl: readEnv('PAYPAY_QR_IMAGE_URL'),
  bankTransferBankName: readEnv('BANK_TRANSFER_BANK_NAME'),
  bankTransferBranchName: readEnv('BANK_TRANSFER_BRANCH_NAME'),
  bankTransferAccountType: readEnv('BANK_TRANSFER_ACCOUNT_TYPE') || '普通',
  bankTransferAccountNumber: readEnv('BANK_TRANSFER_ACCOUNT_NUMBER'),
  bankTransferAccountHolder: readEnv('BANK_TRANSFER_ACCOUNT_HOLDER'),
  bankTransferReference: readEnv('BANK_TRANSFER_REFERENCE'),
  get appBaseUrl() {
    return requireEnv('APP_BASE_URL')
  },
  emailFrom: readEnv('EMAIL_FROM'),
  adminEmails: readEnv('ADMIN_EMAILS')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  adminBasicAuthUsername: readEnv('ADMIN_BASIC_AUTH_USERNAME'),
  adminBasicAuthPassword: readEnv('ADMIN_BASIC_AUTH_PASSWORD'),
  adminAllowedIps: readEnv('ADMIN_ALLOWED_IPS')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean),
  securityAlertEmails: readEnv('SECURITY_ALERT_EMAILS')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  adminLockoutThreshold: Number(readEnv('ADMIN_LOCKOUT_THRESHOLD') || 10),
  adminLockoutMinutes: Number(readEnv('ADMIN_LOCKOUT_MINUTES') || 30),
  adminMagicLinkMaxRequests: Number(readEnv('ADMIN_MAGIC_LINK_MAX_REQUESTS') || 5),
  adminMagicLinkWindowMinutes: Number(readEnv('ADMIN_MAGIC_LINK_WINDOW_MINUTES') || 15),
  enablePhysicalShipping: readEnv('ENABLE_PHYSICAL_SHIPPING') === 'true',
}
