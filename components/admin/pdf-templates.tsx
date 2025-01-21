"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Upload, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface ContractType {
  id: number
  name: string
  code: string
  description: string
}

interface PdfTemplate {
  id: number
  contract_type_id: number
  name: string
  file_path: string
  is_required: boolean
  description: string
}

export function PdfTemplates() {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [templates, setTemplates] = useState<PdfTemplate[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carica tipi di contratto
      const { data: types, error: typesError } = await supabase
        .from('contract_types')
        .select('*')
        .order('id')
      
      if (typesError) throw typesError
      setContractTypes(types || [])

      // Carica template esistenti
      const { data: pdfs, error: pdfsError } = await supabase
        .from('pdf_templates')
        .select('*')
      
      if (pdfsError) throw pdfsError
      setTemplates(pdfs || [])
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (
    file: File, 
    contractType: ContractType,
    isRequired: boolean,
    description: string
  ) => {
    try {
      setUploading(true)
      
      const folderPath = `${contractType.id}-${contractType.code.toLowerCase()}`
      const fileName = `${folderPath}/${file.name}`
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdf-templates')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Add template to database
      const { error: dbError } = await supabase
        .from('pdf_templates')
        .insert({
          contract_type_id: contractType.id,
          name: file.name,
          file_path: fileName,
          is_required: isRequired,
          description: description
        })

      if (dbError) throw dbError

      await loadData()
    } catch (error) {
      console.error('Errore upload:', error)
      alert('Errore durante il caricamento del template')
    } finally {
      setUploading(false)
    }
  }

  const deleteTemplate = async (template: PdfTemplate) => {
    if (!confirm('Sei sicuro di voler eliminare questo template?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pdf-templates')
        .remove([template.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('pdf_templates')
        .delete()
        .eq('id', template.id)

      if (dbError) throw dbError

      await loadData()
    } catch (error) {
      console.error('Errore eliminazione:', error)
      alert('Errore durante l\'eliminazione del template')
    }
  }

  if (loading) {
    return <div>Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      {contractTypes.map(type => (
        <div key={type.id} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{type.name}</h2>
          <p className="text-gray-600 mb-4">{type.description}</p>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <Label>Carica nuovo template</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const description = prompt('Inserisci una descrizione per il template:') || ''
                    const isRequired = confirm('Il documento è obbligatorio?')
                    handleFileUpload(file, type, isRequired, description)
                  }
                }}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              {templates
                .filter(t => t.contract_type_id === type.id)
                .map(template => (
                  <div 
                    key={template.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText size={20} className="text-gray-500" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                        {template.is_required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Obbligatorio
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTemplate(template)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 