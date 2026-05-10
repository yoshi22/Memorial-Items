import Link from 'next/link'
import { businessInfo, footerLegalLinks } from '@/lib/public-business'

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-auto">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2 text-sm text-ink-mute">
            <p className="font-medium text-ink">{businessInfo.serviceName}</p>
            <p>{businessInfo.productSummary}</p>
            <p>お問い合わせ: <a href={`mailto:${businessInfo.contactEmail}`} className="underline hover:text-ink">{businessInfo.contactEmail}</a></p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-ink-mute sm:text-right">
            {footerLegalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-ink underline-offset-4 hover:underline">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-4 text-center text-sm text-ink-mute">
          © {new Date().getFullYear()} {businessInfo.serviceName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
