import { redirect } from 'next/navigation'
import { createServerClient } from 
  '@/lib/supabase-server'
import Logo from '@/components/Logo'

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
        <div className="flex justify-center mb-8">
          <Logo size="md" showTagline={true} />
        </div>
        {children}
      </div>
    </div>
  )
}
