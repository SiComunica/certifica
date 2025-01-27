"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { FileUpload } from "@/components/FileUpload"
import { toast } from "sonner"
import { Download } from "lucide-react"

interface Template {
  id: number
  name: string
  file_path: string
  description: string
  url: string
}

interface Props {
  formData: any
  onSubmit: (data: any) => void
  onBack: () => void
}

export default function Step3Documents({ formData, onSubmit, onBack }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>(formData.documents || {})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name')

      if (error) throw error
      setTemplates(data)
    } catch (error) {
      console.error('Errore caricamento templates:', error)
      toast.error("Errore nel caricamento dei documenti")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = async (template: Template) => {
    try {
      const { data, error } = await supabase.storage
        .from('templates')
        .download(template.file_path)

      if (error) throw error

      // Crea URL per il download
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = template.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Errore download template:', error)
      toast.error("Errore nel download del documento")
    }
  }

  const handleUpload = async (templateId: number, file: File) => {
    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) return

      // Crea nome file con prefisso template
      const fileExt = file.name.split('.').pop()
      const fileName = `${formData.practiceId}/${template.name}_signed.${fileExt}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Aggiorna stato locale
      setUploadedDocs(prev => ({
        ...prev,
        [templateId]: fileName
      }))

      toast.success("Documento caricato con successo")
    } catch (error) {
      console.error('Errore upload:', error)
      toast.error("Errore nel caricamento del documento")
    }
  }

  const handleSubmit = () => {
    // Verifica che almeno un documento sia stato caricato
    const hasAtLeastOneDocument = Object.keys(uploadedDocs).length > 0
    
    if (!hasAtLeastOneDocument) {
      toast.error("Carica almeno un documento prima di procedere")
      return
    }

    onSubmit({
      ...formData,
      documents: uploadedDocs
    })
  }

  if (isLoading) {
    return <div>Caricamento documenti...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate(template)}
              >
                <Download className="w-4 h-4 mr-2" />
                Scarica Template
              </Button>
            </div>

            <div className="mt-4">
              {uploadedDocs[template.id] ? (
                <div className="p-4 bg-green-50 rounded-md">
                  <p className="text-sm text-green-600">
                    Documento caricato ✓
                  </p>
                </div>
              ) : (
                <FileUpload
                  onUploadComplete={(file) => handleUpload(template.id, file)}
                  acceptedFileTypes={['.pdf']}
                  maxSize={5 * 1024 * 1024}
                />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Indietro
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={Object.keys(uploadedDocs).length === 0}
        >
          Avanti
        </Button>
      </div>

      {Object.keys(uploadedDocs).length === 0 && (
        <p className="text-sm text-yellow-600 text-center">
          Carica almeno un documento per procedere
        </p>
      )}
    </div>
  )
} 