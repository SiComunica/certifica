"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function CommissionInvites() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  // Funzione di validazione email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validazione email
    if (!isValidEmail(email)) {
      toast.error('Inserisci un indirizzo email valido')
      return
    }

    setLoading(true)

    try {
      console.log('Invio invito a:', email)
      const response = await fetch('/api/commission/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }), // Rimuoviamo spazi extra
      })

      const data = await response.json()
      console.log('Risposta:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'invio dell\'invito')
      }

      toast.success('Invito inviato con successo')
      setEmail('')
      loadInvites()
    } catch (error: any) {
      console.error('Errore:', error)
      toast.error(error.message || 'Errore nell\'invio dell\'invito')
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
            onChange={(e) => setEmail(e.target.value.trim())} // Rimuoviamo spazi mentre si digita
            placeholder="Inserisci email"
            className="flex-1 px-3 py-2 border rounded"
            required
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+" // Validazione HTML5
          />
          <button
            type="submit"
            disabled={loading || !isValidEmail(email)}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Invio...' : 'Invita Membro'}
          </button>
        </div>
      </form>
    </div>
  )
} 