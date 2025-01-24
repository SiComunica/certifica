"use client"

import { FileText, History, CreditCard, Home, LayoutDashboard, FilePlus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard/user",
      icon: LayoutDashboard,
    },
    {
      title: "Nuova Pratica",
      href: "/dashboard/user/nuova-pratica",
      icon: FilePlus,
    },
    {
      title: "Storico Pratiche",
      href: "/dashboard/storico-pratiche",
      icon: History,
    },
    {
      title: "Storico Pagamenti",
      href: "/dashboard/storico-pagamenti",
      icon: CreditCard,
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md",
              pathname === item.href
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  )
} 