'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface RegistrationData {
  email: string
  password: string
  companyName: string
  vatNumber: string
  fiscalCode: string
  city: string
  address: string
}

export function EmployerRegistration() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    companyName: '',
    vatNumber: '',
    fiscalCode: '',
    city: '',
    address: ''
  })
  
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Registra l'utente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: 'employer'
          }
        }
      })

      if (authError) throw authError

      // 2. Crea il profilo del datore di lavoro
      const { error: profileError } = await supabase
        .from('employer_profiles')
        .insert({
          id: authData.user!.id,
          company_name: formData.companyName,
          vat_number: formData.vatNumber,
          fiscal_code: formData.fiscalCode,
          city: formData.city,
          address: formData.address
        })

      if (profileError) throw profileError

      toast({
        title: "Registrazione completata",
        description: "Controlla la tua email per verificare l'account.",
      })

      router.push('/auth/verify')
    } catch (error) {
      toast({
        title: "Errore durante la registrazione",
        description: (error as Error).message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
        <Input
          placeholder="Nome Azienda"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          required
        />
        <Input
          placeholder="Partita IVA"
          value={formData.vatNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
          required
        />
        <Input
          placeholder="Codice Fiscale"
          value={formData.fiscalCode}
          onChange={(e) => setFormData(prev => ({ ...prev, fiscalCode: e.target.value }))}
          required
        />
        <Input
          placeholder="Città"
          value={formData.city}
          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          required
        />
        <Input
          placeholder="Indirizzo"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Registrazione in corso...' : 'Registrati'}
      </Button>
    </form>
  )
} 