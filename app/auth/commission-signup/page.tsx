"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function CommissionSignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Controlla se l'utente arriva da un magic link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setEmail(session.user.email)
        // Se l'utente è già autenticato dal magic link, mostra solo il form password
        toast.info('Email verificata. Imposta la tua password per completare la registrazione.')
      }
    }
    checkSession()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Se l'utente è già autenticato, aggiorna solo la password
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Aggiorna password e ruolo
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
          data: { role: 'admin' }
        })
        if (updateError) throw updateError
      } else {
        // Registrazione completa per nuovi utenti
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'admin' }
          }
        })
        if (signUpError) throw signUpError
      }

      // Aggiorna il profilo
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', email)

      if (updateError) throw updateError

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
      
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
            disabled={!!email} // Disabilita se email già impostata dal magic link
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