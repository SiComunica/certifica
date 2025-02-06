"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function InviteButton() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleInvite = async () => {
    if (!email) return
    setLoading(true)

    try {
      const res = await fetch('/api/commission/invite-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Errore durante l\'invio dell\'invito')
      }

      toast.success('Invito inviato con successo')
      setEmail("")
      setShowModal(false)

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Invita Membro
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Invita Membro Commissione</h2>
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Annulla
              </button>
              
              <button
                onClick={handleInvite}
                disabled={loading || !email}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Invio...' : 'Invia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 