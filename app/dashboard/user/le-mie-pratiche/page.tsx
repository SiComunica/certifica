"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowLeft, FileText, Send, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

interface Document {
  id: string
  file_name: string
  file_path: string
}

interface Pratica {
  id: string
  pratica_number: string
  status: string
  created_at: string
  contract_types?: {
    name: string
    code: string
  }
  employees?: {
    full_name: string
    fiscal_code: string
  }
  documents: Document[]
  contract_type_name?: string
  employee_name?: string
}

export default function LeMiePratiche() {
  const [pratiche, setPratiche] = useState<Pratica[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const loadPratiche = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Utente non autenticato")
        router.push('/login')
        return
      }

      console.log('User ID:', user.id) // Debug

      // Semplifichiamo la query
      const { data: practices, error } = await supabase
        .from('practices')
        .select(`
          id,
          pratica_number,
          status,
          created_at,
          employee_name,
          contract_type,
          documents
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('Query result:', { data: practices, error }) // Debug

      if (error) {
        console.error('Query error:', error)
        throw error
      }

      if (!practices) {
        console.log('No practices found')
        setPratiche([])
        return
      }

      const formattedPratiche = practices.map(pratica => ({
        ...pratica,
        contract_type_name: pratica.contract_type || 'Non specificato',
        employee_name: pratica.employee_name || 'Non specificato',
        documents: Array.isArray(pratica.documents) ? pratica.documents : []
      }))

      console.log('Formatted practices:', formattedPratiche) // Debug
      setPratiche(formattedPratiche)

    } catch (error) {
      console.error('Errore completo:', error)
      toast.error("Errore nel caricamento delle pratiche")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPratiche()
  }, [])

  const handleUploadRicevuta = async (praticaId: string) => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.pdf,.jpg,.jpeg,.png'
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const fileName = `ricevute/${praticaId}/${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { error: updateError } = await supabase
          .from('practices')
          .update({ status: 'pending_review' })
          .eq('id', praticaId)

        if (updateError) throw updateError

        toast.success('Ricevuta caricata con successo')
        loadPratiche() // Ricarica le pratiche
      } catch (error) {
        console.error('Errore upload:', error)
        toast.error("Errore nel caricamento della ricevuta")
      }
    }

    fileInput.click()
  }

  const handleInviaCommissione = async (praticaId: string) => {
    try {
      const { error } = await supabase
        .from('practices')
        .update({ status: 'submitted_to_commission' })
        .eq('id', praticaId)

      if (error) throw error

      toast.success('Pratica inviata alla commissione')
      loadPratiche()
    } catch (error) {
      console.error('Errore invio:', error)
      toast.error("Errore nell'invio alla commissione")
    }
  }

  const handleConfirmHearing = async (praticaId: string) => {
    try {
      // Prima otteniamo i dati della pratica
      const { data: pratica, error: fetchError } = await supabase
        .from('practices')
        .select(`
          *,
          users:user_id (
            email,
            full_name
          )
        `)
        .eq('id', praticaId)
        .single()

      if (fetchError) throw fetchError

      // Log per l'amministratore
      console.log(`Pratica #${pratica.pratica_number} - Utente: ${pratica.users.full_name} (${pratica.users.email})`)

      const { error } = await supabase
        .from('practices')
        .update({ 
          hearing_confirmed: true,
          hearing_confirmation_date: new Date().toISOString(),
          hearing_confirmation_user: pratica.users.full_name,
          hearing_confirmation_number: pratica.pratica_number
        })
        .eq('id', praticaId)

      if (error) throw error
      toast.success(`Partecipazione confermata per pratica #${pratica.pratica_number}`)
      loadPratiche()
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nella conferma")
    }
  }

  const handleRequestNewDate = async (praticaId: string) => {
    try {
      // Prima otteniamo i dati della pratica
      const { data: pratica, error: fetchError } = await supabase
        .from('practices')
        .select(`
          *,
          users:user_id (
            email,
            full_name
          )
        `)
        .eq('id', praticaId)
        .single()

      if (fetchError) throw fetchError

      // Log per l'amministratore
      console.log(`Pratica #${pratica.pratica_number} - Utente: ${pratica.users.full_name} (${pratica.users.email})`)

      const { error } = await supabase
        .from('practices')
        .update({ 
          hearing_confirmed: false,
          hearing_needs_reschedule: true,
          hearing_reschedule_user: pratica.users.full_name,
          hearing_reschedule_number: pratica.pratica_number
        })
        .eq('id', praticaId)

      if (error) throw error
      toast.success(`Richiesta nuova data inviata per pratica #${pratica.pratica_number}`)
      loadPratiche()
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nella richiesta")
    }
  }

  const handleAudizione = async (praticaId: string) => {
    // TODO: Implementare gestione audizione
    toast.info("Funzionalità in sviluppo")
  }

  return (
    <div className="container mx-auto p-4">
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
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : pratiche.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Nessuna pratica trovata</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pratiche.map((pratica) => {
            console.log('Rendering pratica:', pratica)
            return (
              <div 
                key={pratica.id}
                className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">
                    Pratica #{pratica.pratica_number || 'N/A'}
                  </h3>
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                    {pratica.status === 'pending_payment' ? 'In attesa di pagamento' : 
                     pratica.status === 'pending_review' ? 'In revisione' : 
                     pratica.status === 'submitted_to_commission' ? 'Inviata alla commissione' : 
                     pratica.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Dipendente:</span>{' '}
                    {pratica.employee_name}
                  </p>
                  <p>
                    <span className="font-medium">Tipo contratto:</span>{' '}
                    {pratica.contract_type_name}
                  </p>
                  <p>
                    <span className="font-medium">Data creazione:</span>{' '}
                    {new Date(pratica.created_at).toLocaleDateString('it-IT')}
                  </p>
                  
                  {pratica.documents.length > 0 && (
                    <div>
                      <span className="font-medium">Documenti:</span>
                      <ul className="ml-4">
                        {pratica.documents.map(doc => (
                          <li key={doc.id}>{doc.file_name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {pratica.status === 'pending_payment' && (
                    <Button 
                      onClick={() => handleUploadRicevuta(pratica.id)}
                      className="w-full"
                      variant="outline"
                    >
                      Carica ricevuta di pagamento
                    </Button>
                  )}

                  {pratica.status === 'pending_review' && (
                    <Button 
                      onClick={() => handleInviaCommissione(pratica.id)}
                      className="w-full"
                      variant="outline"
                    >
                      Invia alla commissione
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 