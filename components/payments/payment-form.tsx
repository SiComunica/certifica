'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { pagopaApi } from '@/lib/pagopa'

interface PaymentFormProps {
  amount: number
  contractId: string
  onSuccess?: () => void
}

export function PaymentForm({ amount, contractId, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payment = await pagopaApi.createPayment({
        amount,
        description: `Pagamento pratica #${contractId}`,
        email: 'email@esempio.com', // Dovresti prendere questa dall'utente
        fiscalCode: 'ABCDEF12G34H567I', // Dovresti prendere questo dall'utente
        orderId: `${contractId}-${Date.now()}`
      })

      // Reindirizza l'utente alla pagina di pagamento di PagoPA
      window.location.href = payment.paymentUrl

    } catch (error) {
      showToast("Errore durante il pagamento", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm font-medium">Importo da pagare</p>
        <p className="text-2xl font-bold">€ {amount.toFixed(2)}</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Elaborazione...' : 'Procedi al pagamento'}
      </Button>
    </form>
  )
} 