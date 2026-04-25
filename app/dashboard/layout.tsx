import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { 
  getServerProfile,
  getServerCompany,
  getServerInboxCount
} from '@/lib/db'
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

  const profile = await getServerProfile(
    session.user.id
  )

  if (!profile) {
    redirect('/login')
  }

  if (!profile.onboarded) {
    redirect('/onboarding/company')
  }

  let inboxCount = 0
  let companyName = 'My Company'

  if (profile.company_id) {
    inboxCount = await getServerInboxCount(
      profile.company_id
    )

    const company = await getServerCompany(
      profile.company_id
    )

    companyName = company?.name ?? 'My Company'
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
          userRole={profile.role ?? 'owner'}
          companyName={companyName}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto 
        flex flex-col">
        
        <TopBar
          fullName={profile.full_name}
          role={profile.role ?? 'owner'}
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
