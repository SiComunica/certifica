"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PracticeSubmission } from "./PracticeSubmission"

interface Step4PaymentProps {
  practiceId: string
  onPaymentComplete: () => void
}

export default function Step4Payment({ practiceId, onPaymentComplete }: Step4PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClientComponentClient()

  const handleStartPayment = async () => {
    setIsProcessing(true)
    try {
      // URL PagoPA con redirect
      const PAGOPA_URL = "https://solutionpa.intesasanpaolo.com/IntermediarioPaPortalFe/pagamenti/access?idDominioPA=80213750583"
      window.open(PAGOPA_URL, "_blank")

    } catch (error: any) {
      console.error('Errore:', error)
      toast.error("Errore durante l'avvio del pagamento")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Manteniamo il componente esistente invariato */}
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Pagamento tramite PagoPA</h3>
          <div className="text-sm text-gray-600">
            <p>Importo da pagare: €50.00</p>
            <p className="mt-1">
              Clicca su procedi al pagamento del totale e una volta effettuato il pagamento carica la ricevuta per inviare la pratica di certificazione
            </p>
          </div>
        </div>

        <Button
          onClick={handleStartPayment}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Elaborazione..." : "Procedi al Pagamento"}
        </Button>
      </div>

      {/* Aggiungiamo il componente per upload e invio pratica */}
      <PracticeSubmission practiceId={practiceId} />
    </>
  )
}