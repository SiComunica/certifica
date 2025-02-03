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
  contract_type?: string
}

export default function LeMiePratiche() {
  const [pratiche, setPratiche] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadPratiche = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('practices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setPratiche(data || [])
    setLoading(false)
  }

  const handleUploadRicevuta = async (praticaId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf'
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        toast.info('Caricamento ricevuta in corso...')

        const fileName = `ricevuta_${Date.now()}.pdf`
        
        await supabase.storage
          .from('uploads')
          .upload(fileName, file)

        await supabase
          .from('practices')
          .update({
            payment_receipt: fileName,
            status: 'pending_review'
          })
          .eq('id', praticaId)

        toast.success('Ricevuta caricata con successo!')
        await loadPratiche()
      } catch (error) {
        toast.error('Errore nel caricamento della ricevuta')
      }
    }

    input.click()
  }

  const handleInviaPratica = async (praticaId: string) => {
    try {
      toast.info('Invio pratica in corso...')

      await supabase
        .from('practices')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', praticaId)

      toast.success('Pratica inviata alla commissione!')
      await loadPratiche()
    } catch (error) {
      toast.error("Errore nell'invio della pratica")
    }
  }

  useEffect(() => {
    loadPratiche()
  }, [])

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
      
      {loading ? (
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
            <div key={pratica.id} className="bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">
                Pratica #{pratica.practice_number}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Stato: <span className="font-semibold">{pratica.status}</span>
                </p>
                {pratica.payment_receipt && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Ricevuta caricata
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {pratica.status === 'pending_payment' && (
                  <Button 
                    onClick={() => handleUploadRicevuta(pratica.id)}
                    className="w-full"
                  >
                    Carica Ricevuta
                  </Button>
                )}

                {pratica.status === 'pending_review' && (
                  <Button 
                    onClick={() => handleInviaPratica(pratica.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Invia alla Commissione
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 