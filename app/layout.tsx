import type { Metadata } from 'next'
import { Cormorant_Garamond, Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-serif-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Memorial Items — ペットのメモリアルアート',
  description: '大切なペットの写真をもとに、手作業で整えたメモリアルアートを proof 確認後にデジタル納品します。',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${cormorant.variable} ${notoSansJP.variable} ${notoSerifJP.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}
