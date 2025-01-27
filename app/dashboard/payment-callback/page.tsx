"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Practice {
  id: string
  status: string
  iuv: string
  employee_fiscal_code: string
}

export default function PaymentCallbackPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [practice, setPractice] = useState<Practice | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      const iuv = searchParams.get('iuv')
      
      // Recuperiamo la pratica dal DB
      const { data: practiceData } = await supabase
        .from('practices')
        .select('*')
        .eq('iuv', iuv)
        .single()

      if (!practiceData) {
        throw new Error('Pratica non trovata')
      }

      setPractice(practiceData)

      // Verifichiamo il pagamento
      const response = await fetch(`/api/verifica-pagamento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          iuv: iuv,
          codiceFiscale: practiceData.employee_fiscal_code
        })
      })

      const data = await response.json()

      if (data.esito === 0) {
        await supabase
          .from('practices')
          .update({ status: 'paid' })
          .eq('id', practiceData.id)

        setPaymentSuccess(true)
        toast.success('Pagamento completato con successo!')
      } else {
        toast.error('Pagamento non riuscito')
        setPaymentSuccess(false)
      }
    } catch (error) {
      console.error('Errore verifica pagamento:', error)
      toast.error("Errore durante la verifica del pagamento")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitToCommission = async () => {
    if (!practice) return

    try {
      await supabase
        .from('practices')
        .update({ status: 'submitted_to_commission' })
        .eq('id', practice.id)

      toast.success('Pratica inviata alla commissione con successo!')
      router.push('/dashboard/pratiche')
    } catch (error) {
      console.error('Errore invio alla commissione:', error)
      toast.error("Errore durante l'invio alla commissione")
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <p>Verifica pagamento in corso...</p>
    </div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {paymentSuccess ? 'Pagamento Completato' : 'Pagamento non riuscito'}
      </h1>

      {paymentSuccess ? (
        <div className="space-y-6">
          <p className="text-green-600">
            Il pagamento è stato completato con successo. Ora puoi inviare la pratica alla commissione.
          </p>
          <Button onClick={handleSubmitToCommission}>
            Invia alla Commissione
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-red-600">
            Il pagamento non è andato a buon fine. Puoi riprovare il pagamento.
          </p>
          <Button onClick={() => router.back()}>
            Riprova Pagamento
          </Button>
        </div>
      )}
    </div>
  )
} 