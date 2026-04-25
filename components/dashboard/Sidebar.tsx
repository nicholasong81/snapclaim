'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'

const navItems = [
  {
    label: 'Inbox',
    href: '/dashboard/inbox',
    icon: '📥',
    description: 'Review captured receipts'
  },
  {
    label: 'Expenses',
    href: '/dashboard/expenses',
    icon: '📊',
    description: 'Track all expenses'
  },
  {
    label: 'Director Loan',
    href: '/dashboard/director-loan',
    icon: '💳',
    description: 'Personal payment ledger'
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: '📄',
    description: 'Export for accountant'
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: '⚙️',
    description: 'Company and team settings'
  },
]

interface SidebarProps {
  inboxCount?: number
  userRole?: string
  companyName?: string
}

export default function Sidebar({ 
  inboxCount = 0,
  userRole = 'owner',
  companyName = 'My Company'
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      
      {/* Logo area */}
      <div className="px-5 py-5 border-b 
        border-gray-100">
        <Logo size="sm" showTagline={false} />
        <div className="text-xs text-gray-400 mt-1 truncate max-w-32">
          {companyName}
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${isActive ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <span className="text-base leading-none">
                {item.icon}
              </span>
              <span className="flex-1">
                {item.label}
              </span>

              {/* Inbox badge */}
              {item.label === 'Inbox' && 
               inboxCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {inboxCount > 99 ? '99+' : inboxCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Role badge at bottom */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {userRole === 'owner' ? '👤' : 
               userRole === 'accountant' ? '📋' :
               userRole === 'manager' ? '👔' : '👤'}
            </span>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 capitalize">
              {userRole}
            </div>
            <div className="text-xs text-gray-400">
              Snap Claim
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
