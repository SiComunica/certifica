"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Send } from "lucide-react"
import { toast } from "sonner"

interface Practice {
  id: string
  created_at: string
  status: string
  practice_number?: string
  receipt_url?: string
  employee_name: string
  title?: string
  description?: string
  priority?: string
}

export function PendingPractices() {
  const [pendingPractices, setPendingPractices] = useState<Practice[]>([])
  const [isUploading, setIsUploading] = useState<string | null>(null)
  const [isSending, setIsSending] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchPendingPractices = async () => {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .in('status', ['payment_pending', 'receipt_uploaded'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore nel recupero pratiche:', error)
      return
    }

    if (data) {
      console.log('Pratiche recuperate:', data) // Debug
      setPendingPractices(data as Practice[])
    }
  }

  useEffect(() => {
    fetchPendingPractices()

    const channel = supabase
      .channel('pending_practices')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'practices'
      }, () => {
        fetchPendingPractices()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleUploadReceipt = async (practiceId: string) => {
    try {
      setIsUploading(practiceId)

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf,.jpg,.jpeg,.png'
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) {
          setIsUploading(null)
          return
        }

        // 1. Crea un nome file univoco
        const fileExt = file.name.split('.').pop()
        const fileName = `receipts/${practiceId}_${Date.now()}.${fileExt}`

        // 2. Upload del file nel bucket 'uploads'
        const { data, error: uploadError } = await supabase
          .storage
          .from('uploads')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // 3. Ottieni l'URL pubblico
        const { data: { publicUrl } } = supabase
          .storage
          .from('uploads')
          .getPublicUrl(fileName)

        // 4. Aggiorna la pratica - MODIFICATO per usare il campo documents
        const { error: updateError } = await supabase
          .from('practices')
          .update({ 
            documents: {
              receipt: {
                path: fileName,
                url: publicUrl
              }
            },
            status: 'receipt_uploaded',
            updated_at: new Date().toISOString()
          })
          .eq('id', practiceId)

        if (updateError) throw updateError

        toast.success('Ricevuta caricata con successo')
        await fetchPendingPractices()
      }

      input.click()

    } catch (error: any) {
      console.error('Errore:', error)
      toast.error(error.message || "Errore durante il caricamento della ricevuta")
    } finally {
      setIsUploading(null)
    }
  }

  const handleSendToCommission = async (practiceId: string) => {
    try {
      setIsSending(practiceId)

      // 1. Prima verifichiamo che la pratica esista e abbia la ricevuta
      const { data: practice, error: fetchError } = await supabase
        .from('practices')
        .select('*')
        .eq('id', practiceId)
        .single()

      if (fetchError) throw fetchError
      if (!practice) throw new Error('Pratica non trovata')
      if (!practice.documents?.receipt) throw new Error('Ricevuta non trovata')

      // 2. Aggiorniamo lo stato della pratica
      const { error: updateError } = await supabase
        .from('practices')
        .update({ 
          status: 'submitted_to_commission',
          submission_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          priority: 'normal',
          title: `Nuova pratica per ${practice.employee_name}`,
          description: 'Pratica inviata alla commissione in attesa di assegnazione'
        })
        .eq('id', practiceId)

      if (updateError) throw updateError

      toast.success('Pratica inviata alla commissione con successo')
      await fetchPendingPractices() // Aggiorniamo la lista

    } catch (error: any) {
      console.error('Errore durante invio alla commissione:', error)
      toast.error(error.message || "Errore durante l'invio alla commissione")
    } finally {
      setIsSending(null)
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-4">Pratiche in attesa di completamento</h2>
      
      {pendingPractices.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500 text-center">
            Non ci sono pratiche in attesa di completamento
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingPractices.map((practice) => (
            <Card key={practice.id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-medium">Pratica #{practice.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-500">
                    Creata il: {new Date(practice.created_at).toLocaleDateString('it-IT')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stato: {
                      practice.status === 'payment_pending' 
                        ? 'In attesa di ricevuta' 
                        : practice.status === 'receipt_uploaded'
                          ? 'Ricevuta caricata - Pronta per invio'
                          : 'In elaborazione'
                    }
                  </p>
                  {/* Debug info */}
                  <p className="text-xs text-gray-400">Status: {practice.status}</p>
                </div>
                
                <div className="flex gap-2">
                  {practice.status === 'payment_pending' && (
                    <Button
                      onClick={() => handleUploadReceipt(practice.id)}
                      disabled={isUploading === practice.id}
                      variant="outline"
                    >
                      {isUploading === practice.id ? (
                        "Caricamento..."
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Carica Ricevuta
                        </>
                      )}
                    </Button>
                  )}
                  
                  {practice.status === 'receipt_uploaded' && (
                    <Button
                      onClick={() => handleSendToCommission(practice.id)}
                      disabled={isSending === practice.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSending === practice.id ? (
                        "Invio in corso..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Invia alla Commissione
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 