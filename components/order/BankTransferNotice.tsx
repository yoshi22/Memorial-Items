import type { BankTransferAccount } from '@/lib/payments'

interface Props {
  account: BankTransferAccount
  petName?: string
  variant?: 'success' | 'pending'
}

export function BankTransferNotice({ account, petName, variant = 'success' }: Props) {
  const borderColor = variant === 'success' ? 'border-green-200' : 'border-gray-200'
  const bgColor = variant === 'success' ? 'bg-green-50' : 'bg-white'
  const headingColor = variant === 'success' ? 'text-green-800' : 'text-gray-900'
  const textColor = variant === 'success' ? 'text-green-700' : 'text-gray-700'

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4`}>
      <p className={`text-sm font-medium ${headingColor} mb-3`}>銀行振込のご案内</p>
      <dl className={`grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm ${textColor} mb-3`}>
        <dt className="font-medium">銀行名</dt>
        <dd>{account.bankName}</dd>
        {account.branchName && (
          <>
            <dt className="font-medium">支店名</dt>
            <dd>{account.branchName}</dd>
          </>
        )}
        <dt className="font-medium">口座種別</dt>
        <dd>{account.accountType}</dd>
        <dt className="font-medium">口座番号</dt>
        <dd>{account.accountNumber}</dd>
        <dt className="font-medium">口座名義</dt>
        <dd>{account.accountHolder}</dd>
        {account.reference && (
          <>
            <dt className="font-medium">振込参考</dt>
            <dd>{account.reference}</dd>
          </>
        )}
      </dl>
      <ul className={`space-y-1 text-xs ${textColor}`}>
        <li>・お振込手数料はお客様にてご負担ください。</li>
        <li>・振込人名に{petName ? `「${petName}」` : 'ペット名'}を続けてご記入ください（例: ヤマダタロウ ポチ）。</li>
        <li>・ご入金確認後 5 営業日以内に初稿をご案内します。</li>
      </ul>
    </div>
  )
}
