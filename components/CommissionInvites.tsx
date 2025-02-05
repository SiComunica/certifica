"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function CommissionInvites() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/commission/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'invio dell\'invito')
      }

      toast.success('Invito inviato con successo')
      setEmail('')
      loadInvites()
    } catch (error: any) {
      toast.error(error.message || 'Errore nell\'invio dell\'invito')
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_invites')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Inviti caricati:', data)
    } catch (error) {
      console.error('Errore caricamento inviti:', error)
      toast.error('Errore nel caricamento degli inviti')
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleInvite} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Inserisci email"
            className="flex-1 px-3 py-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Invio...' : 'Invita Membro'}
          </button>
        </div>
      </form>
    </div>
  )
} 