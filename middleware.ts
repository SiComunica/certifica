import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Percorsi pubblici che non richiedono autenticazione
  const publicPaths = ['/auth/login', '/auth/register', '/auth/reset', '/auth/confirmation']
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname)

  if (!session && !isPublicPath) {
    // Reindirizza al login se non autenticato e non in un percorso pubblico
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (session && isPublicPath) {
    // Reindirizza alla dashboard se già autenticato e si prova ad accedere a percorsi pubblici
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Se l'utente sta accedendo alla pagina di registrazione commissione
  if (req.nextUrl.pathname === '/auth/commission-signup') {
    if (!session) {
      // Se non è autenticato, reindirizza alla pagina di login
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  // Se c'è un parametro commission, reindirizza alla pagina commissione
  if (req.nextUrl.searchParams.has('commission')) {
    const token = req.nextUrl.searchParams.get('token')
    return NextResponse.redirect(new URL(`/auth/commission-signup?token=${token}`, req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|api).*)',
    '/auth/commission-signup',
    '/auth/callback'
  ],
}