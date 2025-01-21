'use client'

import { useEffect, useState } from 'react'
import { Payment, paymentsApi } from '@/lib/supabase/payments'
import { useToast } from '@/components/ui/use-toast'

interface PaymentStatusProps {
  paymentId: string
  onComplete?: () => void
}

export function PaymentStatus({ paymentId, onComplete }: PaymentStatusProps) {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await paymentsApi.verifyStatus(paymentId)
        setPayment(status)

        if (status.status === 'completed' && onComplete) {
          onComplete()
        }
      } catch (error) {
        toast({
          title: "Errore",
          description: "Impossibile verificare lo stato del pagamento",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    const interval = setInterval(checkStatus, 5000) // Verifica ogni 5 secondi
    checkStatus() // Verifica immediata

    return () => clearInterval(interval)
  }, [paymentId, onComplete, toast])

  if (loading) {
    return <div>Verifica del pagamento in corso...</div>
  }

  if (!payment) {
    return <div>Pagamento non trovato</div>
  }

  return (
    <div className="rounded-lg bg-muted p-4">
      <p className="text-sm font-medium">Stato del pagamento</p>
      <p className="text-lg font-bold">
        {payment.status === 'completed' && 'Pagamento completato'}
        {payment.status === 'pending' && 'Pagamento in elaborazione'}
        {payment.status === 'failed' && 'Pagamento fallito'}
      </p>
    </div>
  )
} 