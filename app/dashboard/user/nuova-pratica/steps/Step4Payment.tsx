"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface Props {
  formData: {
    employeeName: string
    fiscalCode: string
    contractType: string
    contractValue: number
    isOdcec: boolean
    isRenewal: boolean
    quantity: number
    contractTypeName: string
    practiceId: string
    email?: string
  }
  onSubmit: (data: any) => void
  onBack: () => void
}

export default function Step4Payment({ formData, onSubmit, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [finalPrice, setFinalPrice] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    calculatePrice()
  }, [formData])

  const calculatePrice = async () => {
    try {
      const { data: priceRange } = await supabase
        .from('price_ranges')
        .select('*')
        .eq('contract_type_id', formData.contractType)
        .eq('is_odcec', formData.isOdcec)
        .eq('is_renewal', formData.isRenewal)
        .single()

      if (priceRange) {
        let price = priceRange.base_price
        if (priceRange.is_percentage && formData.contractValue > priceRange.threshold_value) {
          const excess = formData.contractValue - priceRange.threshold_value
          price += (excess * priceRange.percentage_value / 100)
        }
        price *= formData.quantity
        setFinalPrice(price)
      }
    } catch (error) {
      console.error('Errore calcolo prezzo:', error)
      toast.error("Errore nel calcolo del prezzo")
    }
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      
      // Genera avviso di pagamento
      const response = await fetch('/api/genera-avviso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomecognome: formData.employeeName,
          codicefiscale: formData.fiscalCode,
          email: formData.email || 'default@uniba.it',
          codiceprodotto: formData.contractType,
          prezzo: Math.round(finalPrice * 100) // Convertiamo in centesimi
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message)
      }

      // Salva IUV e codice avviso nel DB
      await supabase.from('practices').update({
        iuv: data.iuv,
        codice_avviso: data.codiceavviso,
        status: 'pending_payment'
      }).eq('id', formData.practiceId)

      // Redirect alla piattaforma di pagamento
      window.location.href = `${process.env.NEXT_PUBLIC_EASY_PAYMENT_URL}/${data.codiceavviso}`

    } catch (error) {
      console.error('Errore pagamento:', error)
      toast.error("Errore durante il pagamento")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Riepilogo Pratica</h2>
        <div className="space-y-2">
          <p><strong>Dipendente:</strong> {formData.employeeName}</p>
          <p><strong>Tipo Contratto:</strong> {formData.contractTypeName}</p>
          <p><strong>Quantità:</strong> {formData.quantity}</p>
          {formData.isOdcec && <p>Convenzione ODCEC applicata</p>}
          {formData.isRenewal && <p>Tariffa rinnovo applicata</p>}
          <p className="text-xl font-bold mt-4">Totale: €{finalPrice.toFixed(2)}</p>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Indietro</Button>
        <Button 
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? "Elaborazione..." : "Procedi al Pagamento"}
        </Button>
      </div>
    </div>
  )
} 