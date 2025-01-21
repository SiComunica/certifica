import { create } from 'zustand'

interface AuthState {
  user: null | { email: string }
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      // Qui andrà la vera chiamata API
      // Per ora simuliamo una chiamata
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simula un login riuscito
      if (email === "test@example.com" && password === "password") {
        set({ user: { email }, isAuthenticated: true })
        return { success: true }
      }

      return { 
        success: false, 
        error: "Credenziali non valide" 
      }
    } catch (error) {
      return { 
        success: false, 
        error: "Errore durante l'accesso" 
      }
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
  }
})) 