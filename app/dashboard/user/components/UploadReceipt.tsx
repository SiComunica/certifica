"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Upload } from "lucide-react"

interface UploadReceiptProps {
  practiceId: string
  onUploadComplete: () => void
}

export function UploadReceipt({ practiceId, onUploadComplete }: UploadReceiptProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error("Per favore carica un file PDF")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Seleziona prima un file")
      return
    }

    setIsUploading(true)
    try {
      // Upload del file
      const fileExt = file.name.split('.').pop()
      const fileName = `${practiceId}-receipt.${fileExt}`
      const filePath = `receipts/${fileName}`

      const { error: uploadError } = await supabase
        .storage
        .from('practices')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Salva riferimento nel database
      const { error: dbError } = await supabase
        .from('practice_payment_receipts')
        .insert({
          practice_id: practiceId,
          url: filePath,
          created_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      toast.success("Ricevuta caricata con successo")
      onUploadComplete()

    } catch (error: any) {
      console.error('Errore:', error)
      toast.error(`Errore nel caricamento: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full"
      >
        {isUploading ? (
          "Caricamento in corso..."
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Carica Ricevuta
          </>
        )}
      </Button>
    </div>
  )
} 