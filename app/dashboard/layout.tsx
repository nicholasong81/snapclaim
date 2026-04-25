import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import BottomNav from '@/components/dashboard/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()

  // Get session
  const { data: sessionData } = 
    await supabase.auth.getSession()
  
  const session = sessionData?.session

  if (!session) {
    redirect('/login')
  }

  // Get profile with explicit typing
  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, role, company_id, onboarded')
    .eq('id', session.user.id)
    .single() as any

  // Type guard — redirect if no profile
  if (!profileData) {
    redirect('/login')
  }

  // Redirect to onboarding if not complete
  if (!profileData.onboarded) {
    redirect('/onboarding/company')
  }

  // Get inbox count — only if company exists
  let inboxCount = 0
  let companyName = 'My Company'

  if (profileData.company_id) {
    const { count } = await supabase
      .from('receipts')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', profileData.company_id)
      .eq('status', 'inbox')

    inboxCount = count ?? 0

    // Get company name
    const { data: companyData } = await supabase
      .from('companies')
      .select('name')
      .eq('id', profileData.company_id)
      .single() as any

    companyName = companyData?.name ?? 'My Company'
  }

  return (
    <div className="flex h-screen bg-gray-50 
      overflow-hidden">
      
      {/* Sidebar — hidden on mobile */}
      <aside className="w-60 bg-white border-r 
        border-gray-200 flex-shrink-0 
        hidden md:block">
        <Sidebar
          inboxCount={inboxCount}
          userRole={profileData.role ?? 'owner'}
          companyName={companyName}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto 
        flex flex-col">
        
        <TopBar
          fullName={profileData.full_name}
          role={profileData.role ?? 'owner'}
        />

        {/* Page content */}
        <div className="flex-1 p-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav inboxCount={inboxCount} />
    </div>
  )
}
