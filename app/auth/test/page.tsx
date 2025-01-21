"use client"
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function TestAuth() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<string>('')
  const supabase = createClientComponentClient()

  const testConnection = async () => {
    try {
      // Test connessione base
      const { data, error } = await supabase.from('organizations').select('count')
      setResult(`Connessione DB: ${error ? 'Fallita' : 'OK'}\n${error ? error.message : ''}`)
      
      // Test auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: 'test12345',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      setResult(prev => `${prev}\n\nAuth Test: ${authError ? 'Fallito' : 'OK'}\n${
        authError ? authError.message : 'Check email for confirmation'
      }`)
      
    } catch (e) {
      setResult(`Error: ${(e as Error).message}`)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Test Autenticazione</h1>
      <div className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Connessione
        </button>
        <pre className="bg-gray-100 p-4 rounded mt-4 whitespace-pre-wrap">
          {result}
        </pre>
      </div>
    </div>
  )
} 