"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Upload, Eye, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Template {
  id: string
  name: string
  description: string
  file_path: string
  url: string
  type: string
  created_at: string
}

export default function DocumentsManagement() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    type: "",
    file: null as File | null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Errore nel caricamento dei template:', error)
      toast.error('Errore nel caricamento dei template')
    }
  }

  const handleTemplateUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTemplate.file || !newTemplate.type) {
      toast.error('Seleziona un file e specifica il tipo di template')
      return
    }

    try {
      setIsLoading(true)
      const fileName = `${Date.now()}-${newTemplate.file.name}`

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('templates')
        .upload(`istanze/${fileName}`, newTemplate.file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase
        .storage
        .from('templates')
        .getPublicUrl(`istanze/${fileName}`)

      const { error: dbError } = await supabase
        .from('templates')
        .insert({
          name: newTemplate.name,
          description: newTemplate.description,
          file_path: `istanze/${fileName}`,
          url: publicUrl,
          type: newTemplate.type
        })

      if (dbError) throw dbError

      toast.success('Template caricato con successo')
      fetchTemplates()
      setNewTemplate({ name: "", description: "", type: "", file: null })
    } catch (error: any) {
      console.error('Errore:', error)
      toast.error(`Errore nel caricamento: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!templateToDelete) return

    try {
      setIsLoading(true)

      const { error: storageError } = await supabase
        .storage
        .from('templates')
        .remove([templateToDelete.file_path])

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateToDelete.id)

      if (dbError) throw dbError

      toast.success('Template eliminato con successo')
      fetchTemplates()
    } catch (error: any) {
      console.error('Errore:', error)
      toast.error(`Errore nell'eliminazione: ${error.message}`)
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
      setTemplateToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleTemplateUpload} className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="templateName">Nome Template</Label>
            <Input
              id="templateName"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({
                ...prev,
                name: e.target.value
              }))}
              placeholder="Inserisci il nome del template"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="templateType">Tipo Template</Label>
            <Input
              id="templateType"
              value={newTemplate.type}
              onChange={(e) => setNewTemplate(prev => ({
                ...prev,
                type: e.target.value
              }))}
              placeholder="es. istanza, contratto, ecc."
              required
            />
          </div>

          <div>
            <Label htmlFor="templateDescription">Descrizione</Label>
            <Textarea
              id="templateDescription"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate(prev => ({
                ...prev,
                description: e.target.value
              }))}
              placeholder="Inserisci una descrizione"
            />
          </div>

          <div>
            <Label htmlFor="templateFile">File PDF</Label>
            <Input
              type="file"
              id="templateFile"
              accept=".pdf"
              onChange={(e) => setNewTemplate(prev => ({
                ...prev,
                file: e.target.files?.[0] || null
              }))}
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Carica Template
        </Button>
      </form>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-500">Tipo: {template.type}</p>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(template.url, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setTemplateToDelete(template)
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo template? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 