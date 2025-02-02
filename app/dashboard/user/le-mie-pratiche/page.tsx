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

  useEffect(() => {
    loadPratiche()
  }, [])

  const loadPratiche = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('Caricamento pratiche per user:', user?.id) // Debug
      
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'pending_payment')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('Pratiche trovate:', data) // Debug
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
      const { error } = await supabase
        .from('practices')
        .update({ 
          hearing_confirmed: true,
          hearing_confirmation_date: new Date().toISOString()
        })
        .eq('id', praticaId)

      if (error) throw error
      toast.success("Partecipazione confermata")
      loadPratiche()
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nella conferma")
    }
  }

  const handleRequestNewDate = async (praticaId: string) => {
    try {
      const { error } = await supabase
        .from('practices')
        .update({ 
          hearing_confirmed: false,
          hearing_needs_reschedule: true
        })
        .eq('id', praticaId)

      if (error) throw error
      toast.success("Richiesta nuova data inviata")
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
            <div key={pratica.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Pratica #{pratica.pratica_number}</h2>
                    <p className="text-gray-600">Dipendente: {pratica.employee_name}</p>
                    <p className="text-gray-600">Contratto: {pratica.contract_types?.name || pratica.contract_type}</p>
                    <p className="text-gray-600">Stato: {pratica.status}</p>
                  </div>

                  {/* Documenti Allegati */}
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-medium mb-2">Documenti Allegati:</h3>
                    <div className="space-y-2">
                      {pratica.documents && pratica.documents.length > 0 ? (
                        pratica.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="text-sm">{doc.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(
                                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.path}`,
                                '_blank'
                              )}
                            >
                              Visualizza
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Nessun documento allegato</p>
                      )}
                    </div>
                  </div>

                  {/* Sezione Audizioni */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Audizione</h3>
                    
                    {pratica.hearing_date ? (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Data programmata:</span>{' '}
                            {new Date(pratica.hearing_date).toLocaleString('it-IT', {
                              dateStyle: 'full',
                              timeStyle: 'short'
                            })}
                          </p>
                          
                          {pratica.hearing_link && (
                            <p className="text-sm">
                              <span className="font-medium">Link videochiamata:</span>{' '}
                              <a 
                                href={pratica.hearing_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Partecipa
                              </a>
                            </p>
                          )}

                          <div className="flex space-x-4 mt-4">
                            <Button 
                              onClick={() => handleConfirmHearing(pratica.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Conferma Partecipazione
                            </Button>
                            <Button 
                              onClick={() => handleRequestNewDate(pratica.id)}
                              variant="outline"
                            >
                              Richiedi Nuova Data
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Nessuna audizione programmata
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Upload Ricevuta */}
                  {pratica.status === 'pending_payment' && !pratica.payment_receipt && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUploadReceipt(pratica.id, file)
                          }}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="text-sm"
                        />
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Carica
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">Carica la ricevuta di pagamento</p>
                    </div>
                  )}

                  {/* Bottone Invia alla Commissione */}
                  {pratica.status === 'pending_review' && pratica.payment_receipt && (
                    <Button
                      onClick={() => handleSubmitToCommission(pratica.id)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Invia alla Commissione
                    </Button>
                  )}

                  {/* Sezione Audizioni */}
                  {pratica.status === 'submitted_to_commission' && (
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">Audizione</h3>
                      {pratica.hearing_date ? (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm mb-2">
                            <span className="font-medium">Data programmata:</span>{' '}
                            {new Date(pratica.hearing_date).toLocaleString('it-IT')}
                          </p>
                          {pratica.hearing_link && (
                            <p className="text-sm mb-4">
                              <span className="font-medium">Link videochiamata:</span>{' '}
                              <a 
                                href={pratica.hearing_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Partecipa
                              </a>
                            </p>
                          )}
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleConfirmHearing(pratica.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Conferma Partecipazione
                            </Button>
                            <Button 
                              onClick={() => handleRequestNewDate(pratica.id)}
                              variant="outline"
                            >
                              Richiedi Nuova Data
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          In attesa di programmazione audizione
                        </p>
                      )}
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