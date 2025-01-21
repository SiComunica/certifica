"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Upload, Download, FileText } from "lucide-react"

interface Template {
  id: number
  name: string
  file_path: string
  description: string
  is_required: boolean
}

interface Props {
  formData: any
  onSubmit: (data: any) => void
  onBack: () => void
}

export default function Step3Documents({ formData, onSubmit, onBack }: Props) {
  const [isUploading, setIsUploading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [documents, setDocuments] = useState<any[]>(formData.documents || [])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('id')

        if (error) throw error
        console.log('Templates caricati:', data)
        setTemplates(data || [])
      } catch (error) {
        console.error('Errore caricamento templates:', error)
        toast.error("Errore nel caricamento dei documenti")
      }
    }

    loadTemplates()
  }, [])

  const handleDownloadTemplate = async (template: Template) => {
    try {
      const cleanPath = template.file_path.replace(/^\/+/, '')
      console.log('Percorso pulito:', cleanPath)

      const { data, error } = await supabase.storage
        .from('templates')
        .download(cleanPath)

      if (error) {
        console.error('Errore Supabase dettagliato:', error)
        throw error
      }

      if (!data) {
        throw new Error('Nessun dato ricevuto dal server')
      }

      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      const fileName = cleanPath.split('/').pop() || template.name
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Errore completo:', error)
      toast.error("Errore durante il download del template")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, templateId: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${formData.practiceId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Errore upload dettagliato:', uploadError)
        throw uploadError
      }

      // Add document to list
      const newDoc = {
        name: file.name,
        path: filePath,
        template_id: templateId,
        uploaded_at: new Date().toISOString()
      }

      setDocuments(prev => [...prev, newDoc])
      toast.success("Documento caricato con successo")

    } catch (error) {
      console.error('Errore upload completo:', error)
      toast.error("Errore durante il caricamento del documento")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      // Aggiorna la pratica con i documenti
      const { error } = await supabase
        .from('practices')
        .update({ 
          documents,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.practiceId)

      if (error) throw error

      onSubmit({ documents })
    } catch (error) {
      console.error('Errore salvataggio documenti:', error)
      toast.error("Errore durante il salvataggio dei documenti")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {template.name}
                      {template.is_required && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate(template)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Scarica Template
                  </Button>
                </div>

                {/* Lista documenti caricati per questo template */}
                {documents.filter(doc => doc.template_id === template.id).map((doc, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-green-600">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-medium">Firmato</span>
                      </div>
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">
                        Caricato il {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setDocuments(prev => prev.filter((d, i) => i !== index))
                          toast.success("Documento rimosso")
                        }}
                      >
                        Rimuovi
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Stato del documento */}
                <div className="mt-2 text-sm">
                  {documents.some(doc => doc.template_id === template.id) ? (
                    <div className="text-green-600 flex items-center gap-1">
                      <span>✓</span> Documento firmato caricato
                    </div>
                  ) : template.is_required ? (
                    <div className="text-amber-600 flex items-center gap-1">
                      <span>!</span> Caricamento documento richiesto
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Caricamento opzionale
                    </div>
                  )}
                </div>

                {/* Upload nuovo documento */}
                <div className="mt-2">
                  <label className="flex items-center justify-center w-full p-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {documents.some(doc => doc.template_id === template.id)
                          ? "Sostituisci documento firmato"
                          : "Carica documento firmato"
                        }
                      </span>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, template.id)}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between space-x-4">
        <Button
          onClick={onBack}
          variant="outline"
          type="button"
        >
          Indietro
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isUploading}
        >
          Avanti
        </Button>
      </div>
    </div>
  )
} 