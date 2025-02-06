"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function CommissionRegister() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Verifica il codice invito
      const { data: inviteData, error: inviteError } = await supabase
        .from('commission_invite_codes')
        .select()
        .eq('code', inviteCode)
        .eq('used', false)
        .single()

      if (inviteError || !inviteData) {
        throw new Error('Codice invito non valido o già utilizzato')
      }

      if (inviteData.email !== email) {
        throw new Error('Email non corrisponde al codice invito')
      }

      if (new Date(inviteData.expires_at) < new Date()) {
        throw new Error('Codice invito scaduto')
      }

      // 2. Registra l'utente
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'admin' }
        }
      })

      if (signUpError) throw signUpError

      // 3. Marca il codice come utilizzato
      await supabase
        .from('commission_invite_codes')
        .update({ used: true })
        .eq('code', inviteCode)

      toast.success('Registrazione completata')
      router.push('/dashboard/admin')

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Registrazione Membro Commissione</h1>
      
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Codice Invito</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registrazione...' : 'Registrati'}
        </button>
      </form>
    </div>
  )
} 