'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { resizeImageForAI, 
  getBase64Size, 
  formatFileSize } from '@/lib/image-utils'

const CATEGORIES = [
  'Meals',
  'Transport',
  'Software',
  'Equipment',
  'Supplies',
  'Marketing',
  'Professional Services',
  'Travel',
  'Home Office',
  'Courses & Learning',
  'Other',
] as const

type Category = typeof CATEGORIES[number]

interface ReceiptData {
  vendor: string
  amount: string
  date: string
  gst_amount: string
  category: Category
  notes: string
}

export default function ReviewPage() {
  const router = useRouter()
  const scanStarted = useRef(false)

  const [imageData, setImageData] = useState('')
  const [scanning, setScanning] = useState(true)
  const [scanError, setScanError] = useState('')
  const [fallback, setFallback] = useState(false)
  const [imageSizeInfo, setImageSizeInfo] = 
    useState('')

  const [receiptData, setReceiptData] = 
    useState<ReceiptData>({
      vendor: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      gst_amount: '',
      category: 'Other',
      notes: '',
    })

  useEffect(() => {
    const stored = sessionStorage.getItem(
      'captured_receipt'
    )
    if (!stored) {
      router.push('/capture')
      return
    }
    setImageData(stored)
    if (!scanStarted.current) {
      scanStarted.current = true
      scanReceipt(stored)
    }
  }, [])

  async function scanReceipt(image: string) {
    setScanning(true)
    setScanError('')

    try {
      // Resize image before sending to AI
      // Reduces cost by 70-80%
      const resized = await resizeImageForAI(
        image,
        1600,
        0.92
      )

      const originalSize = getBase64Size(image)
      const resizedSize = getBase64Size(resized)
      setImageSizeInfo(
        `${formatFileSize(originalSize)} → ` +
        `${formatFileSize(resizedSize)}` 
      )

      const response = await fetch(
        '/api/scan-receipt',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ image: resized }),
        }
      )

      const result = await response.json()

      if (result.fallback || !response.ok) {
        // AI could not read receipt clearly
        // Show manual entry form
        setFallback(true)
        setScanError(
          result.error || 
          'Could not read receipt — please enter manually'
        )
        return
      }

      if (result.success && result.data) {
        setReceiptData({
          vendor: result.data.vendor || '',
          amount: result.data.amount?.toString() || '',
          date: result.data.date || 
            new Date().toISOString().split('T')[0],
          gst_amount: result.data.gst_amount
            ? result.data.gst_amount.toString()
            : '',
          category: CATEGORIES.includes(
            result.data.category as Category
          )
            ? result.data.category as Category
            : 'Other',
          notes: '',
        })
      }
    } catch {
      setFallback(true)
      setScanError(
        'Connection error — please enter manually'
      )
    } finally {
      setScanning(false)
    }
  }

  function handleNext() {
    if (!receiptData.vendor.trim()) {
      alert('Please enter the vendor name')
      return
    }
    if (!receiptData.amount || 
      isNaN(parseFloat(receiptData.amount))) {
      alert('Please enter a valid amount')
      return
    }

    // Save to sessionStorage for confirm page
    sessionStorage.setItem(
      'receipt_data',
      JSON.stringify({
        ...receiptData,
        amount: parseFloat(receiptData.amount),
        gst_amount: receiptData.gst_amount
          ? parseFloat(receiptData.gst_amount)
          : null,
        notes: receiptData.notes.trim(),
        image: imageData,
      })
    )

    router.push('/capture/confirm')
  }

  const inputClass = `w-full px-3 py-2.5 
    border border-gray-300 rounded-lg 
    text-sm text-gray-900 bg-white
    placeholder:text-gray-400
    focus:outline-none focus:ring-2 
    focus:ring-blue-600 
    focus:border-transparent`

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
            Review receipt
          </h1>
          <p className="text-xs text-gray-500">
            {scanning 
              ? 'AI is reading your receipt...' 
              : fallback
              ? 'Enter details manually'
              : 'Confirm or edit details'
            }
          </p>
        </div>
        {scanning && (
          <div className="ml-auto w-4 h-4 border-2 
            border-blue-600 border-t-transparent 
            rounded-full animate-spin" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">

        {/* Receipt image thumbnail */}
        {imageData && (
          <div className="mb-4 relative">
            <img
              src={imageData}
              alt="Captured receipt"
              className="w-full max-h-48 
                object-contain rounded-xl 
                border border-gray-200 bg-gray-100"
            />
            {imageSizeInfo && (
              <div className="absolute bottom-2 
                right-2 bg-black/50 text-white 
                text-xs px-2 py-1 rounded-md">
                {imageSizeInfo}
              </div>
            )}
            {scanning && (
              <div className="absolute inset-0 
                bg-black/30 rounded-xl flex 
                items-center justify-center">
                <div className="bg-white rounded-xl 
                  px-4 py-3 text-center shadow-lg">
                  <div className="w-6 h-6 border-2 
                    border-blue-600 
                    border-t-transparent 
                    rounded-full animate-spin 
                    mx-auto mb-2" />
                  <p className="text-xs 
                    text-gray-700 font-medium">
                    Reading receipt...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scan error message */}
        {scanError && (
          <div className="mb-4 p-3 bg-amber-50 
            border border-amber-200 rounded-lg 
            flex items-start gap-2">
            <span className="text-amber-500 
              flex-shrink-0">⚠️</span>
            <div>
              <p className="text-xs font-medium 
                text-amber-800">
                {scanError}
              </p>
              {!fallback && (
                <button
                  onClick={() => 
                    scanReceipt(imageData)}
                  className="text-xs text-blue-600 
                    mt-1 font-medium"
                >
                  Try scanning again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Receipt data form */}
        {!scanning && (
          <div className="bg-white rounded-xl 
            border border-gray-200 p-4 
            space-y-4">

            {!fallback && (
              <div className="flex items-center 
                gap-2 pb-3 border-b border-gray-100">
                <span className="text-green-600 
                  text-sm">✓</span>
                <p className="text-xs text-gray-500">
                  AI extracted these details — 
                  tap any field to edit
                </p>
              </div>
            )}

            {/* Vendor */}
            <div>
              <label className="block text-xs 
                font-medium text-gray-700 mb-1">
                Vendor / Business name
              </label>
              <input
                type="text"
                value={receiptData.vendor}
                onChange={(e) =>
                  setReceiptData(prev => ({
                    ...prev,
                    vendor: e.target.value
                  }))}
                placeholder="e.g. Old Chang Kee"
                className={inputClass}
              />
            </div>

            {/* Amount and GST row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs 
                  font-medium text-gray-700 mb-1">
                  Total amount (SGD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={receiptData.amount}
                  onChange={(e) =>
                    setReceiptData(prev => ({
                      ...prev,
                      amount: e.target.value
                    }))}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs 
                  font-medium text-gray-700 mb-1">
                  GST amount (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={receiptData.gst_amount}
                  onChange={(e) =>
                    setReceiptData(prev => ({
                      ...prev,
                      gst_amount: e.target.value
                    }))}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs 
                font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={receiptData.date}
                onChange={(e) =>
                  setReceiptData(prev => ({
                    ...prev,
                    date: e.target.value
                  }))}
                className={inputClass}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs 
                font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={receiptData.category}
                onChange={(e) =>
                  setReceiptData(prev => ({
                    ...prev,
                    category: e.target.value as Category
                  }))}
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs 
                font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={receiptData.notes}
                onChange={(e) =>
                  setReceiptData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                placeholder={
                  receiptData.category === 'Transport'
                    ? 'e.g. Grab — Toa Payoh to Orchard'
                    : receiptData.category === 'Meals'
                    ? 'e.g. Client lunch with ABC company'
                    : 'Add any additional notes here'
                }
                className="w-full px-3 py-2.5 
                  border border-gray-300 rounded-lg 
                  text-sm text-gray-900 bg-white
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 
                  focus:ring-blue-600 
                  focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom action button */}
      {!scanning && (
        <div className="p-4 bg-white border-t 
          border-gray-200 flex-shrink-0">
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 
              text-white py-3 rounded-xl 
              text-sm font-semibold
              hover:bg-blue-700 
              transition-colors
              flex items-center 
              justify-center gap-2"
          >
            Looks correct — next →
          </button>
          <button
            onClick={() => router.push('/capture')}
            className="w-full text-gray-500 
              py-2 text-sm mt-2 
              hover:text-gray-700"
          >
            Retake photo
          </button>
        </div>
      )}
    </div>
  )
}
