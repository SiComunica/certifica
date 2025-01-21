"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

export default function DocumentsStep() {
  // Forziamo un errore per vedere se il componente viene eseguito
  console.log("TEST INIZIALE")
  throw new Error("Test Error")

  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("DocumentsStep: Componente montato")
    
    const fetchData = async () => {
      try {
        console.log("DocumentsStep: Inizio fetch dei dati")
        
        const response = await fetch('/api/documents/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        console.log("DocumentsStep: Risposta ricevuta", response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log("DocumentsStep: Dati ricevuti", result)
        
        setData(result)
      } catch (err) {
        console.error("DocumentsStep: Errore durante il fetch", err)
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Documenti da Firmare</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 mb-4 rounded">
          Errore: {error}
        </div>
      )}

      {!data && !error && (
        <div className="text-gray-500">
          Caricamento documenti...
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-bold mb-2">Dati ricevuti:</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  )
} 