import Link from 'next/link'
import Image from 'next/image'

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/favicon-b-48.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-[4px] flex-shrink-0"
            aria-hidden="true"
          />
          <span className="font-serif text-xl text-ink tracking-tight">Memorial Items</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-soft">
          <Link href="/examples" className="hover:text-ink transition-colors">作例</Link>
          <Link href="/faq" className="hover:text-ink transition-colors">FAQ</Link>
          <Link
            href="/order"
            className="bg-accent text-white rounded-full px-4 py-1.5 text-sm font-medium shadow hover:-translate-y-px hover:brightness-105 transition"
          >
            注文する
          </Link>
        </nav>
      </div>
    </header>
  )
}
