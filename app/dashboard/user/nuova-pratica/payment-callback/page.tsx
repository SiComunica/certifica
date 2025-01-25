"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function PaymentCallback() {
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const practiceId = searchParams.get('practiceId')
        if (!practiceId) throw new Error("ID pratica mancante")

        // Verifica lo stato del pagamento
        const { data: practice, error } = await supabase
          .from('practices')
          .select('payment_status')
          .eq('id', practiceId)
          .single()

        if (error) throw error

        setPaymentStatus(practice.payment_status)
      } catch (error: any) {
        console.error('Errore verifica pagamento:', error)
        toast.error("Errore durante la verifica del pagamento")
      } finally {
        setIsLoading(false)
      }
    }

    checkPaymentStatus()
  }, [searchParams])

  const handleSubmitPractice = async () => {
    try {
      setIsLoading(true)
      const practiceId = searchParams.get('practiceId')
      
      const { error } = await supabase
        .from('practices')
        .update({
          status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (error) throw error

      toast.success("Pratica inviata con successo")
      router.push('/dashboard/user')
    } catch (error: any) {
      console.error('Errore invio pratica:', error)
      toast.error("Errore durante l'invio della pratica")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">
            {paymentStatus === 'completed' 
              ? "Pagamento completato con successo!"
              : "Verifica pagamento in corso..."}
          </h1>
          
          {paymentStatus === 'completed' ? (
            <>
              <p className="text-green-600 mb-6">
                Il pagamento è stato processato correttamente. 
                Ora puoi inviare la pratica alla commissione.
              </p>
              <Button 
                onClick={handleSubmitPractice}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  "Invia Pratica alla Commissione"
                )}
              </Button>
            </>
          ) : (
            <p className="text-gray-600">
              Stiamo verificando lo stato del tuo pagamento. 
              Questo processo potrebbe richiedere qualche istante.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 