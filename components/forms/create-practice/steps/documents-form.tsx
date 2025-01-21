"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { FileText, Download, Upload, Check, AlertCircle, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

// Interfaccia per le istanze caricate dall'admin
interface DocumentInstance {
  id: string
  name: string
  description: string
  category: "contratti" | "privacy" | "fiscale" | "altro"
  url: string
  createdAt: Date
  updatedAt: Date
}

interface SelectedDocument {
  id: string
  instanceId: string
  employeeId: string
  status: "to_sign" | "signed" | "rejected"
  signedUrl?: string
  uploadedAt: Date
}

interface DocumentsFormProps {
  onComplete: () => void
  employees: any[]
}

interface ApiError {
  message: string
  status?: number
}

const fetchPdfInstances = async () => {
  try {
    const response = await fetch('/api/admin/pdf-instances')
    
    if (!response.ok) {
      const error: ApiError = {
        message: 'Errore nel caricamento delle istanze PDF',
        status: response.status
      }

      switch (response.status) {
        case 401:
          error.message = "Sessione scaduta. Effettua nuovamente l'accesso."
          break
        case 403:
          error.message = "Non hai i permessi necessari per accedere a questa risorsa."
          break
        case 404:
          error.message = "Risorsa non trovata."
          break
        case 500:
          error.message = "Errore del server. Riprova più tardi."
          break
      }

      throw error
    }

    const data = await response.json()
    
    // Validazione dei dati ricevuti
    if (!Array.isArray(data)) {
      throw new Error('Formato dati non valido')
    }

    return data
  } catch (error) {
    if ((error as ApiError).status === 401) {
      // Redirect alla pagina di login in caso di sessione scaduta
      window.location.href = '/login'
    }
    throw error
  }
}

