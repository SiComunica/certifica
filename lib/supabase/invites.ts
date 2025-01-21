import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Invite {
  id: string
  email: string
  token: string
  created_at: string
  expires_at: string
  accepted: boolean
}

export const invitesApi = {
  async createInvite(email: string) {
    const supabase = createClientComponentClient()
    const token = crypto.randomUUID()
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + 7) // Scade dopo 7 giorni

    const { data, error } = await supabase
      .from('commission_invites')
      .insert({
        email,
        token,
        expires_at: expires_at.toISOString(),
        accepted: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async verifyInvite(token: string) {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('commission_invites')
      .select()
      .eq('token', token)
      .single()

    if (error) throw error
    if (!data) throw new Error('Invito non valido')
    if (data.accepted) throw new Error('Invito già utilizzato')
    if (new Date(data.expires_at) < new Date()) throw new Error('Invito scaduto')

    return data
  }
} 