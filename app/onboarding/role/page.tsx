'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type UserRole =
  | 'owner'
  | 'accountant'
  | 'manager'
  | 'employee'

const roles: Array<{
  value: UserRole
  emoji: string
  title: string
  description: string
}> = [
  {
    value: 'owner',
    emoji: '👤',
    title: 'Business owner',
    description:
      'I run the business, capture receipts ' +
      'and approve expenses',
  },
  {
    value: 'accountant',
    emoji: '📋',
    title: 'Accountant',
    description:
      "I review my client's expenses " +
      'and generate reports at year end',
  },
  {
    value: 'manager',
    emoji: '👔',
    title: 'Manager',
    description:
      'I approve expense claims for my team',
  },
  {
    value: 'employee',
    emoji: '👥',
    title: 'Employee',
    description:
      'I submit expense claims for reimbursement',
  },
]

export default function OnboardingRolePage() {
  const router = useRouter()
  const supabase = createClient()

  const [selected, setSelected] =
    useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleNext() {
    if (!selected) return

    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // @ts-ignore
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: selected,
          is_director: selected === 'owner',
          can_approve:
            selected === 'owner' ||
            selected === 'manager',
        })
        .eq('id', user.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      router.push('/onboarding/ready')
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm
      border border-gray-200 p-8">

      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full
                transition-all
                ${s <= 2
                  ? 'w-6 bg-green-700'
                  : 'w-3 bg-gray-200'
                }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">
          Step 2 of 3
        </span>
      </div>

      <h2 className="text-xl font-bold
        text-gray-900 mb-1">
        How will you use Snap Claim?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        This helps us show you the right features.
      </p>

      <div className="space-y-3 mb-6">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => setSelected(role.value)}
            className={`w-full text-left p-4
              rounded-xl border-2 transition-all
              ${selected === role.value
                ? 'border-green-700 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {role.emoji}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold
                  text-gray-900">
                  {role.title}
                </div>
                <div className="text-xs text-gray-500
                  mt-0.5">
                  {role.description}
                </div>
              </div>
              {selected === role.value && (
                <div className="w-5 h-5 rounded-full
                  bg-green-700 flex items-center
                  justify-center flex-shrink-0">
                  <span className="text-white
                    text-xs">
                    ✓
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={!selected || loading}
        className="w-full bg-green-700 text-white
          py-2.5 rounded-lg text-sm font-medium
          hover:bg-green-800 transition-colors
          disabled:opacity-50
          disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2
              border-white border-t-transparent
              rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          'Continue →'
        )}
      </button>
    </div>
  )
}
