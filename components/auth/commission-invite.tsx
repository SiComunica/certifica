'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { invitesApi } from '@/lib/supabase/invites'
import { emailService } from '@/lib/email'

export function CommissionInvite() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const invite = await invitesApi.createInvite(email)
      
      // Invia email con il link di invito
      await emailService.sendCommissionInvite(email, invite.token)

      toast({
        title: "Invito inviato",
        description: "Il membro della commissione riceverà un'email con il link per registrarsi.",
      })

      setEmail('')
    } catch (error) {
      toast({
        title: "Errore",
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
          placeholder="Email del membro della commissione"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Invio in corso...' : 'Invia Invito'}
      </Button>
    </form>
  )
} 