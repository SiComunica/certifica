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

  // Proteggi le rotte /dashboard
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Proteggi le rotte della commissione
  if (req.nextUrl.pathname.startsWith('/dashboard/commission')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Verifica ruolo commissione
    const { data: profile } = await supabase
      .from('commission_members')
      .select('status')
      .eq('user_id', session.user.id)
      .single()

    if (!profile || profile.status !== 'active') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Proteggi le rotte admin
  if (req.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*']
} 