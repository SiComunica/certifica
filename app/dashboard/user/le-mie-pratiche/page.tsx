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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('practices')
        .select(`
          *,
          documents,
          contract_type
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPratiche(data || [])
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nel caricamento delle pratiche")
    } finally {
      setLoading(false)
    }
  }

  const handleUploadRicevuta = async (praticaId: string) => {
    const pratica = pratiche.find(p => p.id === praticaId)
    if (!pratica) {
      toast.error("Pratica non trovata")
      return
    }

    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.pdf,.jpg,.jpeg,.png'
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        toast.info('Caricamento in corso...')
        
        const fileName = `ricevute/${praticaId}/${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { error: updateError } = await supabase
          .from('practices')
          .update({ 
            status: 'pending_review',
            payment_receipt: fileName,
            documents: { ...pratica.documents, payment_receipt: fileName }
          })
          .eq('id', praticaId)

        if (updateError) throw updateError

        toast.success('Ricevuta caricata con successo')
        await loadPratiche()
      } catch (error) {
        console.error('Errore upload:', error)
        toast.error("Errore nel caricamento della ricevuta")
      }
    }

    fileInput.click()
  }

  const handleInviaPratica = async (praticaId: string) => {
    try {
      const { error } = await supabase
        .from('practices')
        .update({ 
          status: 'submitted_to_commission',
          submitted_at: new Date().toISOString()
        })
        .eq('id', praticaId)

      if (error) throw error

      toast.success('Pratica inviata con successo')
      loadPratiche()
    } catch (error) {
      console.error('Errore invio:', error)
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
            <div 
              key={pratica.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">
                  Pratica #{pratica.practice_number}
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
                  {pratica.employee_name || 'Non specificato'}
                </p>
                <p>
                  <span className="font-medium">Tipo contratto:</span>{' '}
                  {pratica.contract_type || 'Non specificato'}
                </p>
                <p>
                  <span className="font-medium">Data creazione:</span>{' '}
                  {new Date(pratica.created_at).toLocaleDateString('it-IT')}
                </p>
                
                <div className="mt-4">
                  <span className="font-medium">Documenti:</span>
                  <ul className="ml-4 mt-2">
                    {pratica.documents && Object.entries(pratica.documents).map(([key, value]) => (
                      <li key={key} className="text-blue-600 hover:underline">
                        <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${value}`} 
                           target="_blank" 
                           rel="noopener noreferrer">
                          {key === 'payment_receipt' ? 'Ricevuta di pagamento' : 
                           key === '4' ? 'Istanza firmata' : 
                           `Documento ${key}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
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
                    onClick={() => handleInviaPratica(pratica.id)}
                    className="w-full"
                    variant="outline"
                  >
                    Invia pratica
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