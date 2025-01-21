'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Contract } from '@/lib/supabase/contracts'
import { Payment } from '@/lib/supabase/payments'
import { PaymentForm } from '@/components/payments/payment-form'
import { PaymentStatus } from '@/components/payments/payment-status'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ContractDetailPage() {
  const [contract, setContract] = useState<Contract | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const { id } = useParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadContractAndPayment = async () => {
      // Carica il contratto
      const { data: contractData } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single()

      setContract(contractData)

      // Carica l'ultimo pagamento
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('contract_id', id)
        .order('created_at', { ascending: false })
        .limit(1)

      setPayment(payments?.[0] || null)
    }

    loadContractAndPayment()
  }, [id, supabase])

  const handlePaymentSuccess = () => {
    // Ricarica i dati del contratto e del pagamento
    window.location.reload()
  }

  if (!contract) {
    return <div>Caricamento...</div>
  }

  return (
    <div className="space-y-8">
      {/* Dettagli del contratto */}
      <div>
        <h2 className="text-2xl font-bold">Dettagli Contratto</h2>
        {/* ... altri dettagli del contratto ... */}
      </div>

      {/* Sezione pagamento */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Pagamento</h3>
        {!payment && (
          <PaymentForm 
            amount={299.99} // Importo fisso o calcolato
            contractId={contract.id}
            onSuccess={handlePaymentSuccess}
          />
        )}
        {payment && (
          <PaymentStatus 
            paymentId={payment.id}
            onComplete={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  )
} 