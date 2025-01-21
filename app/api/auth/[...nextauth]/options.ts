import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const supabase = createClientComponentClient()

        try {
          const { data: { user: supabaseUser }, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !supabaseUser) return null

          // Convertiamo l'utente Supabase nel formato NextAuth
          const user: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || null, // Gestione del caso undefined
            name: supabaseUser.email?.split('@')[0] || 'User',
            image: null,
            role: supabaseUser.role || 'user' // Aggiungiamo il ruolo
          }

          return user
        } catch (error) {
          console.error('Errore di autenticazione:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/auth/login',
  }
} 