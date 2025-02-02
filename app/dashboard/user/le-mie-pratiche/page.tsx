"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Pratica } from "../types"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LeMiePratiche() {
  const [pratiche, setPratiche] = useState<Pratica[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    loadPratiche()
  }, [])

  const loadPratiche = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('practices')
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/user')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Le Mie Pratiche</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : pratiche.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Non hai ancora pratiche in corso</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pratiche.map((pratica) => (
            <div key={pratica.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">Pratica #{pratica.pratica_number}</h2>
                  <p className="text-gray-600">Dipendente: {pratica.employee_name}</p>
                  <p className="text-gray-600">Contratto: {pratica.contract_type}</p>
                  <p className="text-gray-600">Stato: {pratica.status}</p>
                </div>

                <div className="space-y-2">
                  {pratica.status === 'pending_payment' && !pratica.payment_receipt && (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 