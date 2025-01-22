import { useContext } from 'react'
import { ToastContext } from './toast'

// Tipo per le opzioni del toast
export interface ToastOptions {
  message: string
  variant?: "default" | "success" | "error"
}

// Hook personalizzato per usare i toast
export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast deve essere usato all\'interno di ToastProvider')
  }
  
  return context
}

// Funzione helper per mostrare i toast
export function toast(options: ToastOptions | string) {
  const context = useContext(ToastContext)
  
  if (!context) {
    console.error('Toast provider non trovato')
    return
  }

  if (typeof options === "string") {
    context.showToast(options)
  } else {
    context.showToast(options.message, options.variant)
  }
} 