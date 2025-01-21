import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { assignmentEmailTemplate, statusUpdateTemplate } from '../email/templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await request.json()
  const { type, practiceId, memberId, newStatus } = body

  try {
    // Recupera i dati della pratica
    const { data: practice } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practiceId)
      .single()

    if (!practice) {
      throw new Error('Pratica non trovata')
    }

    let emailData

    if (type === 'assignment') {
      // Recupera i dati del membro
      const { data: member } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .single()

      if (!member) {
        throw new Error('Membro non trovato')
      }

      emailData = {
        from: 'noreply@tuodominio.it',
        to: member.email,
        subject: `Nuova Pratica Assegnata - #${practice.practice_number}`,
        html: assignmentEmailTemplate(practice, member)
      }
    } else if (type === 'status_update') {
      // Recupera l'email del responsabile
      const { data: assignedMember } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', practice.assigned_to)
        .single()

      emailData = {
        from: 'noreply@tuodominio.it',
        to: assignedMember?.email,
        subject: `Aggiornamento Stato Pratica - #${practice.practice_number}`,
        html: statusUpdateTemplate(practice, newStatus)
      }
    }

    if (emailData) {
      await resend.emails.send(emailData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Errore invio email:', error)
    return NextResponse.json({ error: 'Errore invio email' }, { status: 500 })
  }
} 