'use client'

import { useRouter } from 'next/navigation'

export default function DismissedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50
      max-w-md mx-auto flex flex-col
      items-center justify-center p-6">

      <div className="w-20 h-20 rounded-full
        bg-gray-100 border-4 border-gray-300
        flex items-center justify-center mb-6">
        <span className="text-3xl">👤</span>
      </div>

      <h1 className="text-xl font-bold
        text-gray-900 mb-2 text-center">
        Not recorded
      </h1>

      <p className="text-sm text-gray-500
        text-center mb-8 max-w-xs">
        This was marked as a personal expense
        and was not saved to your business
        records.
      </p>

      <div className="w-full space-y-3">
        <button
          onClick={() => router.push('/capture')}
          className="w-full bg-blue-600
            text-white py-3.5 rounded-xl
            text-sm font-bold
            hover:bg-blue-700 transition-colors
            flex items-center justify-center gap-2"
        >
          <span>📸</span>
          Snap another receipt
        </button>

        <button
          onClick={() => 
            router.push('/dashboard')}
          className="w-full text-gray-400
            py-2 text-sm
            hover:text-gray-600 transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  )
}
