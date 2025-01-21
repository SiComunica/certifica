"use client"

import { useState, useEffect } from "react"

export default function ApiTest() {
  const [message, setMessage] = useState("Caricamento...")

  useEffect(() => {
    console.log("Componente montato")
    
    fetch('/api/hello')
      .then(res => {
        console.log("Risposta ricevuta:", res.status)
        return res.json()
      })
      .then(data => {
        console.log("Dati:", data)
        setMessage(JSON.stringify(data, null, 2))
      })
      .catch(err => {
        console.error("Errore:", err)
        setMessage("Errore: " + err.message)
      })
  }, [])

  return (
    <div className="p-4 border rounded">
      <pre>{message}</pre>
    </div>
  )
} 