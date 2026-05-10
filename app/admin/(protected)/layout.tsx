import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold">Memorial Items 管理</span>
            <nav className="flex gap-4 text-sm text-gray-300">
              <Link href="/admin/orders" className="hover:text-white">注文一覧</Link>
              <Link href="/admin/content/faq" className="hover:text-white">FAQ</Link>
              <Link href="/admin/content/examples" className="hover:text-white">作例</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="rounded-full border border-emerald-700 px-2 py-0.5 text-xs text-emerald-300">MFA verified</span>
            <span>{user.email}</span>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="hover:text-white">ログアウト</button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
