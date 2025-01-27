"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Props {
  practiceId?: string // Opzionale per retrocompatibilità
  onUploadComplete: (file: File) => void
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
    if (!validateFile(file)) return
    
    try {
      setIsLoading(true)
      await onUploadComplete(file)
    } catch (error) {
      console.error('Errore upload:', error)
      toast.error("Errore nel caricamento del file")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return
    await handleUpload(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleUpload(file)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragging(false)
      }}
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
          Trascina qui il file firmato o
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