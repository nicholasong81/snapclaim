'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/Logo'

type UserRole = 'owner' | 'accountant' | 'manager' | 'employee'

const roles = [
  {
    value: 'owner' as UserRole,
    emoji: '👤',
    title: 'Business Owner',
    description: 'I run the business and capture receipts',
  },
  {
    value: 'accountant' as UserRole,
    emoji: '📋',
    title: 'Accountant',
    description: 'I review expenses and generate reports',
  },
  {
    value: 'manager' as UserRole,
    emoji: '👔',
    title: 'Manager',
    description: 'I approve team expense claims',
  },
  {
    value: 'employee' as UserRole,
    emoji: '👥',
    title: 'Employee',
    description: 'I submit expense claims for reimbursement',
  },
]

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = 
    useState<UserRole>('owner')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmation, setShowConfirmation] = 
    useState(false)

  const showInviteCode =
    selectedRole === 'employee' ||
    selectedRole === 'manager'

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
      setError('Password must be at least 8 characters')
      return
    }
    if (showInviteCode && !inviteCode.trim()) {
      setError('Please enter your company invite code')
      return
    }

    setLoading(true)

    try {
      // Validate invite code for employee and manager
      if (showInviteCode && inviteCode.trim()) {
        const { data: company, error: companyError } =
          await supabase
            .from('companies')
            .select('id, name')
            .eq('id', inviteCode.trim())
            .single()

        if (companyError || !company) {
          setError(
            'Invalid invite code. Please check with your employer.'
          )
          setLoading(false)
          return
        }
      }

      // Sign up the user
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: selectedRole,
            },
            emailRedirectTo:
              `${window.location.origin}/auth/callback`,
          },
        })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Email already registered
      if (data.user?.identities?.length === 0) {
        setError(
          'An account with this email already exists. Please log in.'
        )
        return
      }

      // Link employee or manager to company
      if (
        showInviteCode &&
        inviteCode.trim() &&
        data.user
      ) {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('id', inviteCode.trim())
          .single()

        if (company) {
          // @ts-ignore
          await supabase
            .from('profiles')
            .update({
              company_id: (company as any).id,
              role: selectedRole,
              can_approve: selectedRole === 'manager',
              onboarded: true,
            })
            .eq('id', data.user.id)
        }
      }

      // Email confirmation required
      if (!data.session) {
        setShowConfirmation(true)
        return
      }

      // No confirmation needed
      if (showInviteCode) {
        router.push('/capture')
      } else {
        router.push('/onboarding/company')
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 
        flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white 
          rounded-2xl shadow-sm border 
          border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 
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
          <p className="text-sm font-medium 
            text-gray-900 mb-6">
            {email}
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Click the link in your email to activate 
            your Snap Claim account. You will be 
            redirected to your dashboard automatically.
          </p>
          <Link
            href="/login"
            className="text-sm text-green-700 
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

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" showTagline={true} />
        </div>

        <div className="bg-white rounded-2xl 
          shadow-sm border border-gray-200 p-8">

          <h2 className="text-xl font-bold 
            text-gray-900 mb-6">
            Create your account
          </h2>

          {/* Full name */}
          <div className="mb-4">
            <label className="block text-sm 
              font-medium text-gray-700 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => 
                setFullName(e.target.value)}
              placeholder="Sarah Tan"
              className="w-full px-4 py-2.5 border 
                border-gray-300 rounded-lg text-sm 
                focus:outline-none focus:ring-2 
                focus:ring-green-600 
                focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm 
              font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => 
                setEmail(e.target.value)}
              placeholder="sarah@company.com"
              className="w-full px-4 py-2.5 border 
                border-gray-300 rounded-lg text-sm 
                focus:outline-none focus:ring-2 
                focus:ring-green-600 
                focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-sm 
              font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => 
                setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-2.5 border 
                border-gray-300 rounded-lg text-sm 
                focus:outline-none focus:ring-2 
                focus:ring-green-600 
                focus:border-transparent"
            />
          </div>

          {/* Role selector */}
          <div className="mb-4">
            <label className="block text-sm 
              font-medium text-gray-700 mb-2">
              How will you use Snap Claim?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => 
                    setSelectedRole(role.value)}
                  className={`text-left p-3 
                    rounded-xl border-2 
                    transition-all
                    ${selectedRole === role.value
                      ? 'border-green-700 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="text-xl mb-1">
                    {role.emoji}
                  </div>
                  <div className="text-xs font-semibold 
                    text-gray-900">
                    {role.title}
                  </div>
                  <div className="text-xs text-gray-500 
                    mt-0.5 leading-tight">
                    {role.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Invite code — only for employee/manager */}
          {showInviteCode && (
            <div className="mb-4 p-4 bg-blue-50 
              rounded-lg border border-blue-200">
              <label className="block text-sm 
                font-medium text-gray-700 mb-1.5">
                Company invite code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) =>
                  setInviteCode(e.target.value.trim())}
                placeholder="Enter code from your employer"
                className="w-full px-4 py-2.5 border 
                  border-gray-300 rounded-lg text-sm 
                  bg-white focus:outline-none 
                  focus:ring-2 focus:ring-green-600 
                  focus:border-transparent"
              />
              <p className="text-xs text-gray-500 
                mt-1.5">
                Ask your employer for the company 
                invite code from their Settings page
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 
              border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-green-700 
              text-white py-2.5 rounded-lg 
              text-sm font-medium 
              hover:bg-green-800 
              transition-colors
              disabled:opacity-50 
              disabled:cursor-not-allowed
              flex items-center 
              justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 
                  border-white border-t-transparent 
                  rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>

          {/* Login link */}
          <p className="text-center text-sm 
            text-gray-500 mt-4">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-green-700 font-medium 
                hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
