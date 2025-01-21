'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { invitesApi } from '@/lib/supabase/invites'

interface RegistrationData {
  email: string
  password: string
  token: string
}

export function CommissionRegistration({ token }: { token: string }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    token
  })
  
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Verifica l'invito
      const invite = await invitesApi.verifyInvite(formData.token)

      // 2. Registra l'utente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: 'commission_member'
          }
        }
      })

      if (authError) throw authError

      // 3. Crea il profilo del membro della commissione
      const { error: profileError } = await supabase
        .from('commission_members')
        .insert({
          id: authData.user!.id
        })

      if (profileError) throw profileError

      // 4. Segna l'invito come accettato
      await supabase
        .from('commission_invites')
        .update({ accepted: true })
        .eq('token', formData.token)

      toast({
        title: "Registrazione completata",
        description: "Controlla la tua email per verificare l'account.",
      })

      router.push('/auth/verify')
    } catch (error) {
      toast({
        title: "Errore durante la registrazione",
        description: (error as Error).message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Registrazione in corso...' : 'Completa Registrazione'}
      </Button>
    </form>
  )
} 