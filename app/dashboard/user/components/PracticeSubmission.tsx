"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UploadReceipt } from "./UploadReceipt"
import { Send } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface PracticeSubmissionProps {
  practiceId: string
}

export function PracticeSubmission({ practiceId }: PracticeSubmissionProps) {
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmitPractice = async () => {
    if (!receiptUploaded) {
      toast.error("Carica prima la ricevuta di pagamento")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Aggiorniamo lo stato della pratica
      const { error: practiceError } = await supabase
        .from('practices')
        .update({ 
          status: 'submitted_to_commission',
          submitted_at: new Date().toISOString(),
          commission_submission_date: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (practiceError) throw practiceError

      // 2. Creiamo una notifica per la commissione
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'new_practice_submission',
          title: 'Nuova pratica da valutare',
          message: `È stata inviata una nuova pratica (ID: ${practiceId}) per la valutazione`,
          practice_id: practiceId,
          recipient_type: 'commission'
        })

      if (notificationError) {
        console.error('Errore notifica:', notificationError)
      }

      // 3. Aggiorniamo la practice_history
      const { error: historyError } = await supabase
        .from('practice_history')
        .insert({
          practice_id: practiceId,
          action: 'submitted_to_commission',
          description: 'Pratica inviata alla commissione',
          created_at: new Date().toISOString()
        })

      if (historyError) {
        console.error('Errore storico:', historyError)
      }

      toast.success("Pratica inviata con successo alla commissione")
      
      // 4. Redirect alla dashboard utente
      setTimeout(() => {
        window.location.href = '/dashboard/user'
      }, 1500)

    } catch (error: any) {
      console.error('Errore:', error)
      toast.error("Errore nell'invio della pratica")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8 space-y-6 border-t pt-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800">
          Una volta effettuato il pagamento su PagoPA:
        </p>
        <ol className="mt-2 list-decimal list-inside space-y-1 text-blue-800">
          <li>Carica qui sotto la ricevuta di pagamento</li>
          <li>Clicca su "Invia Pratica" per completare la procedura</li>
        </ol>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-medium mb-3">Carica Ricevuta</h3>
          <UploadReceipt 
            practiceId={practiceId}
            onUploadComplete={() => setReceiptUploaded(true)}
          />
        </div>

        <div>
          <h3 className="font-medium mb-3">Invia Pratica</h3>
          <Button
            onClick={handleSubmitPractice}
            disabled={!receiptUploaded || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              "Invio in corso..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Invia Pratica alla Commissione
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 