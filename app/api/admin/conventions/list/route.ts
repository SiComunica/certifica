import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Query corretta basata sulla struttura del database
    const { data, error } = await supabase
      .from('company_conventions')
      .select(`
        id,
        convention_id,
        company_id,
        notification_sent,
        companies!company_id (
          company_name,
          email
        ),
        conventions!convention_id (
          code,
          discount_percentage
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.log('Server error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
} 