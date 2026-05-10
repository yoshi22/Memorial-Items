import { env } from '@/lib/env'
import { getSecurityAlertRecipients } from '@/lib/admin-security'
import { getPaymentMethodLabel } from '@/lib/variants'
import { getPaymentInstructionsText } from '@/lib/payments'

interface EmailPayload {
  to: string | string[]
  subject: string
  text: string
}

async function sendEmail(payload: EmailPayload) {
  if (!env.brevoApiKey || !env.emailFrom) {
    console.log('[email:no-op]', payload.subject, '→', payload.to)
    return
  }
  const { BrevoClient } = await import('@getbrevo/brevo')
  const brevo = new BrevoClient({ apiKey: env.brevoApiKey })
  await brevo.transactionalEmails.sendTransacEmail({
    subject: payload.subject,
    textContent: payload.text,
    sender: { name: 'Memorial Items', email: env.emailFrom },
    to: (Array.isArray(payload.to) ? payload.to : [payload.to]).map((email) => ({ email })),
  })
}

function formatDateTime() {
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo',
  }).format(new Date())
}

export async function sendOrderReceived(params: {
  to: string
  customerName: string
  petName: string
  orderToken: string
  paymentMethod: string
}) {
  const orderUrl = `${env.appBaseUrl}/o/${params.orderToken}`
  await sendEmail({
    to: params.to,
    subject: `【Memorial Items】ご注文ありがとうございます（${params.petName}）`,
    text: `${params.customerName} 様

ご注文いただきありがとうございます。
${params.petName} の額装アートを制作いたします。

ご注文内容と進行状況はこちらでご確認いただけます:
${orderUrl}

${getPaymentInstructionsText(params.paymentMethod)}

初稿（プルーフ）の準備ができましたら改めてご連絡します。
お気軽にご連絡ください。

Memorial Items`,
  })
}

export async function sendAdminOrderCreated(params: {
  customerName: string
  customerEmail: string
  petName: string
  orderToken: string
  paymentMethod: string
}) {
  if (env.adminEmails.length === 0) return
  const orderUrl = `${env.appBaseUrl}/o/${params.orderToken}`
  await sendEmail({
    to: env.adminEmails,
    subject: `【Admin】新規注文: ${params.petName} / ${params.customerName}`,
    text: `新規注文が入りました。

顧客名: ${params.customerName}
顧客メール: ${params.customerEmail}
ペット名: ${params.petName}
支払い方法: ${getPaymentMethodLabel(params.paymentMethod)}

顧客向け注文URL:
${orderUrl}`,
  })
}

export async function sendProofReady(params: {
  to: string
  customerName: string
  petName: string
  proofToken: string
  version: number
}) {
  const proofUrl = `${env.appBaseUrl}/p/${params.proofToken}`
  const proofLabel = params.version === 1 ? '初稿' : `修正版（バージョン ${params.version}）`
  await sendEmail({
    to: params.to,
    subject: `【Memorial Items】${params.petName} の${proofLabel}をご確認ください`,
    text: `${params.customerName} 様

${params.petName} の額装アートの${proofLabel}が完成しました。
下記のリンクからご確認のうえ、承認または修正依頼をお知らせください。

${proofUrl}

ご不明な点はお気軽にご連絡ください。

Memorial Items`,
  })
}

export async function sendAdminRevisionRequested(params: {
  customerName: string
  petName: string
  orderToken: string
  proofToken: string
  requestText: string
}) {
  if (env.adminEmails.length === 0) return
  await sendEmail({
    to: env.adminEmails,
    subject: `【Admin】修正依頼: ${params.petName} / ${params.customerName}`,
    text: `顧客から修正依頼が届きました。

顧客名: ${params.customerName}
ペット名: ${params.petName}

修正依頼:
${params.requestText}

注文URL:
${env.appBaseUrl}/o/${params.orderToken}

Proof確認URL:
${env.appBaseUrl}/p/${params.proofToken}`,
  })
}

