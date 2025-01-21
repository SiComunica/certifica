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
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
      </div>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
} 