import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('Test email a:', email)
    
    const supabase = createRouteHandlerClient({ cookies })

    // Test base con reset password
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      console.error('Errore test email:', error)
      throw error
    }

    console.log('Test email inviato')
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Errore:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 