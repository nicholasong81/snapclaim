'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = 
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (error) {
        setError(error.message)
        return
      }

      if (!data.session) {
        setError(
          'Login failed — please check your ' +
          'email and password'
        )
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (e: unknown) {
      const msg = e instanceof Error 
        ? e.message 
        : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <Logo size="lg" showTagline={true} />
        </div>

        <div className="bg-white border-2 border-blue-700 rounded-lg p-6 shadow-lg shadow-blue-400/30">
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
              <div className="mt-2 text-right">
                <a 
                  href="/forgot-password" 
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 
                border border-red-300 rounded-lg">
                <p className="text-sm text-red-800">
                  {error}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Log in'
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
