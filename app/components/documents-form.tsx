"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DocumentsForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il caricamento')
      }

      // Aggiorna la lista dei documenti
      router.refresh()
      
      // Reset del form
      e.currentTarget.reset()

    } catch (error: any) {
      console.error('Errore:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadPdfInstances = async () => {
    try {
      const response = await fetch('/api/admin/pdf-instances')
      const data = await response.json()
      
      if (!response.ok) {
        console.error('[PDF_INSTANCES_LOAD]', data)
        return []
      }

      return data
    } catch (error) {
      console.error('[PDF_INSTANCES_LOAD]', error)
      return []
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Carica Documento</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome documento *
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria *
          </label>
          <input
            type="text"
            name="category"
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrizione
          </label>
          <textarea
            name="description"
            rows={3}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File PDF *
          </label>
          <input
            type="file"
            name="file"
            accept=".pdf"
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Caricamento...' : 'Carica documento'}
        </button>
      </form>
    </div>
  )
} 