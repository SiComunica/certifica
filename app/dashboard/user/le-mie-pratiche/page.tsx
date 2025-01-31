"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Pratica } from "../types"

export default function LeMiePratiche() {
  const [pratiche, setPratiche] = useState<Pratica[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadPratiche()
  }, [])

  const loadPratiche = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('pratiche')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPratiche(data || [])
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nel caricamento delle pratiche")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadReceipt = async (praticaId: string, file: File) => {
    try {
      // 1. Carica la ricevuta su storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('receipts')
        .upload(`${praticaId}/${file.name}`, file)

      if (uploadError) throw uploadError

      // 2. Aggiorna la pratica con il riferimento alla ricevuta
      const { error: updateError } = await supabase
        .from('pratiche')
        .update({ 
          receipt_path: uploadData.path,
          status: 'pending_review'
        })
        .eq('id', praticaId)

      if (updateError) throw updateError

      toast.success("Ricevuta caricata con successo")
      loadPratiche()
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nel caricamento della ricevuta")
    }
  }

  const handleSubmitToCommission = async (praticaId: string) => {
    try {
      const { error } = await supabase
        .from('pratiche')
        .update({ 
          status: 'submitted_to_commission',
          submitted_at: new Date().toISOString()
        })
        .eq('id', praticaId)

      if (error) throw error

      toast.success("Pratica inviata alla commissione")
      loadPratiche()
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nell'invio alla commissione")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Le Mie Pratiche</h1>
      
      {isLoading ? (
        <div>Caricamento...</div>
      ) : (
        <div className="space-y-6">
          {pratiche.map((pratica: Pratica) => (
            <div key={pratica.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">Pratica #{pratica.pratica_number}</h2>
                  <p className="text-gray-600">Dipendente: {pratica.employee_name}</p>
                  <p className="text-gray-600">Contratto: {pratica.contract_type_name}</p>
                  <p className="text-gray-600">Stato: {pratica.status}</p>
                  <p className="text-gray-600">Importo: €{pratica.total_amount.toFixed(2)}</p>
                </div>

                <div className="space-y-2">
                  {pratica.status === 'pending_payment' && !pratica.receipt_path && (
                    <div>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleUploadReceipt(pratica.id, file)
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="mb-2"
                      />
                      <p className="text-sm text-gray-500">Carica la ricevuta di pagamento</p>
                    </div>
                  )}

                  {pratica.receipt_path && pratica.status === 'pending_review' && (
                    <Button
                      onClick={() => handleSubmitToCommission(pratica.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Invia alla Commissione
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 