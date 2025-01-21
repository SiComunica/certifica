import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { CommissionInviteEmail } from '@/components/email/commission-invite-template'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verifica autenticazione
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return Response.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { email } = await req.json()

    // Genera token invito
    const token = crypto.randomUUID()
    
    // Salva invito nel database
    const { error: dbError } = await supabase
      .from('commission_invites')
      .insert([
        {
          email,
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
          invited_by: session.user.id
        }
      ])

    if (dbError) {
      throw dbError
    }

    // Costruisci URL invito
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/commission/join?token=${token}`

    // Invia email
    await resend.emails.send({
      from: 'Certifica <noreply@certifica.local>',
      to: [email],
      subject: 'Invito Commissione Certifica',
      react: CommissionInviteEmail({ 
        inviteUrl,
        recipientEmail: email
      })
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error('Errore invito:', error)
    return Response.json(
      { error: "Errore durante l'invio dell'invito" },
      { status: 500 }
    )
  }
} 