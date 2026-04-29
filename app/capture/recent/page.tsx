'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Receipt } from '@/lib/types'

const TYPE_CONFIG = {
  company: {
    label: 'Company',
    bg: 'bg-teal-100',
    text: 'text-teal-700',
  },
  director_loan: {
    label: 'Personal payment',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
  },
  personal: {
    label: 'Personal',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  },
}

export default function RecentPage() {
  const router = useRouter()
  const supabase = createClient()

  const [receipts, setReceipts] = 
    useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [monthTotal, setMonthTotal] = useState(0)

  useEffect(() => {
    loadReceipts()
  }, [])

  async function loadReceipts() {
    setLoading(true)
    try {
      const { data: { user } } = 
        await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('receipts')
        .select('*')
        .eq('captured_by', user.id)
        .neq('type', 'personal')
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setReceipts(data as Receipt[])

        const total = data
          .filter(r => {
            const created = new Date(
              r.created_at ?? ''
            )
            return created >= startOfMonth
          })
          .reduce((sum, r) => sum + r.amount, 0)

        setMonthTotal(total)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50
      max-w-md mx-auto flex flex-col">

      {/* Header */}
      <div className="bg-white border-b
        border-gray-200 px-4 py-3 flex
        items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.push('/capture')}
          className="w-8 h-8 flex items-center
            justify-center rounded-full
            hover:bg-gray-100"
        >
          <span className="text-gray-600 text-lg">
            ←
          </span>
        </button>
        <div>
          <h1 className="text-sm font-semibold
            text-gray-900">
            Recent receipts
          </h1>
          <p className="text-xs text-gray-500">
            This month — SGD ${monthTotal.toFixed(2)}
          </p>
        </div>
        <button
          onClick={loadReceipts}
          className="ml-auto text-blue-600
            text-xs font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center
            justify-center py-16">
            <div className="w-6 h-6 border-2
              border-blue-600
              border-t-transparent rounded-full
              animate-spin" />
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-4xl mb-4">🧾</div>
            <p className="text-gray-600
              font-medium mb-2">
              No receipts yet
            </p>
            <p className="text-sm text-gray-400
              mb-6">
              Snap your first receipt to get started
            </p>
            <button
              onClick={() => 
                router.push('/capture')}
              className="bg-blue-600 text-white
                px-6 py-2.5 rounded-lg text-sm
                font-semibold hover:bg-blue-700"
            >
              📸 Snap a receipt
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {receipts.map((receipt) => {
              const config = TYPE_CONFIG[
                receipt.type as keyof 
                  typeof TYPE_CONFIG
              ] ?? TYPE_CONFIG.company

              return (
                <div
                  key={receipt.id}
                  className="bg-white rounded-xl
                    border border-gray-200 p-4
                    flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm
                      font-semibold text-gray-900
                      truncate">
                      {receipt.vendor}
                    </p>
                    <div className="flex items-center
                      gap-2 mt-1">
                      <span className={`text-xs
                        font-medium px-2 py-0.5
                        rounded-full
                        ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                      <span className="text-xs
                        text-gray-400">
                        {receipt.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right
                    flex-shrink-0">
                    <p className="text-sm
                      font-bold text-gray-900">
                      ${receipt.amount.toFixed(2)}
                    </p>
                    <p className="text-xs
                      text-gray-400 mt-0.5">
                      {new Date(receipt.date)
                        .toLocaleDateString(
                          'en-SG', {
                            day: 'numeric',
                            month: 'short',
                          }
                        )
                      }
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t
        border-gray-200 flex
        flex-shrink-0">
        <button
          onClick={() => router.push('/capture')}
          className="flex-1 flex flex-col
            items-center justify-center
            py-3 text-gray-400
            hover:text-gray-600"
        >
          <span className="text-xl">📸</span>
          <span className="text-xs mt-1">
            Capture
          </span>
        </button>
        <button
          className="flex-1 flex flex-col
            items-center justify-center
            py-3 text-blue-600"
        >
          <span className="text-xl">📋</span>
          <span className="text-xs mt-1
            font-semibold">
            Recent
          </span>
        </button>
        <button
          onClick={() => 
            router.push('/dashboard')}
          className="flex-1 flex flex-col
            items-center justify-center
            py-3 text-gray-400
            hover:text-gray-600"
        >
          <span className="text-xl">📊</span>
          <span className="text-xs mt-1">
            Dashboard
          </span>
        </button>
      </div>
    </div>
  )
}
