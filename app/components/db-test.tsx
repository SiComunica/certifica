"use client"

import { useState, useEffect } from "react"

export default function DbTest() {
  const [status, setStatus] = useState("Verifica database...")
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/db-test')
      .then(res => res.json())
      .then(data => {
        console.log("Risposta test database:", data)
        if (data.status === "error") {
          setError(data.message)
          setStatus("Errore database")
        } else {
          setData(data)
          setStatus("Database OK")
        }
      })
      .catch(err => {
        console.error("Errore test:", err)
        setError(err.message)
        setStatus("Errore connessione")
      })
  }, [])

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Test Database</h3>
      <p className="mb-2">Status: {status}</p>
      
      {error && (
        <div className="text-red-500 mb-2">
          Errore: {error}
        </div>
      )}

      {data && (
        <div className="bg-gray-50 p-2 rounded">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 