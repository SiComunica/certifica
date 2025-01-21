"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { use } from 'react'

interface PageProps {
  params: Promise<{ practiceId: string }>
}

export default function UploadReceiptPage({ params }: PageProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { practiceId } = use(params)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkUserAndPractice = async () => {
      try {
        setIsLoading(true)
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/login')
          return
        }

        const { data: practice, error: practiceError } = await supabase
          .from('practices')
          .select('*')
          .eq('id', practiceId)
          .single()

        if (practiceError || !practice) {
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Errore:', error)
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    checkUserAndPractice()
  }, [practiceId, router, supabase])

  const handleUpload = async () => {
    if (!file) {
      toast.error("Seleziona un file")
      return
    }

    try {
      setUploading(true)

      // 1. Upload file
      const fileExt = file.name.split('.').pop()
      const fileName = `${practiceId}-${Date.now()}.${fileExt}`
      const { error: uploadError, data } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Aggiorna pratica
      const { error: updateError } = await supabase
        .from('practices')
        .update({ 
          status: 'receipt_verification',
          receipt_url: data?.path,
          receipt_uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (updateError) throw updateError

      toast.success("Ricevuta caricata con successo")
      router.push('/dashboard/user')

    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore durante il caricamento")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Carica Ricevuta di Pagamento</h1>
      
      <div className="space-y-4">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full"
        />

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {uploading ? "Caricamento..." : "Carica Ricevuta"}
        </button>
      </div>
    </div>
  )
} 