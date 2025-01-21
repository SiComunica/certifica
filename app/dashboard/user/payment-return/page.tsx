"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function PaymentReturnPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pendingPayment = localStorage.getItem('pendingPayment')
    
    if (!pendingPayment) {
      toast.error("Nessun pagamento in corso trovato")
      router.push('/dashboard/user')
      return
    }

    const { practiceId } = JSON.parse(pendingPayment)

    // Mostriamo la pagina di upload ricevuta
    router.push(`/dashboard/user/upload-receipt/${practiceId}`)
    
    // Pulizia
    localStorage.removeItem('pendingPayment')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Ritorno dal Pagamento
        </h1>
        <p className="text-gray-600">
          Reindirizzamento in corso...
        </p>
      </div>
    </div>
  )
}   