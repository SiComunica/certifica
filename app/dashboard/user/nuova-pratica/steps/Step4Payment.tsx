"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step4Payment({ formData, setFormData }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClientComponentClient()

  const handlePayment = async () => {
    try {
      setIsProcessing(true)

      // Ottieni l'utente corrente
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Utente non autenticato")

      console.log('Form Data completo:', formData)

      // Trova la pratica più recente in bozza
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (practiceError) throw practiceError

      // Prepara i dati per la richiesta di pagamento
      const paymentData = {
        Email: user.email || '',
        Name: formData.step1?.employeeName,
        Surname: formData.step1?.employeeSurname,
        CF: formData.step1?.employeeFiscalCode,
      }

      console.log('Dati pagamento:', paymentData)

      // Invia la richiesta al nostro endpoint
      const response = await fetch('/api/payment/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData,
          practiceId: practice.id
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.details || 'Errore durante l\'avvio del pagamento')
      }

      // Aggiorna lo stato della pratica
      const { error: updateError } = await supabase
        .from('practices')
        .update({
          payment_started_at: new Date().toISOString(),
          payment_status: 'pending',
          employee_name: formData.step1?.employeeName,
          employee_surname: formData.step1?.employeeSurname,
          employee_fiscal_code: formData.step1?.employeeFiscalCode
        })
        .eq('id', practice.id)

      if (updateError) throw updateError

      // Redirect all'URL di pagamento
      window.location.href = responseData.redirectUrl

    } catch (error: any) {
      console.error('Errore dettagliato:', error)
      toast.error(error.message || "Errore durante l'avvio del pagamento")
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Riepilogo Pagamento</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Dati Dipendente</h3>
              <p>Nome: {formData.step1?.employeeName}</p>
              <p>Cognome: {formData.step1?.employeeSurname}</p>
              <p>Codice Fiscale: {formData.step1?.employeeFiscalCode}</p>
            </div>
            <div>
              <h3 className="font-medium">Dati Contratto</h3>
              <p>Tipo: {formData.step2?.contractType}</p>
              <p>Tariffa: €100,00</p>
            </div>
          </div>
          <div className="border-t mt-4 pt-4">
            <p className="text-gray-600">
              Stai per essere reindirizzato alla piattaforma di pagamento PagoPA.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reindirizzamento al pagamento...
            </>
          ) : (
            "Procedi al Pagamento"
          )}
        </Button>
      </div>
    </div>
  )
} 