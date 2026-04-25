'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/Logo'

const DEFAULT_CATEGORIES = [
  'Meals', 'Transport', 'Software',
  'Equipment', 'Supplies', 'Marketing',
  'Professional Services', 'Travel',
  'Home Office', 'Courses & Learning', 'Other',
]

export default function OnboardingCompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [gstRegistered, setGstRegistered] = 
    useState(false)

  async function handleNext() {
    if (!companyName.trim()) {
      setError('Please enter your company name')
      return
    }

    setLoading(true)
    setError('')
    setDebug('Starting...')

    try {
      const supabase = createClient()

      // Step 1: Get current user
      setDebug('Getting user...')
      const { data: userData, error: userError } = 
        await supabase.auth.getUser()

      if (userError) {
        setError('Auth error: ' + userError.message)
        return
      }

      if (!userData.user) {
        setError(
          'No user found. Please log in again.'
        )
        router.push('/login')
        return
      }

      const userId = userData.user.id
      setDebug('User found: ' + userId)

      // Step 2: Create company
      setDebug('Creating company...')
      const { data: companyData, error: ce } = 
        await supabase
          .from('companies')
          .insert({
            name: companyName.trim(),
            gst_registered: gstRegistered,
            default_currency: 'SGD',
            plan: 'solo',
          })
          .select('id')
          .single()

      if (ce) {
        setError('Company error: ' + ce.message)
        setDebug('Company failed: ' + ce.message)
        return
      }

      if (!companyData) {
        setError('Company creation returned no data')
        return
      }

      const companyId = companyData.id
      setDebug('Company created: ' + companyId)

      // Step 3: Link profile to company
      setDebug('Linking profile...')
      const { error: pe } = await supabase
        .from('profiles')
        .update({ company_id: companyId })
        .eq('id', userId)

      if (pe) {
        setError('Profile error: ' + pe.message)
        setDebug('Profile failed: ' + pe.message)
        return
      }

      setDebug('Profile linked successfully')

      // Step 4: Insert default categories
      setDebug('Adding categories...')
      const categories = DEFAULT_CATEGORIES.map(
        (name) => ({
          company_id: companyId,
          name,
          is_default: true,
          gst_applicable: true,
        })
      )

      const { error: catError } = await supabase
        .from('company_categories')
        .insert(categories)

      if (catError) {
        console.warn(
          'Category insert warning:', 
          catError.message
        )
        // Non-fatal — continue anyway
      }

      setDebug('All done — going to role page')

      router.push('/onboarding/role')
    } catch (e: unknown) {
      const msg = e instanceof Error 
        ? e.message 
        : 'Unknown error'
      setError('Unexpected error: ' + msg)
      setDebug('Caught error: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl 
      shadow-sm border border-gray-200 p-8">

      <div className="flex items-center 
        gap-2 mb-6">
        <div className="flex items-center 
          gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full
                transition-all
                ${s === 1
                  ? 'w-6 bg-blue-600'
                  : 'w-3 bg-gray-200'
                }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">
          Step 1 of 3
        </span>
      </div>

      <h2 className="text-xl font-bold
        text-gray-900 mb-1">
        Set up your business
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Tell us about your company so we can
        set things up correctly.
      </p>

      <div className="mb-4">
        <label className="block text-sm
          font-medium text-gray-700 mb-1.5">
          Business or company name
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) =>
            setCompanyName(e.target.value)}
          placeholder="e.g. Sarah's Design Studio"
          className="w-full px-4 py-2.5 border
            border-gray-300 rounded-lg text-sm
            focus:outline-none focus:ring-2
            focus:ring-blue-600
            focus:border-transparent"
        />
      </div>

      <div className="flex items-center
        justify-between p-4 bg-gray-50
        rounded-lg mb-6">
        <div>
          <div className="text-sm font-medium
            text-gray-900">
            GST registered?
          </div>
          <div className="text-xs text-gray-500
            mt-0.5">
            We will track GST on your expenses
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            setGstRegistered(!gstRegistered)}
          className={`relative w-11 h-6
            rounded-full transition-colors
            duration-200
            ${gstRegistered
              ? 'bg-blue-600'
              : 'bg-gray-300'
            }`}
        >
          <span
            className={`absolute top-0.5 
              left-0.5 w-5 h-5 bg-white 
              rounded-full shadow
              transition-transform duration-200
              ${gstRegistered
                ? 'translate-x-5'
                : 'translate-x-0'
              }`}
          />
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50
          border border-red-300 rounded-lg">
          <p className="text-sm font-medium
            text-red-800">
            {error}
          </p>
        </div>
      )}

      {/* Debug display — remove before launch */}
      {debug && (
        <div className="mb-4 p-3 bg-blue-50
          border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700
            font-mono">
            Debug: {debug}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={loading}
        className="w-full bg-blue-600 text-white
          py-2.5 rounded-lg text-sm font-medium
          hover:bg-blue-700 transition-colors
          disabled:opacity-50
          disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2
              border-white border-t-transparent
              rounded-full animate-spin" />
            {debug || 'Setting up...'}
          </>
        ) : (
          'Continue →'
        )}
      </button>
    </div>
  )
}
