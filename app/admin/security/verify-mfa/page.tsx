import { requireAdminBase } from '@/lib/auth'
import { AdminMfaVerify } from '@/components/admin/security/AdminMfaVerify'

export default async function AdminMfaVerifyPage() {
  await requireAdminBase()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8">
        <AdminMfaVerify />
      </div>
    </div>
  )
}
