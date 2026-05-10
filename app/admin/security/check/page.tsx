import { requireAdminBase } from '@/lib/auth'
import { AdminSecurityCheck } from '@/components/admin/security/AdminSecurityCheck'

export default async function AdminSecurityCheckPage() {
  await requireAdminBase()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8">
        <AdminSecurityCheck />
      </div>
    </div>
  )
}
