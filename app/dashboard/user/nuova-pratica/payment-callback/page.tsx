"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function PaymentCallback() {
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const esito = urlParams.get('esito')
    
    if (esito === 'KO') {
      toast.error("Pagamento non riuscito")
    }
    
    // Reindirizza allo step 4 mantenendo tutti i parametri
    router.push(`/dashboard/user/nuova-pratica?step=4${window.location.search}`)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="mt-4">Ritorno alla pratica...</span>
    </div>
  )
} 