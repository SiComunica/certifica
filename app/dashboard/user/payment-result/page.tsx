"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function PaymentResult() {
  const searchParams = useSearchParams()
  const practiceId = searchParams.get('practiceId')
  const esito = searchParams.get('esito')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const updatePracticeStatus = async () => {
      if (!practiceId || !esito) {
        setIsLoading(false)
        return
      }

      try {
        if (esito === 'OK') {
          const { error } = await supabase
            .from('practices')
            .update({
              payment_status: 'completed',
              payment_date: new Date().toISOString(),
              status: 'ready_to_submit'
            })
            .eq('id', practiceId)

          if (error) throw error
          toast.success('Pagamento completato con successo!')
        } else {
          const { error } = await supabase
            .from('practices')
            .update({
              payment_status: 'failed',
              status: 'payment_failed'
            })
            .eq('id', practiceId)

          if (error) throw error
          toast.error('Pagamento non riuscito')
        }
      } catch (error) {
        console.error('Errore:', error)
        toast.error('Errore nell\'aggiornamento dello stato della pratica')
      } finally {
        setIsLoading(false)
      }
    }

    updatePracticeStatus()
  }, [practiceId, esito])

  const handleSubmitToCommission = async () => {
    if (!practiceId) return

    try {
      setIsSubmitting(true)

      const { error } = await supabase
        .from('practices')
        .update({
          status: 'submitted',
          submission_date: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (error) throw error

      toast.success('Pratica inviata alla commissione con successo!')
      router.push('/dashboard/user')

    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nell\'invio della pratica')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardContent className="p-6">
          {esito === 'OK' ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <h2 className="text-2xl font-semibold">Pagamento Completato</h2>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">
                  Il pagamento è stato completato con successo.
                </p>
                <p className="text-green-600 mt-2">
                  Ora puoi inviare la pratica alla commissione per la valutazione.
                </p>
              </div>

              <Button
                onClick={handleSubmitToCommission}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  "Invia alla Commissione"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <XCircle className="h-8 w-8 text-red-600" />
                <h2 className="text-2xl font-semibold">Pagamento non riuscito</h2>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">
                  Si è verificato un problema con il pagamento.
                </p>
                <p className="text-red-600 mt-2">
                  Puoi riprovare il pagamento dalla dashboard delle tue pratiche.
                </p>
              </div>

              <Button
                onClick={() => router.push('/dashboard/user')}
                className="w-full"
              >
                Torna alla Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 