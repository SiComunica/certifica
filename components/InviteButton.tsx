"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function InviteButton() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [inviteCode, setInviteCode] = useState("")

  const handleInvite = async () => {
    if (!email) return
    setLoading(true)

    try {
      const res = await fetch('/api/commission/invite-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante l\'invio dell\'invito')
      }

      setInviteCode(data.code)
      toast.success('Codice invito generato')

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

            {inviteCode && (
              <div className="mb-4 p-4 bg-blue-50 rounded">
                <p className="font-bold mb-2">Codice Invito:</p>
                <p className="text-2xl text-blue-600 font-mono">{inviteCode}</p>
                <p className="mt-2 text-sm">
                  Link registrazione:<br/>
                  <a 
                    href="/auth/commission-register" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                  >
                    /auth/commission-register
                  </a>
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false)
                  setInviteCode("")
                  setEmail("")
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Chiudi
              </button>
              
              <button
                onClick={handleInvite}
                disabled={loading || !email}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Generazione...' : 'Genera Codice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 