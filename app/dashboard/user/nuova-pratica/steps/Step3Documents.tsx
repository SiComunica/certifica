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
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('id')

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Errore caricamento templates:', error)
      toast.error("Errore nel caricamento dei template")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, templateId: number) => {
    try {
      setIsUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Utente non autenticato")

      // Upload del file
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${templateId}_${Date.now()}.${fileExt}`
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Aggiorna l'elenco dei documenti
      const newDoc = {
        template_id: templateId,
        file_path: fileName,
        file_name: file.name
      }

      setDocuments(prev => [...prev.filter(d => d.template_id !== templateId), newDoc])
      toast.success("Documento caricato con successo")

    } catch (error: any) {
      console.error('Errore upload:', error)
      toast.error(error.message || "Errore durante il caricamento del file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Utente non autenticato")

      // Trova la pratica più recente in bozza
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('id, data')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (practiceError) throw practiceError

      // Aggiorna la pratica con i documenti
      const updatedData = {
        ...practice.data,
        documents: documents
      }

      const { error } = await supabase
        .from('practices')
        .update({
          data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', practice.id)

      if (error) throw error

      // Procedi allo step successivo
      onSubmit({ documents })

    } catch (error: any) {
      console.error('Errore salvataggio documenti:', error)
      toast.error(error.message || "Errore durante il salvataggio dei documenti")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  {template.is_required && (
                    <span className="text-xs text-red-500">* Obbligatorio</span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(template.file_path, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Scarica Template
                  </Button>

                  <div className="relative">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {documents.some(doc => doc.template_id === template.id)
                            ? "Sostituisci documento"
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