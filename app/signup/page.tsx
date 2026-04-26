'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/Logo'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = 
    useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmation, setShowConfirmation] =
    useState(false)

  async function handleSignup() {
    setError('')

    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters'
      )
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: 'owner',
            },
            emailRedirectTo:
              `${window.location.origin}/auth/callback`,
          },
        })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user?.identities?.length === 0) {
        setError(
          'An account with this email already ' +
          'exists. Please log in instead.'
        )
        return
      }

      if (!data.session) {
        setShowConfirmation(true)
        return
      }

      router.push('/onboarding/company')
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

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50
        flex items-center justify-center p-4">
        <div className="w-full max-w-md 
          bg-white rounded-2xl shadow-sm 
          border border-gray-200 p-8 
          text-center">
          <div className="flex justify-center mb-6">
            <Logo size="md" showTagline={false} />
          </div>
          <div className="w-16 h-16 bg-blue-100
            rounded-full flex items-center
            justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-xl font-bold
            text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            We sent a confirmation link to:
          </p>
          <p className="text-sm font-semibold
            text-gray-900 mb-6">
            {email}
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Click the link in your email to 
            activate your Snap Claim account.
            You will be redirected to set up 
            your company automatically.
          </p>
          <Link
            href="/login"
            className="text-sm text-blue-600
              font-medium hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50
      flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex justify-center mb-8">
          <Logo size="lg" showTagline={true} />
        </div>

        <div className="bg-white rounded-2xl
          shadow-sm border border-gray-200 p-8">

          <h2 className="text-xl font-bold
            text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Start tracking your business expenses 
            in minutes.
          </p>

          <div className="space-y-4">

            <div>
              <label className="block text-sm
                font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleSignup()}
                placeholder="Sarah Tan"
                className="w-full px-4 py-2.5 
                  border border-gray-300 rounded-lg 
                  text-sm text-gray-900 bg-white
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2
                  focus:ring-blue-600
                  focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm
                font-medium text-gray-700 mb-1.5">
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleSignup()}
                placeholder="sarah@company.com"
                className="w-full px-4 py-2.5
                  border border-gray-300 rounded-lg
                  text-sm text-gray-900 bg-white
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2
                  focus:ring-blue-600
                  focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm
                font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleSignup()}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-2.5
                  border border-gray-300 rounded-lg
                  text-sm text-gray-900 bg-white
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2
                  focus:ring-blue-600
                  focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm
                font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleSignup()}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2.5
                  border border-gray-300 rounded-lg
                  text-sm text-gray-900 bg-white
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2
                  focus:ring-blue-600
                  focus:border-transparent"
              />
            </div>

          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50
              border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full mt-6 bg-blue-600
              text-white py-2.5 rounded-lg
              text-sm font-semibold
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
                Creating account...
              </>
            ) : (
              'Create account →'
            )}
          </button>

          <p className="text-center text-sm
            text-gray-500 mt-4">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600
                font-medium hover:underline"
            >
              Log in
            </Link>
          </p>

          <p className="text-center text-xs
            text-gray-400 mt-4">
            By signing up you agree to our terms.
            Your data is stored securely in Singapore.
          </p>
        </div>
      </div>
    </div>
  )
}
