'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SavedReceipt {
  type: 'company' | 'director_loan'
  vendor: string
  amount: number
}

export default function SuccessPage() {
  const router = useRouter()
  const [saved, setSaved] = 
    useState<SavedReceipt | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(
      'receipt_saved'
    )
    if (stored) {
      try {
        setSaved(JSON.parse(stored))
        sessionStorage.removeItem('receipt_saved')
      } catch {}
    }
  }, [])

  const isDirectorLoan = 
    saved?.type === 'director_loan'

  return (
    <div className="min-h-screen bg-gray-50
      max-w-md mx-auto flex flex-col
      items-center justify-center p-6">

      {/* Success animation */}
      <div className="relative mb-6">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full
          bg-teal-50 border-4 border-teal-500
          flex items-center justify-center
          animate-bounce-once">
          <span className="text-4xl">✓</span>
        </div>

        {/* Sparkle dots */}
        <div className="absolute -top-1 -right-1
          w-4 h-4 rounded-full bg-amber-400
          animate-ping opacity-75" />
        <div className="absolute -bottom-1 -left-1
          w-3 h-3 rounded-full bg-blue-400
          animate-ping opacity-75"
          style={{ animationDelay: '0.3s' }} />
      </div>

      <h1 className="text-2xl font-bold
        text-gray-900 mb-2 text-center">
        Receipt saved!
      </h1>

      {saved && (
        <div className="bg-white rounded-2xl
          border border-gray-200 p-5
          w-full mb-6 shadow-sm">
          <div className="flex items-center
            justify-between mb-3">
            <span className="text-base
              font-bold text-gray-900 truncate
              max-w-44">
              {saved.vendor}
            </span>
            <span className="text-xl
              font-bold text-gray-900 ml-2">
              SGD {saved.amount.toFixed(2)}
            </span>
          </div>

          <div className={`inline-flex 
            items-center gap-2 px-3 py-1.5
            rounded-full text-xs font-semibold
            ${isDirectorLoan
              ? 'bg-purple-100 text-purple-700'
              : 'bg-teal-100 text-teal-700'
            }`}>
            <span>
              {isDirectorLoan ? '💳' : '🏢'}
            </span>
            <span>
              {isDirectorLoan
                ? 'Personal payment — to claim back'
                : 'Company expense'
              }
            </span>
          </div>

          <p className="text-xs text-gray-400
            mt-3 flex items-center gap-1.5">
            <span>📊</span>
            Synced to your dashboard inbox
          </p>
        </div>
      )}

      {/* Action buttons */}
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
            router.push('/dashboard/inbox')}
          className="w-full bg-white
            text-gray-700 py-3.5 rounded-xl
            text-sm font-semibold
            border border-gray-200
            hover:bg-gray-50 transition-colors
            flex items-center justify-center gap-2"
        >
          <span>📥</span>
          View dashboard inbox
        </button>

        <button
          onClick={() => 
            router.push('/capture/recent')}
          className="w-full text-gray-400
            py-2 text-sm
            hover:text-gray-600 transition-colors"
        >
          View recent receipts
        </button>
      </div>

      {/* Bottom tip */}
      <p className="text-xs text-gray-400
        mt-8 text-center max-w-xs">
        💡 Tip — snap receipts immediately 
        after paying so you never lose one
      </p>
    </div>
  )
}
