import { Nav } from '@/components/common/Nav'
import { Footer } from '@/components/common/Footer'

export function LegalPageShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent-ink font-medium mb-2">Policy</p>
          <h1 className="font-serif text-3xl text-ink mb-3">{title}</h1>
          <p className="text-sm text-ink-soft leading-relaxed">{description}</p>
        </div>
        <div className="space-y-8 text-sm leading-7 text-ink-soft">{children}</div>
      </main>
      <Footer />
    </>
  )
}
