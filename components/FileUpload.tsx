"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Props {
  practiceId: string
  onUploadComplete: () => void
  acceptedFileTypes?: string[]
  maxSize?: number // in bytes
}

export function FileUpload({ 
  practiceId, 
  onUploadComplete, 
  acceptedFileTypes = ['.pdf'], 
  maxSize = 5 * 1024 * 1024 
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateFile = (file: File) => {
    if (maxSize && file.size > maxSize) {
      toast.error(`File troppo grande. Dimensione massima: ${maxSize / 1024 / 1024}MB`)
      return false
    }

    const fileType = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!acceptedFileTypes.includes(fileType)) {
      toast.error(`Tipo file non supportato. Tipi accettati: ${acceptedFileTypes.join(', ')}`)
      return false
    }

    return true
  }

  const handleUpload = async (file: File) => {
    try {
      setIsLoading(true)

      // Creiamo il nome del file con l'ID della pratica
      const fileExt = file.name.split('.').pop()
      const fileName = `${practiceId}-receipt.${fileExt}`

      // Upload del file
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Aggiorniamo la pratica
      const { error: updateError } = await supabase
        .from('practices')
        .update({ 
          payment_receipt: fileName,
          status: 'payment_verified'
        })
        .eq('id', practiceId)

      if (updateError) throw updateError

      toast.success("Fattura caricata con successo")
      onUploadComplete()
    } catch (error) {
      console.error('Errore upload:', error)
      toast.error("Errore nel caricamento della fattura")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file || !validateFile(file)) return
    await handleUpload(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !validateFile(file)) return
    await handleUpload(file)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedFileTypes.join(',')}
        className="hidden"
      />

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Trascina qui la fattura o
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isLoading ? "Caricamento..." : "Seleziona file"}
        </Button>
        <p className="text-xs text-gray-500">
          PDF fino a {maxSize / 1024 / 1024}MB
        </p>
      </div>
    </div>
  )
} 