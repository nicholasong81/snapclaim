'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const steps = [
  {
    icon: '📸',
    title: 'Snap a receipt',
    desc: 'Open the app and photograph any receipt',
  },
  {
    icon: '✅',
    title: 'Choose how it was paid',
    desc: 'Company expense, director loan, or personal',
  },
  {
    icon: '📊',
    title: 'Your accountant sees everything',
    desc: 'Clean reports ready at year end',
  },
]

export default function OnboardingReadyPage() {
  const router = useRouter()
  const supabase = createClient()
  const marked = useRef(false)

  useEffect(() => {
    if (marked.current) return
    marked.current = true

    async function markOnboarded() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // @ts-ignore
      await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('id', user.id)
    }

    markOnboarded()
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-sm
      border border-gray-200 p-8 text-center">

      <div className="flex items-center
        justify-center gap-2 mb-6">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 w-6 rounded-full
                bg-green-700"
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">
          Step 3 of 3
        </span>
      </div>

      <div className="w-16 h-16 bg-green-100
        rounded-full flex items-center
        justify-center mx-auto mb-4">
        <span className="text-3xl">🎉</span>
      </div>

      <h2 className="text-xl font-bold
        text-gray-900 mb-2">
        You are all set!
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Snap Claim is ready to track your expenses.
        Here is how it works:
      </p>

      <div className="space-y-3 mb-8 text-left">
        {steps.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3
              p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-xl">
              {item.icon}
            </span>
            <div>
              <div className="text-sm font-medium
                text-gray-900">
                {item.title}
              </div>
              <div className="text-xs text-gray-500
                mt-0.5">
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.push('/capture')}
          className="w-full bg-green-700 text-white
            py-2.5 rounded-lg text-sm font-medium
            hover:bg-green-800 transition-colors"
        >
          📸 Snap my first receipt
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="w-full text-gray-600 py-2
            text-sm hover:text-gray-900
            transition-colors"
        >
          Go to dashboard →
        </button>
      </div>
    </div>
  )
}
