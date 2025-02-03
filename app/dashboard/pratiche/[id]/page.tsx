"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Clock, CheckCircle, XCircle, Download, Edit, Save, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { toast } from "sonner"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { use } from 'react'

interface Practice {
  id: string
  practice_number: string
  employee_name: string
  status: string
  created_at: string
  organization_id: string
  contract_type: string
  employee_fiscal_code: string
  submission_date: string
  notes: string
  payment_receipt?: string
  payment_status?: string
  submitted_at?: string
}

interface EditablePractice {
  employee_name: string
  employee_fiscal_code: string
  contract_type: string
  notes: string
}

type ContractType = 'Indeterminato' | 'Determinato' | 'Apprendistato' | 'Stage'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PraticaDettaglioPage({ params }: PageProps) {
  const { id } = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [practice, setPractice] = useState<Practice | null>(null)
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPractice, setEditedPractice] = useState<EditablePractice>({
    employee_name: '',
    employee_fiscal_code: '',
    contract_type: '',
    notes: ''
  })
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUserAndLoadPractice = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/auth/login')
          return
        }

        const { data: practiceData, error: practiceError } = await supabase
          .from('practices')
          .select('*')
          .eq('id', id)
          .single()

        if (practiceError) throw practiceError
        setPractice(practiceData)
      } catch (error) {
        console.error('Errore:', error)
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    checkUserAndLoadPractice()
  }, [id, router, supabase])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completata'
      case 'pending':
        return 'In Attesa'
      case 'rejected':
        return 'Rifiutata'
      default:
        return 'In Lavorazione'
    }
  }

  const handleEdit = () => {
    if (practice) {
      setEditedPractice({
        employee_name: practice.employee_name,
        employee_fiscal_code: practice.employee_fiscal_code,
        contract_type: practice.contract_type,
        notes: practice.notes
      })
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('practices')
        .update({
          employee_name: editedPractice.employee_name,
          employee_fiscal_code: editedPractice.employee_fiscal_code,
          contract_type: editedPractice.contract_type,
          notes: editedPractice.notes
        })
        .eq('id', id)

      if (error) throw error

      // Aggiorna i dati locali
      setPractice(prev => prev ? {
        ...prev,
        ...editedPractice
      } : null)

      setIsEditing(false)
      toast.success('Pratica aggiornata con successo')
    } catch (error) {
      toast.error('Errore durante il salvataggio')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (practice) {
      setEditedPractice({
        employee_name: practice.employee_name,
        employee_fiscal_code: practice.employee_fiscal_code,
        contract_type: practice.contract_type,
        notes: practice.notes
      })
    }
  }

  const downloadPractice = () => {
    // Crea un oggetto con i dati della pratica
    const practiceData = {
      numero_pratica: practice?.practice_number,
      dipendente: practice?.employee_name,
      codice_fiscale: practice?.employee_fiscal_code,
      tipo_contratto: practice?.contract_type,
      stato: getStatusText(practice?.status || ''),
      data_creazione: format(new Date(practice?.created_at || ''), "d MMMM yyyy", { locale: it }),
      note: practice?.notes
    }

    // Converti in JSON e crea il blob
    const fileData = JSON.stringify(practiceData, null, 2)
    const blob = new Blob([fileData], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pratica_${practice?.practice_number}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleUploadRicevuta = async () => {
    if (!practice) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf'
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        toast.info('Caricamento ricevuta in corso...')
        
        const fileName = `ricevuta_${practice.id}_${Date.now()}.pdf`
        
        // Upload file
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Aggiorna pratica
        const { error: updateError } = await supabase
          .from('practices')
          .update({
            payment_receipt: fileName,
            status: 'review_pending',
            payment_status: 'completed'
          })
          .eq('id', practice.id)

        if (updateError) throw updateError

        // Ricarica i dati della pratica
        const { data: updatedPractice } = await supabase
          .from('practices')
          .select('*')
          .eq('id', practice.id)
          .single()

        if (updatedPractice) {
          setPractice(updatedPractice)
          toast.success('Ricevuta caricata con successo!')
        }
      } catch (error) {
        console.error('Errore:', error)
        toast.error('Errore nel caricamento della ricevuta')
      }
    }

    input.click()
  }

  const handleInviaPratica = async () => {
    if (!practice) return

    try {
      toast.info('Invio pratica in corso...')

      const { error } = await supabase
        .from('practices')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', practice.id)

      if (error) throw error

      // Ricarica i dati della pratica
      const { data: updatedPractice } = await supabase
        .from('practices')
        .select('*')
        .eq('id', practice.id)
        .single()

      if (updatedPractice) {
        setPractice(updatedPractice)
        toast.success('Pratica inviata alla commissione!')
      }
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nell'invio della pratica")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!practice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Pratica non trovata</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <Header 
        user={user}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard/storico-pratiche')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna allo storico
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadPractice}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Scarica Pratica
                  </Button>

                  {practice?.status === 'pending' && !isEditing && (
                    <Button
                      variant="default"
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      Pratica #{practice.practice_number}
                    </h1>
                    <p className="text-gray-500">
                      Creata il {format(new Date(practice.created_at), "d MMMM yyyy", { locale: it })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(practice.status)}
                    <span className="text-sm font-medium">
                      {getStatusText(practice.status)}
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Nome Dipendente</Label>
                          <Input
                            value={editedPractice.employee_name}
                            onChange={(e) => setEditedPractice(prev => ({
                              ...prev,
                              employee_name: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label>Codice Fiscale</Label>
                          <Input
                            value={editedPractice.employee_fiscal_code}
                            onChange={(e) => setEditedPractice(prev => ({
                              ...prev,
                              employee_fiscal_code: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label>Tipo Contratto</Label>
                          <Select
                            value={editedPractice.contract_type}
                            onValueChange={(value: ContractType) => setEditedPractice(prev => ({
                              ...prev,
                              contract_type: value
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona tipo contratto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Indeterminato">Indeterminato</SelectItem>
                              <SelectItem value="Determinato">Determinato</SelectItem>
                              <SelectItem value="Apprendistato">Apprendistato</SelectItem>
                              <SelectItem value="Stage">Stage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Note</Label>
                        <Textarea
                          value={editedPractice.notes}
                          onChange={(e) => setEditedPractice(prev => ({
                            ...prev,
                            notes: e.target.value
                          }))}
                          className="h-[200px]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Annulla
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Salva
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-sm font-medium text-gray-500 mb-2">
                        Dettagli Dipendente
                      </h2>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Nome</p>
                          <p className="font-medium">{practice.employee_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Codice Fiscale</p>
                          <p className="font-medium">{practice.employee_fiscal_code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tipo Contratto</p>
                          <p className="font-medium">{practice.contract_type}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-sm font-medium text-gray-500 mb-2">
                        Note
                      </h2>
                      <p className="text-gray-700">
                        {practice.notes || 'Nessuna nota disponibile'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h2 className="text-sm font-medium text-gray-500 mb-4">
                    Documenti e Azioni
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      {practice?.payment_receipt ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Ricevuta di pagamento</span>
                          </div>
                          <a 
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${practice.payment_receipt}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Visualizza
                          </a>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          Nessuna ricevuta caricata
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {practice?.status === 'pending_payment' && (
                        <Button 
                          onClick={handleUploadRicevuta}
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Carica Ricevuta di Pagamento
                        </Button>
                      )}

                      {practice?.status === 'review_pending' && (
                        <Button 
                          onClick={handleInviaPratica}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Invia alla Commissione
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 