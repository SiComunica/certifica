"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { Resend } from 'resend'

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY)

interface Practice {
  id: string
  user_id: string
  receipt_url: string
  amount: number
  status: string
  receipt_uploaded_at: string
  users: {
    email: string
    full_name: string
  }
}

export default function VerifyReceiptsPage() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Carica le pratiche da verificare
  const loadPractices = async () => {
    try {
      const { data, error } = await supabase
        .from('practices')
        .select(`
          *,
          users (
            email,
            full_name
          )
        `)
        .eq('status', 'receipt_verification')
        .order('receipt_uploaded_at', { ascending: false })

      if (error) throw error
      setPractices(data || [])

    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nel caricamento pratiche")
    } finally {
      setLoading(false)
    }
  }

  // Gestisce la verifica del pagamento
  const handleVerification = async (practice: Practice, approved: boolean) => {
    try {
      setLoading(true)

      // 1. Aggiorna lo stato della pratica
      const { error: updateError } = await supabase
        .from('practices')
        .update({ 
          status: approved ? 'paid' : 'rejected',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', practice.id)

      if (updateError) throw updateError

      // 2. Invia email di notifica
      const emailTemplate = approved ? 'paymentApproved' : 'paymentRejected'
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: practice.users.email,
          template: emailTemplate,
          data: {
            userName: practice.users.full_name,
            practiceId: practice.id,
            amount: practice.amount,
            verificationDate: new Date().toLocaleDateString(),
            rejectionReason: approved ? undefined : 'Ricevuta non valida o non corrispondente'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Errore nell\'invio dell\'email')
      }

      toast.success(approved ? 
        "Pagamento verificato e approvato" : 
        "Pagamento rifiutato"
      )

      // 3. Ricarica le pratiche
      loadPractices()

    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore durante la verifica")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verifica Ricevute</h1>

      {loading ? (
        <div className="flex justify-center">
          <p>Caricamento...</p>
        </div>
      ) : practices.length === 0 ? (
        <p className="text-center text-gray-500">
          Nessuna ricevuta da verificare
        </p>
      ) : (
        <div className="space-y-4">
          {practices.map((practice) => (
            <div key={practice.id} 
              className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-medium">Pratica #{practice.id}</h3>
                  <p className="text-sm text-gray-600">
                    Utente: {practice.users.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Importo: €{practice.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Caricata il: {new Date(practice.receipt_uploaded_at).toLocaleString()}
                  </p>
                  {practice.receipt_url && (
                    <a 
                      href={practice.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Visualizza Ricevuta
                    </a>
                  )}
                </div>
                
                <div className="space-x-2">
                  <button
                    onClick={() => handleVerification(practice, true)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Approva
                  </button>
                  <button
                    onClick={() => handleVerification(practice, false)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Rifiuta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 