"use client"

import { NotificationCenter } from "@/components/NotificationCenter"
import { UserNav } from "@/components/user-nav"

interface LayoutProps {
  children: React.ReactNode
}

export default function UserLayout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Dashboard Utente</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <a href="/dashboard/user" className="hover:text-gray-300">
                Dashboard
              </a>
            </li>
            <li className="mb-2">
              <a href="/dashboard/user/pratiche" className="hover:text-gray-300">
                Le mie pratiche
              </a>
            </li>
            {/* ... altri link ... */}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Area Utente</h1>
          <div className="flex items-center gap-6"> {/* Stesso gap dell'admin */}
            <NotificationCenter />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 