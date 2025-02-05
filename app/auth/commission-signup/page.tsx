"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

function CommissionSignUpContent() {
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const setupMember = async () => {
      try {
        // Ottieni il token dall'URL
        const token = searchParams.get('token')
        
        if (!token) {
          toast.error('Token di invito non valido')
          router.push('/')
          return
        }

        // Verifica se l'utente è già autenticato
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Imposta il ruolo member
          const { error } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('user_id', user.id)

          if (error) throw error

          toast.success('Registrazione completata')
          router.push('/dashboard/admin')
        }

        setLoading(false)
      } catch (error) {
        console.error('Errore setup:', error)
        toast.error('Errore durante la registrazione')
        router.push('/')
      }
    }

    setupMember()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Completa la registrazione con la password
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) throw error

      toast.success('Password impostata con successo')
      router.push('/dashboard/admin')
    } catch (error) {
      console.error('Errore registrazione:', error)
      toast.error('Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Caricamento...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold">
            Completa la Registrazione
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Imposta la tua password per accedere come membro della commissione
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border p-2"
              placeholder="Inserisci la tua password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Completamento...' : 'Completa Registrazione'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CommissionSignUp() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <CommissionSignUpContent />
    </Suspense>
  )
} 