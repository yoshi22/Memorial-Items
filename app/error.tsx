'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">エラーが発生しました</h1>
        <p className="text-gray-600 mb-6">
          申し訳ありません。しばらくしてから再度お試しください。
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">エラーID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          再試行する
        </button>
      </div>
    </div>
  )
}
