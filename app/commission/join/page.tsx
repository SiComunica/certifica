"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { validatePassword } from '@/lib/utils/password-validation'

export default function JoinCommission() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [loading, setLoading] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [email, setEmail] = useState("")
  const [formData, setFormData] = useState({
    password: "",
    fullName: "",
  })
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  useEffect(() => {
    verifyToken()
  }, [token])

  const verifyToken = async () => {
    if (!token) {
      toast.error("Token mancante")
      return
    }

    try {
      const { data, error } = await supabase
        .from('commission_invites')
        .select('email, accepted_at, expires_at')
        .eq('token', token)
        .single()

      if (error) throw error

      if (!data) {
        toast.error("Invito non valido")
        return
      }

      if (data.accepted_at) {
        toast.error("Invito già accettato")
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        toast.error("Invito scaduto")
        return
      }

      setEmail(data.email)
      setValidToken(true)
    } catch (error) {
      console.error('Errore verifica token:', error)
      toast.error("Errore nella verifica dell'invito")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validazione password
    const { isValid, errors } = validatePassword(formData.password)
    if (!isValid) {
      setPasswordErrors(errors)
      setLoading(false)
      return
    }

    try {
      // 1. Crea l'account utente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'commission_member'
          }
        }
      })

      if (authError) throw authError

      // 2. Aggiorna lo stato dell'invito
      const { error: updateError } = await supabase
        .from('commission_invites')
        .update({ 
          accepted_at: new Date().toISOString(),
          user_id: authData.user?.id
        })
        .eq('token', token)

      if (updateError) throw updateError

      // 3. Crea il profilo membro commissione
      const { error: profileError } = await supabase
        .from('commission_members')
        .insert([{
          user_id: authData.user?.id,
          full_name: formData.fullName,
          email: email,
          status: 'active'
        }])

      if (profileError) throw profileError

      toast.success("Account creato con successo")
      router.push('/dashboard')

    } catch (error: any) {
      console.error('Errore creazione account:', error)
      toast.error(error.message || "Errore nella creazione dell'account")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Verifica invito in corso...</p>
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Invito non valido o scaduto
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">
            Crea Account Membro Commissione
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  fullName: e.target.value
                }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    password: e.target.value
                  }))
                  setPasswordErrors([]) // Reset errori quando l'utente digita
                }}
                required
              />
              {passwordErrors.length > 0 && (
                <ul className="text-sm text-red-500 list-disc pl-4">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creazione account...' : 'Crea Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 