export async function sendProofApproved(params: {
  to: string
  customerName: string
  petName: string
  orderToken: string
}) {
  const orderUrl = `${env.appBaseUrl}/o/${params.orderToken}`
  const bodyLines = env.enablePhysicalShipping
    ? [
        'ご承認ありがとうございます。',
        '印刷・額装・発送に進みます。',
        '',
        `注文状況: ${orderUrl}`,
        '',
        '発送後に追跡番号をお送りします。',
      ]
    : [
        'ご承認ありがとうございます。',
        '完成画像の準備ができました。下記のページからダウンロードいただけます。',
        '',
        `${orderUrl}`,
      ]
  await sendEmail({
    to: params.to,
    subject: `【Memorial Items】承認を受け付けました（${params.petName}）`,
    text: `${params.customerName} 様\n\n${bodyLines.join('\n')}\n\nMemorial Items`,
  })
}

export async function sendRevisionReceived(params: {
  to: string
  customerName: string
  petName: string
  orderToken: string
}) {
  const orderUrl = `${env.appBaseUrl}/o/${params.orderToken}`
  await sendEmail({
    to: params.to,
    subject: `【Memorial Items】修正依頼を受け付けました（${params.petName}）`,
    text: `${params.customerName} 様

修正依頼を受け付けました。
対応後、改めてご確認いただける初稿をお送りします。

注文状況: ${orderUrl}

Memorial Items`,
  })
}

export async function sendAdminProofApproved(params: {
  customerName: string
  petName: string
  orderToken: string
}) {
  if (env.adminEmails.length === 0) return
  await sendEmail({
    to: env.adminEmails,
    subject: `【Admin】承認完了: ${params.petName} / ${params.customerName}`,
    text: `顧客が proof を承認しました。

顧客名: ${params.customerName}
ペット名: ${params.petName}

注文URL:
${env.appBaseUrl}/o/${params.orderToken}`,
  })
}

export async function sendPaymentConfirmed(params: {
  to: string
  customerName: string
  petName: string
  orderToken: string
}) {
  const orderUrl = `${env.appBaseUrl}/o/${params.orderToken}`
  await sendEmail({
    to: params.to,
    subject: `【Memorial Items】お支払いを確認しました（${params.petName}）`,
    text: `${params.customerName} 様

お支払いを確認しました。
制作・ご案内の進行状況は以下のページからご確認いただけます。

${orderUrl}

Memorial Items`,
  })
}

export async function sendShipped(params: {
  to: string
  customerName: string
  petName: string
  trackingNumber: string
  orderToken: string
}) {
  const orderUrl = `${env.appBaseUrl}/o/${params.orderToken}`
  await sendEmail({
    to: params.to,
    subject: `【Memorial Items】発送しました（${params.petName}）`,
    text: `${params.customerName} 様

${params.petName} の額装アートを発送しました。

追跡番号: ${params.trackingNumber}

注文状況: ${orderUrl}

お届けまでいましばらくお待ちください。

Memorial Items`,
  })
}

export async function sendAdminLoginAlert(params: {
  email: string
  mfaCompleted: boolean
}) {
  const recipients = getSecurityAlertRecipients([params.email])
  if (recipients.length === 0) return

  await sendEmail({
    to: recipients,
    subject: `【Security】管理者ログイン: ${params.email}`,
    text: `管理者ログインを検知しました。

メールアドレス: ${params.email}
時刻: ${formatDateTime()}
MFA: ${params.mfaCompleted ? '完了済み' : '未完了'}

Memorial Items Security`,
  })
}

export async function sendAdminMfaEnrolledAlert(params: {
  email: string
}) {
  const recipients = getSecurityAlertRecipients([params.email])
  if (recipients.length === 0) return

  await sendEmail({
    to: recipients,
    subject: `【Security】MFA 登録完了: ${params.email}`,
    text: `管理者アカウントの TOTP MFA 登録が完了しました。

メールアドレス: ${params.email}
時刻: ${formatDateTime()}

Memorial Items Security`,
  })
}
