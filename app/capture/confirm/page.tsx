'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createCompanyExpenseAction,
  createDirectorLoanAction } 
  from '@/app/actions/receipts'

type RecordType = 
  'company' | 'director_loan' | 'personal'

interface ReceiptData {
  vendor: string
  amount: number
  date: string
  gst_amount: number | null
  category: string
  notes: string
  image: string
}

const OPTIONS = [
  {
    type: 'director_loan' as RecordType,
    emoji: '💳',
    title: 'Business expense',
    subtitle: 'I paid personally — claim back later',
    selectedBg: 'bg-blue-50',
    selectedBorder: 'border-blue-600',
    selectedText: 'text-blue-700',
    checkBg: 'bg-blue-600',
  },
  {
    type: 'company' as RecordType,
    emoji: '🏢',
    title: 'Business expense',
    subtitle: 'Paid by company card or account',
    selectedBg: 'bg-teal-50',
    selectedBorder: 'border-teal-600',
    selectedText: 'text-teal-700',
    checkBg: 'bg-teal-600',
  },
  {
    type: 'personal' as RecordType,
    emoji: '👤',
    title: 'Personal expense',
    subtitle: 'Do not record this',
    selectedBg: 'bg-gray-50',
    selectedBorder: 'border-gray-400',
    selectedText: 'text-gray-600',
    checkBg: 'bg-gray-500',
  },
]

export default function ConfirmPage() {
  const router = useRouter()

  const [receiptData, setReceiptData] = 
    useState<ReceiptData | null>(null)
  const [selected, setSelected] = 
    useState<RecordType>('director_loan')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem(
      'receipt_data'
    )
    if (!stored) {
      router.push('/capture')
      return
    }
    try {
      setReceiptData(JSON.parse(stored))
    } catch {
      router.push('/capture')
    }
  }, [])

  async function handleConfirm() {
    if (!receiptData) return

    setLoading(true)
    setError('')

    try {
      if (selected === 'personal') {
        // Personal — clear session and go back
        sessionStorage.removeItem('captured_receipt')
        sessionStorage.removeItem('receipt_data')
        router.push('/capture/dismissed')
        return
      }

      const result = selected === 'company'
        ? await createCompanyExpenseAction(
            receiptData,
            'company'
          )
        : await createDirectorLoanAction(
            receiptData
          )

      if (!result.success) {
        setError(
          result.error ?? 'Failed to save receipt'
        )
        return
      }

      // Clear session storage
      sessionStorage.removeItem('captured_receipt')
      sessionStorage.removeItem('receipt_data')

      // Go to success screen with result
      sessionStorage.setItem(
        'receipt_saved',
        JSON.stringify({
          type: selected,
          vendor: receiptData.vendor,
          amount: receiptData.amount,
        })
      )

      router.push('/capture/success')
    } catch (e: unknown) {
      const msg = e instanceof Error
        ? e.message
        : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-gray-50
        flex items-center justify-center">
        <div className="w-6 h-6 border-2
          border-blue-600 border-t-transparent
          rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50
      max-w-md mx-auto flex flex-col">

      {/* Header */}
      <div className="bg-white border-b
        border-gray-200 px-4 py-3 flex
        items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
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
            How to record this?
          </h1>
          <p className="text-xs text-gray-500">
            Choose one option
          </p>
        </div>
      </div>

      <div className="flex-1 p-4">

        {/* Receipt summary card */}
        <div className="bg-white rounded-xl
          border border-gray-200 p-4 mb-5">
          <div className="flex items-start
            justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold
                text-gray-900 truncate">
                {receiptData.vendor}
              </p>
              <p className="text-xs text-gray-500
                mt-0.5">
                {receiptData.category} · {
                  new Date(receiptData.date)
                    .toLocaleDateString('en-SG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                }
              </p>
              {receiptData.notes && (
                <p className="text-xs text-gray-400
                  mt-1 truncate">
                  {receiptData.notes}
                </p>
              )}
            </div>
            <div className="ml-3 text-right
              flex-shrink-0">
              <p className="text-xl font-bold
                text-gray-900">
                SGD {receiptData.amount.toFixed(2)}
              </p>
              {receiptData.gst_amount && (
                <p className="text-xs
                  text-gray-400 mt-0.5">
                  GST {
                    receiptData.gst_amount
                      .toFixed(2)
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Three option cards */}
        <div className="space-y-3 mb-6">
          {OPTIONS.map((option) => {
            const isSelected = 
              selected === option.type

            return (
              <button
                key={option.type}
                type="button"
                onClick={() => 
                  setSelected(option.type)}
                className={`w-full text-left p-4
                  rounded-xl border-2 
                  transition-all duration-150
                  ${isSelected
                    ? `${option.selectedBg} 
                       ${option.selectedBorder}`
                    : 'bg-white border-gray-200 \
                       hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center
                  gap-3">
                  <span className="text-2xl
                    leading-none flex-shrink-0">
                    {option.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm 
                      font-semibold
                      ${isSelected
                        ? option.selectedText
                        : 'text-gray-900'
                      }`}>
                      {option.title}
                    </p>
                    <p className="text-xs
                      text-gray-500 mt-0.5">
                      {option.subtitle}
                    </p>
                  </div>
                  {isSelected && (
                    <div className={`w-6 h-6
                      rounded-full 
                      ${option.checkBg}
                      flex items-center
                      justify-center
                      flex-shrink-0`}>
                      <span className="text-white
                        text-xs font-bold">
                        ✓
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50
            border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Confirm button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className={`w-full py-3.5 rounded-xl
            text-sm font-bold transition-all
            flex items-center justify-center gap-2
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${selected === 'director_loan'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : selected === 'company'
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2
                border-white border-t-transparent
                rounded-full animate-spin" />
              Saving...
            </>
          ) : selected === 'personal' ? (
            'Discard — personal expense'
          ) : selected === 'director_loan' ? (
            '💳 Save — I paid personally'
          ) : (
            '🏢 Save — company card paid'
          )}
        </button>

      </div>
    </div>
  )
}
