"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function CommissionRegisterPage() {
  const [loading, setLoading] = useState(true)
  const [inviteValid, setInviteValid] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteId = searchParams.get('invite')
  const supabase = createClientComponentClient()

  // Verifica l'invito
  useEffect(() => {
    async function verifyInvite() {
      if (!inviteId) {
        toast.error('Invito non valido')
        router.push('/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('commission_members')
          .select('email, status')
          .eq('id', inviteId)
          .single()

        if (error || !data || data.status !== 'pending') {
          throw new Error('Invito non valido o già utilizzato')
        }

        setEmail(data.email)
        setInviteValid(true)

      } catch (error) {
        console.error('Errore:', error)
        toast.error('Invito non valido o scaduto')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    verifyInvite()
  }, [inviteId, router, supabase])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Crea l'utente in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'commission_member'
          }
        }
      })

      if (authError) throw authError

      // 2. Aggiorna lo stato dell'invito
      const { error: updateError } = await supabase
        .from('commission_members')
        .update({ 
          status: 'active',
          joined_at: new Date().toISOString(),
          full_name: fullName
        })
        .eq('id', inviteId)

      if (updateError) throw updateError

      // 3. Crea/aggiorna il profilo
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user!.id,
          full_name: fullName,
          email,
          role: 'commission_member',
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      toast.success('Registrazione completata')
      router.push('/dashboard')

    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verifica invito in corso...</p>
      </div>
    )
  }

  if (!inviteValid) {
    return null // Redirect già gestito nell'useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrazione Membro Commissione
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Completa la registrazione per accedere al portale
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="fullName" className="sr-only">
                Nome Completo
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome Completo"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Registrazione in corso...' : 'Completa Registrazione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 