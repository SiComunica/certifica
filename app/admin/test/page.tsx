"use client"

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Crea un nuovo client Supabase con le tue credenziali
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TestPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const testBucket = async () => {
    try {
      setMessage('Test in corso...')
      setError('')

      // 1. Crea il bucket
      console.log("1. Creazione bucket...")
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .createBucket('pdf-templates', {
          public: true
        })

      if (bucketError) {
        if (bucketError.message.includes('already exists')) {
          console.log("Bucket già esistente")
        } else {
          throw bucketError
        }
      }

      // 2. Carica un file di test
      console.log("2. Upload file di test...")
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('pdf-templates')
        .upload('test.txt', testFile)

      console.log("Risultato upload:", { uploadData, uploadError })

      if (uploadError && !uploadError.message.includes('already exists')) {
        throw uploadError
      }

      // 3. Lista i file
      console.log("3. Lista file...")
      const { data: files, error: listError } = await supabase
        .storage
        .from('pdf-templates')
        .list()

      if (listError) throw listError

      setMessage(`Test completato! File nel bucket: ${files.length}`)
      console.log("File nel bucket:", files)

    } catch (error: any) {
      console.error("Errore test:", error)
      setError(error.message)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Supabase Storage</h1>
      
      <button 
        onClick={testBucket}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Esegui Test
      </button>

      {message && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  )
} 