"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  FileText, 
  Settings, 
  Tag, 
  Percent,
  Handshake
} from "lucide-react"

const sidebarItems = [
  {
    title: "Templates",
    href: "/dashboard/admin/templates",
    icon: FileText
  },
  {
    title: "Tariffe",
    href: "/dashboard/admin/rates",
    icon: Tag
  },
  {
    title: "Codici Sconto",
    href: "/dashboard/admin/discounts",
    icon: Percent
  },
  {
    title: "Convenzioni",
    href: "/dashboard/admin/conventions",
    icon: Handshake
  },
  {
    title: "Impostazioni",
    href: "/dashboard/admin/settings",
    icon: Settings
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Certifica</h2>
      </div>
      <nav className="space-y-1 px-3">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
