import { redirect } from 'next/navigation'
import { createServerClient } from 
  '@/lib/supabase-server'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { session } } = 
    await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 
      flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center 
            gap-2 mb-2">
            <div className="w-8 h-8 bg-green-700 
              rounded-lg flex items-center 
              justify-center">
              <span className="text-white text-sm 
                font-bold">S</span>
            </div>
            <span className="text-xl font-bold 
              text-gray-900">Snap Claim</span>
          </div>
          <p className="text-sm text-gray-500">
            Snap. Submit. Done.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
