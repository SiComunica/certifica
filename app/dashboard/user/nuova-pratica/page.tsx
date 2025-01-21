"use client"

import { useState } from 'react'

export default function NuovaPraticaPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Nuova Pratica</h1>
      
      {loading ? (
        <div>Caricamento...</div>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault()
          console.log('Form submitted')
        }}>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Nome"
              className="w-full p-2 border rounded"
            />
            <input 
              type="text" 
              placeholder="Cognome"
              className="w-full p-2 border rounded"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Invia
            </button>
          </div>
        </form>
      )}
    </div>
  )
}