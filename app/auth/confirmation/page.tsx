"use client"
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function ConfirmationPage() {
  const [message, setMessage] = useState('Verifica in corso...')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setMessage('Email confermata con successo!')
        // Attendi 2 secondi prima di reindirizzare
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setMessage('Errore durante la conferma. Riprova più tardi.')
      }
    }

    checkSession()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {message === 'Email confermata con successo!' ? (
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="mx-auto h-12 w-12 text-blue-500 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Verifica Email
        </h2>
        <p className="mt-2 text-gray-600">
          {message}
        </p>
        {message.includes('Errore') && (
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-6 w-full bg-[#2E86C1] text-white font-medium h-12 rounded-lg
                     hover:bg-[#2874A6] transition-colors"
          >
            Torna al Login
          </button>
        )}
      </div>
    </div>
  )
} 