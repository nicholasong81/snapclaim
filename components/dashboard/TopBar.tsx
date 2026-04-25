'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface TopBarProps {
  fullName?: string | null
  role?: string
  pageTitle?: string
}

export default function TopBar({
  fullName,
  role,
  pageTitle = 'Dashboard'
}: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  const initials = fullName
    ? fullName.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'SC'

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="h-14 bg-white border-b 
      border-gray-200 flex items-center 
      justify-between px-6 flex-shrink-0">
      
      {/* Page title */}
      <h1 className="text-base font-semibold 
        text-gray-900">
        {pageTitle}
      </h1>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        
        {/* Capture button — mobile shortcut */}
        <a
          href="/capture"
          className="hidden sm:flex items-center 
            gap-1.5 bg-green-700 text-white 
            text-xs font-medium px-3 py-1.5 
            rounded-full hover:bg-green-800 
            transition-colors"
        >
          <span>📸</span>
          <span>Snap Receipt</span>
        </a>

        {/* User avatar and dropdown */}
        <div className="relative group">
          <button className="flex items-center 
            gap-2 hover:opacity-80 
            transition-opacity">
            <div className="w-8 h-8 rounded-full 
              bg-green-100 border border-green-200
              flex items-center justify-center">
              <span className="text-xs font-bold 
                text-green-800">
                {initials}
              </span>
            </div>
            <span className="hidden sm:block 
              text-sm text-gray-700 max-w-28 
              truncate">
              {fullName || 'User'}
            </span>
            <span className="text-gray-400 
              text-xs">▾</span>
          </button>

          {/* Dropdown menu */}
          <div className="absolute right-0 top-10 
            w-48 bg-white border border-gray-200 
            rounded-lg shadow-lg opacity-0 
            invisible group-hover:opacity-100 
            group-hover:visible transition-all 
            duration-150 z-50">
            <div className="px-4 py-3 border-b 
              border-gray-100">
              <div className="text-xs font-medium 
                text-gray-900 truncate">
                {fullName}
              </div>
              <div className="text-xs text-gray-400 
                capitalize mt-0.5">
                {role}
              </div>
            </div>
            <div className="py-1">
              <a
                href="/dashboard/settings"
                className="block px-4 py-2 text-sm 
                  text-gray-700 hover:bg-gray-50"
              >
                Settings
              </a>
              <button
                onClick={handleSignOut}
                className="block w-full text-left 
                  px-4 py-2 text-sm text-red-600 
                  hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
