"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Pratica } from "../types"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  Send, 
  Calendar,
  Check,
  X,
  Video,
  Download
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Bozza", color: "bg-gray-500" },
      pending_payment: { label: "In attesa di pagamento", color: "bg-yellow-500" },
      pending_review: { label: "In attesa di revisione", color: "bg-blue-500" },
      submitted_to_commission: { label: "Inviata alla commissione", color: "bg-purple-500" },
      scheduled_hearing: { label: "Audizione programmata", color: "bg-green-500" },
      completed: { label: "Completata", color: "bg-green-700" }
    }
    const status_info = statusConfig[status as keyof typeof statusConfig] || { label: status, color: "bg-gray-500" }
    
    return (
      <Badge className={`${status_info.color} text-white`}>
        {status_info.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/user')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Le Mie Pratiche</h1>
          <p className="text-gray-600">Gestisci le tue pratiche in lavorazione</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="space-y-6">
          {pratiche.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-xl font-medium text-gray-600">Nessuna pratica in lavorazione</p>
                <p className="text-gray-500 mt-2">Le pratiche che crei appariranno qui</p>
                <Button 
                  onClick={() => router.push('/dashboard/user/nuova-pratica')}
                  className="mt-4"
                >
                  Crea Nuova Pratica
                </Button>
              </CardContent>
            </Card>
          ) : (
            pratiche.map((pratica: Pratica) => (
              <Card key={pratica.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        Pratica #{pratica.pratica_number}
                      </CardTitle>
                      <CardDescription>
                        Creata il {format(new Date(pratica.created_at), "d MMMM yyyy", { locale: it })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(pratica.status)}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Dettagli Pratica */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900">Dettagli Dipendente</h3>
                        <p className="text-gray-600">{pratica.employee_name}</p>
                        <p className="text-gray-600">{pratica.employee_fiscal_code}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">Tipo Contratto</h3>
                        <p className="text-gray-600">{pratica.contract_type_name}</p>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900">Importo</h3>
                        <p className="text-gray-600">€{pratica.total_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Azioni e Documenti */}
                    <div className="space-y-4">
                      {/* Upload Ricevuta */}
                      {pratica.status === 'pending_payment' && !pratica.receipt_path && (
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <h3 className="font-medium text-blue-900 mb-2">Carica Ricevuta</h3>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleUploadReceipt(pratica.id, file)
                              }}
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="flex-1"
                            />
                            <Button size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Carica
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Documenti Allegati */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Documenti Allegati</h3>
                        <div className="space-y-2">
                          {pratica.documents?.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{doc.name}</span>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Audizioni */}
                      {pratica.hearing_date && (
                        <div className="border rounded-lg p-4 bg-green-50">
                          <h3 className="font-medium text-green-900 mb-2">
                            Audizione Programmata
                          </h3>
                          <p className="text-sm text-green-800">
                            {format(new Date(pratica.hearing_date), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
                          </p>
                          {pratica.hearing_link && (
                            <div className="mt-2">
                              <Button size="sm" className="w-full" onClick={() => window.open(pratica.hearing_link)}>
                                <Video className="h-4 w-4 mr-2" />
                                Partecipa
                              </Button>
                            </div>
                          )}
                          <div className="flex space-x-2 mt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Check className="h-4 w-4 mr-2" />
                              Conferma
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              Riprogramma
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Invia alla Commissione */}
                      {pratica.receipt_path && pratica.status === 'pending_review' && (
                        <Button
                          onClick={() => handleSubmitToCommission(pratica.id)}
                          className="w-full"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Invia alla Commissione
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
} 