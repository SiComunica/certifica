"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

interface CommissionMember {
  id: string
  email: string
  full_name: string | null
  status: 'pending' | 'active'
  created_at: string
  joined_at: string | null
  invited_by: string
}

export default function CommissionManagementPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<CommissionMember[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadMembers()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Ottieni l'ID dell'utente corrente (admin)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      // Crea il record del membro
      const { data: member, error: dbError } = await supabase
        .from('commission_members')
        .insert([
          { 
            email,
            invited_by: user.id,
            status: 'pending'
          }
        ])
        .select()
        .single()

      if (dbError) throw dbError

      // Invia email di invito
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          template: 'commissionInvite',
          data: {
            inviteUrl: `${window.location.origin}/register?invite=${member.id}`,
          }
        })
      })

      if (!response.ok) throw new Error('Errore invio email')

      toast.success('Invito inviato con successo')
      setEmail('')
      loadMembers()

    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nell'invio dell'invito")
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])

    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nel caricamento membri')
    }
  }

  const handleRevoke = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('commission_members')
        .update({ status: 'revoked' })
        .eq('id', memberId)

      if (error) throw error

      toast.success('Accesso revocato')
      loadMembers()

    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nella revoca accesso')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestione Commissione</h1>

      {/* Form Invito */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Invita Nuovo Membro</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="email@esempio.it"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Invio in corso...' : 'Invia Invito'}
          </button>
        </form>
      </div>

      {/* Lista Membri */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold p-6 border-b">Membri Commissione</h2>
        <div className="divide-y">
          {members.map((member) => (
            <div key={member.id} className="p-6 flex justify-between items-center">
              <div>
                <p className="font-medium">{member.email}</p>
                <p className="text-sm text-gray-500">
                  Invitato il: {new Date(member.created_at).toLocaleDateString()}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {member.status === 'active' ? 'Attivo' : 'In Attesa'}
                </span>
              </div>
              {member.status === 'active' && (
                <button
                  onClick={() => handleRevoke(member.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Revoca Accesso
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 