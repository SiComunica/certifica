"use client"

import { useState } from 'react'
import { emailService } from '@/lib/email'
import { toast } from 'react-hot-toast'

export function CommissionInvite() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Semplifichiamo l'invio dell'email
      await emailService.sendEmail(
        email,
        'Invito Commissione',
        `Sei stato invitato a far parte della commissione. 
         Clicca qui per accettare l'invito: [LINK]`
      )

      toast.success('Invito inviato con successo')
      setEmail('')
    } catch (error) {
      console.error('Errore invio invito:', error)
      toast.error('Errore nell\'invio dell\'invito')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        Invita Membro Commissione
      </h3>

      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Invio in corso...' : 'Invia Invito'}
        </button>
      </form>
    </div>
  )
} 