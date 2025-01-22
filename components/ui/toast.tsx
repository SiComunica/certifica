"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error"
  onClose?: () => void
}

export function Toast({ 
  className, 
  variant = "default", 
  children, 
  onClose,
  ...props 
}: ToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg",
        variant === "success" && "bg-green-100 text-green-800",
        variant === "error" && "bg-red-100 text-red-800",
        variant === "default" && "bg-white text-gray-800",
        className
      )}
      role="alert"
      {...props}
    >
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto rounded-full p-1 hover:bg-black/10"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// Componente di contesto per gestire i toast
export const ToastContext = React.createContext<{
  showToast: (message: string, variant?: ToastProps["variant"]) => void
}>({
  showToast: () => {}
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<{
    message: string
    variant?: ToastProps["variant"]
  } | null>(null)

  const showToast = React.useCallback((message: string, variant?: ToastProps["variant"]) => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast variant={toast.variant} onClose={() => setToast(null)}>
          {toast.message}
        </Toast>
      )}
    </ToastContext.Provider>
  )
}

// Hook per usare i toast
export function useToast() {
  return React.useContext(ToastContext)
} 