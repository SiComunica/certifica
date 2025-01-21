"use client"

import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar temporanea */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <a href="/dashboard/admin" className="hover:text-gray-300">
                Dashboard
              </a>
            </li>
            <li className="mb-2">
              <a href="/dashboard/admin/pratiche" className="hover:text-gray-300">
                Pratiche
              </a>
            </li>
            <li className="mb-2">
              <a href="/dashboard/admin/utenti" className="hover:text-gray-300">
                Utenti
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow p-4">
          <h1 className="text-xl font-semibold">Pannello Amministrazione</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 