export function DocumentsForm({ onComplete, employees }: DocumentsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  const [instances, setInstances] = useState<DocumentInstance[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocument[]>([])
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Funzione per ricaricare i dati
  const retryLoading = () => {
    setError(null)
    setRetryCount(prev => prev + 1)
    loadPdfInstances()
  }

  const loadPdfInstances = async () => {
    setLoading(true)
    setError(null)

    try {
      const instances = await fetchPdfInstances()
      setInstances(instances)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      setError(errorMessage)
      
      // Log dell'errore
      console.error("[PDF_INSTANCES_LOAD]", error)
      
      // Notifica all'utente
      toast.error(errorMessage)

      // Gestione automatica dei retry
      if (retryCount < maxRetries) {
        setTimeout(retryLoading, 3000) // Riprova dopo 3 secondi
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPdfInstances()
  }, [])

  // Raggruppa le istanze per categoria
  const groupedInstances = instances.reduce((acc, instance) => {
    if (!acc[instance.category]) {
      acc[instance.category] = []
    }
    acc[instance.category].push(instance)
    return acc
  }, {} as Record<string, DocumentInstance[]>)

  // Seleziona/Deseleziona un documento per un dipendente
  const toggleDocument = (instance: DocumentInstance, employeeId: string) => {
    const existing = selectedDocuments.find(
      d => d.instanceId === instance.id && d.employeeId === employeeId
    )

    if (existing) {
      setSelectedDocuments(prev => 
        prev.filter(d => !(d.instanceId === instance.id && d.employeeId === employeeId))
      )
    } else {
      setSelectedDocuments(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        instanceId: instance.id,
        employeeId,
        status: "to_sign",
        uploadedAt: new Date()
      }])
    }
  }

  // Funzione per scaricare il template
  const handleDownloadTemplate = async (instance: DocumentInstance) => {
    try {
      const response = await fetch(`/api/documents/${instance.id}/download`)
      
      if (!response.ok) {
        throw new Error('Errore nel download del documento')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${instance.name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success(`Download di ${instance.name} completato`)
    } catch (error) {
      console.error("[DOWNLOAD_TEMPLATE]", error)
      toast.error("Errore durante il download del documento")
    }
  }

  // Funzione per caricare il documento firmato
  const handleUploadSigned = async (
    file: File, 
    instanceId: string, 
    employeeId: string
  ) => {
    try {
      // Validazione del file
      if (!file.type.includes('pdf')) {
        toast.error("Il file deve essere in formato PDF")
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Il file non può superare i 5MB")
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('instanceId', instanceId)
      formData.append('employeeId', employeeId)

      const response = await fetch('/api/documents/upload-signed', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Errore nel caricamento del documento firmato')
      }

      const data = await response.json()

      // Aggiorna lo stato dei documenti
      setSelectedDocuments(prev => {
        const newDocs = [...prev]
        const index = newDocs.findIndex(
          d => d.instanceId === instanceId && d.employeeId === employeeId
        )

        if (index !== -1) {
          newDocs[index] = {
            ...newDocs[index],
            status: "signed",
            signedUrl: data.url,
            uploadedAt: new Date()
          }
        }

        return newDocs
      })

      toast.success("Documento firmato caricato con successo")
    } catch (error) {
      console.error("[UPLOAD_SIGNED]", error)
      toast.error("Errore durante il caricamento del documento firmato")
    }
  }

  // Stato di caricamento
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">Caricamento documenti in corso...</p>
      </div>
    )
  }

  // Stato di errore
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">
            Errore nel caricamento dei documenti
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {error}
          </p>
          {retryCount < maxRetries && (
            <Button 
              onClick={retryLoading}
              variant="outline"
              className="mt-4"
            >
              Riprova
            </Button>
          )}
          {retryCount >= maxRetries && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Numero massimo di tentativi raggiunto.
              </p>
              <Button 
                onClick={() => router.refresh()}
                variant="default"
              >
                Ricarica la pagina
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Documenti Disponibili</h2>
          <p className="text-gray-500 mt-1">
            Seleziona i documenti da far firmare ai dipendenti
          </p>
        </div>

        {employees.map((employee) => (
          <Card key={employee.fiscal_code} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {employee.name} {employee.surname}
              </h3>
              
              <span className="text-sm text-gray-500">
                {selectedDocuments.filter(d => d.employeeId === employee.fiscal_code).length} documenti selezionati
              </span>
            </div>

            {Object.entries(groupedInstances).map(([category, docs]) => (
              <div key={category} className="mb-8 last:mb-0">
                <h4 className="text-lg font-medium mb-4 capitalize">
                  {category}
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {docs.map((instance) => {
                    const isSelected = selectedDocuments.some(
                      d => d.instanceId === instance.id && d.employeeId === employee.fiscal_code
                    )
                    const doc = selectedDocuments.find(
                      d => d.instanceId === instance.id && d.employeeId === employee.fiscal_code
                    )

                    return (
                      <div 
                        key={instance.id}
                        className={`
                          relative p-4 rounded-lg border transition-all
                          ${isSelected ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {instance.name}
                            </h5>
                            <p className="text-sm text-gray-500 mt-1">
                              {instance.description}
                            </p>
                          </div>
                          
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleDocument(instance, employee.fiscal_code)}
                            className={isSelected ? "bg-blue-600" : ""}
                          >
                            {isSelected ? "Selezionato" : "Seleziona"}
                          </Button>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPdf(doc?.signedUrl || instance.url)
                                setPreviewOpen(true)
                              }}
                              className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Anteprima
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadTemplate(instance)}
                              className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Scarica
                            </Button>

                            {doc?.status === "to_sign" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const input = document.createElement('input')
                                  input.type = 'file'
                                  input.accept = '.pdf'
                                  input.onchange = async (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    if (file) {
                                      await handleUploadSigned(file, instance.id, employee.fiscal_code)
                                    }
                                  }
                                  input.click()
                                }}
                                className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Carica
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Anteprima Documento</DialogTitle>
          </DialogHeader>
          {selectedPdf && (
            <iframe
              src={selectedPdf}
              className="w-full h-full rounded-md"
              title="PDF Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
} 