"use client"

import { FileText, History, CreditCard, Home } from "lucide-react"
import Link from "next/link"

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        <Link 
          href="/dashboard/user" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link 
          href="/dashboard/nuova-pratica" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <FileText className="h-5 w-5" />
          <span>Nuova Pratica</span>
        </Link>
        <Link 
          href="/dashboard/storico-pratiche" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <History className="h-5 w-5" />
          <span>Storico Pratiche</span>
        </Link>
        <Link 
          href="/dashboard/storico-pagamenti" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <CreditCard className="h-5 w-5" />
          <span>Storico Pagamenti</span>
        </Link>
      </nav>
    </aside>
  )
} 