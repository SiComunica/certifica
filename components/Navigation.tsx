'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href="/dashboard/contratti"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith('/dashboard/contratti') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Contratti
          </Link>
        </div>
      </div>
    </nav>
  )
} 