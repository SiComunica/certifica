import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Scambia il codice per una sessione
    await supabase.auth.exchangeCodeForSession(code)
    
    // Reindirizza alla pagina di registrazione commissione
    return NextResponse.redirect(new URL('/auth/commission-signup', request.url))
  }

  // Se non c'è un codice, reindirizza alla home
  return NextResponse.redirect(new URL('/', request.url))
} 