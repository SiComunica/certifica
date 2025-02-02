"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Pratica } from "../types"
import { ArrowLeft, FileText, Send, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LeMiePratiche() {
  const [pratiche, setPratiche] = useState<Pratica[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const loadPratiche = async () => {
    try {
      // Verifica sessione
      const { data: session } = await supabase.auth.getSession()
      
      if (!session?.session?.user) {
        console.error('Sessione non valida')
        toast.error("Sessione scaduta, effettua di nuovo il login")
        router.push('/login')
        return
      }

      const user = session.session.user
      console.log('Sessione valida per:', user.email)
      console.log('User ID:', user.id)

      // Query pratiche con più dettagli
      const { data: practices, error } = await supabase
        .from('practices')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending_payment', 'pending_review', 'submitted_to_commission'])
        .order('created_at', { ascending: false })

      console.log('Query pratiche:', {
        userId: user.id,
        stati: ['pending_payment', 'pending_review', 'submitted_to_commission'],
        risultati: practices,
        errore: error
      })

      if (error) throw error

      if (!practices || practices.length === 0) {
        console.log('Nessuna pratica trovata')
        setPratiche([])
        return
      }

      // Query contratti con debug
      const { data: contractTypes, error: contractError } = await supabase
        .from('contract_types')
        .select('*')

      console.log('Tipi di contratto trovati:', contractTypes)

      if (contractError) {
        console.error('Errore query contratti:', contractError)
      }

      // Mappa contratti con debug
      const contractMap = new Map(
        contractTypes?.map(contract => {
          console.log('Mapping contratto:', contract)
          return [contract.id.toString(), contract.name]
        }) || []
      )

      // Formatta dati con debug
      const formattedPratiche = practices.map(pratica => {
        const contractName = contractMap.get(pratica.contract_type)
        console.log('Formattazione pratica:', {
          praticaId: pratica.id,
          contractType: pratica.contract_type,
          mappedName: contractName
        })
        return {
          ...pratica,
          contract_type_name: contractName || pratica.contract_type,
          user_email: user.email
        }
      })

      console.log('Pratiche formattate finale:', formattedPratiche)
      setPratiche(formattedPratiche)

    } catch (error) {
      console.error('Errore completo:', error)
      toast.error("Errore nel caricamento delle pratiche")
      
      if (error instanceof Error && error.message.includes('Invalid login credentials')) {
        router.push('/login')
      }
    }
  }

  useEffect(() => {
    loadPratiche()
  }, [])

  const handleUploadReceipt = async (praticaId: string, file: File) => {
    try {
      // 1. Carica il file
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('receipts')
        .upload(`${praticaId}/${file.name}`, file)

      if (uploadError) throw uploadError

      // 2. Aggiorna la pratica
      const { error: updateError } = await supabase
        .from('practices')
        .update({ 
          payment_receipt: uploadData.path,
          status: 'pending_review'  // Cambia lo stato
        })
        .eq('id', praticaId)

      if (updateError) throw updateError

      toast.success("Ricevuta caricata con successo")
      loadPratiche()  // Ricarica le pratiche
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nel caricamento della ricevuta")
    }
  }

  const handleSubmitToCommission = async (praticaId: string) => {
    try {
      const { error } = await supabase
        .from('practices')
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
            <div 
              key={pratica.id} 
              className="bg-white shadow-lg rounded-lg p-6 mb-4"
            >
              <div>
                <h2 className="text-xl font-semibold">
                  Pratica #{pratica.pratica_number}
                </h2>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Dipendente: {pratica.employee_name}</p>
                  <p>Contratto: {pratica.contract_type_name}</p>
                  <p>Stato: {pratica.status}</p>
                  <p>Data creazione: {new Date(pratica.created_at).toLocaleString('it-IT')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 