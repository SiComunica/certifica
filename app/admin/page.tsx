"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Caricamento...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Benvenuto {user.email}</p>
    </div>
  )
}