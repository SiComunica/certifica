"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function PaymentCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        const practiceId = searchParams.get('practiceId')
        
        if (!practiceId) {
          toast.error('ID pratica non trovato')
          setTimeout(() => router.push('/dashboard/user'), 2000)
          return
        }

        // Aggiorna lo stato della pratica
        const { error } = await supabase
          .from('practices')
          .update({ 
            status: 'paid',
            payment_date: new Date().toISOString()
          })
          .eq('id', practiceId)

        if (error) throw error

        toast.success('Pagamento completato con successo')
        setTimeout(() => router.push('/dashboard/user'), 2000)

      } catch (error: any) {
        console.error('Errore callback:', error)
        toast.error('Errore durante l\'aggiornamento del pagamento')
        setTimeout(() => router.push('/dashboard/user'), 2000)
      }
    }

    updatePaymentStatus()
  }, [searchParams, router])

  return (
    <div className="container mx-auto py-12">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <h2 className="text-2xl font-semibold">
              Elaborazione del pagamento in corso...
            </h2>
            <p className="text-gray-600">
              Attendi mentre verifichiamo lo stato del tuo pagamento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 