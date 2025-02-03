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
      const { data: session } = await supabase.auth.getSession()
      
      if (!session?.session?.user) {
        console.error('Sessione non valida')
        toast.error("Sessione scaduta, effettua di nuovo il login")
        router.push('/login')
        return
      }

      const user = session.session.user
      console.log('Sessione valida per:', user.email)

      // Prima query senza filtro per vedere tutti gli stati
      const { data: allPractices } = await supabase
        .from('practices')
        .select('status')
        .eq('user_id', user.id)

      console.log('Stati presenti:', allPractices?.map(p => p.status))

      // Query pratiche filtrata
      const { data: practices, error } = await supabase
        .from('practices')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending_payment', 'pending_review', 'submitted_to_commission'])
        .order('created_at', { ascending: false })

      if (error) throw error

      // Usa Array.from invece di spread operator per Set
      const uniqueStates = Array.from(new Set(practices?.map(p => p.status) || []))

      console.log('Pratiche filtrate per stato:', {
        totali: allPractices?.length || 0,
        filtrate: practices?.length || 0,
        statiTrovati: uniqueStates
      })

      if (!practices || practices.length === 0) {
        console.log('Nessuna pratica trovata')
        setPratiche([])
        return
      }

      // Query contratti
      const { data: contractTypes } = await supabase
        .from('contract_types')
        .select('*')

      // Crea mappa dei contratti con normalizzazione
      const contractMap = new Map()
      contractTypes?.forEach(contract => {
        contractMap.set(contract.id.toString(), contract.name)
        contractMap.set(contract.code.toLowerCase(), contract.name)
        contractMap.set(contract.name.toLowerCase(), contract.name)
      })

      console.log('Mappa contratti:', Object.fromEntries(contractMap))

      // Formatta dati con fallback
      const formattedPratiche = practices?.map(pratica => {
        const contractType = pratica.contract_type?.toString().toLowerCase()
        const contractName = contractMap.get(contractType) || 'Tipo contratto non specificato'
        
        console.log('Mapping contratto:', {
          original: pratica.contract_type,
          normalized: contractType,
          mapped: contractName
        })

        return {
          ...pratica,
          contract_type_name: contractName,
          user_email: user.email
        }
      }) || []

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
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : pratiche.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Nessuna pratica trovata</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pratiche.map((pratica) => (
            <div 
              key={pratica.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">
                Pratica #{pratica.pratica_number}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Tipo:</span>{' '}
                  {pratica.contract_type_name}
                </p>
                <p>
                  <span className="font-medium">Stato:</span>{' '}
                  {pratica.status === 'pending_payment' ? 'In attesa di pagamento' : 
                   pratica.status === 'pending_review' ? 'In revisione' : 
                   pratica.status === 'submitted_to_commission' ? 'Inviata alla commissione' : 
                   pratica.status}
                </p>
                <p>
                  <span className="font-medium">Data:</span>{' '}
                  {new Date(pratica.created_at).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 