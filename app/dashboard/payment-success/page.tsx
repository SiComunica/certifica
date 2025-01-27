"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function PaymentSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    toast.success("Pagamento completato con successo!")
    // Redirect dopo 3 secondi
    setTimeout(() => {
      router.push('/dashboard/pratiche')
    }, 3000)
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Pagamento Completato!</h1>
      <p>Stai per essere reindirizzato alla lista delle pratiche...</p>
    </div>
  )
} 