"use client"

import { useState } from 'react'
import { AdminSidebar } from '@/components/dashboard/admin/AdminSidebar'
import { NotificationCenter } from "@/components/NotificationCenter"
import { UserNav } from "@/components/user-nav"
import { PracticeHistory } from "@/components/dashboard/admin/PracticeHistory"

interface LayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: LayoutProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Dashboard Amministrativa</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
          
          {currentUser && (
            <PracticeHistory 
              userId={currentUser.id}
              key={currentUser.id}
            />
          )}
        </main>
      </div>
    </div>
  )
} 