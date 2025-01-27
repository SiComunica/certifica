"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
    conventionCode?: string
    conventionDiscount?: number
    documents?: Record<string, string>
    finalPrice: number
  }
  onSubmit: (data: any) => void
  onBack: () => void
}

export default function Step4Payment({ formData, onSubmit, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [finalPrice, setFinalPrice] = useState(0)
  const [conventioneCode, setConventioneCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

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

  const verifyConventionCode = async () => {
    try {
      setIsLoading(true)
      const { data: convention } = await supabase
        .from('conventions')
        .select('*')
        .eq('code', conventioneCode)
        .single()

      if (convention) {
        // Verifichiamo che la convenzione sia ancora valida
        const now = new Date()
        const expiryDate = new Date(convention.expiry_date)
        
        if (expiryDate > now && convention.is_active) {
          // Applichiamo lo sconto
          const discountedPrice = finalPrice * (1 - convention.discount_percentage / 100)
          setFinalPrice(discountedPrice)
          setDiscountApplied(true)
          toast.success("Codice convenzione applicato con successo!")
        } else {
          toast.error("Codice convenzione scaduto o non più valido")
        }
      } else {
        toast.error("Codice convenzione non valido")
      }
    } catch (error) {
      console.error('Errore verifica convenzione:', error)
      toast.error("Errore nella verifica del codice convenzione")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      
      // Salviamo la pratica come pending_payment
      await supabase.from('practices').update({
        status: 'pending_payment',
        convention_code: discountApplied ? conventioneCode : null,
        final_price: finalPrice
      }).eq('id', formData.practiceId)

      // Redirect diretto a EasyCommerce
      window.location.href = `${process.env.NEXT_PUBLIC_EASY_PAYMENT_URL}/payment?amount=${Math.round(finalPrice * 100)}&returnUrl=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/dashboard/pratiche')}`

    } catch (error) {
      console.error('Errore redirect pagamento:', error)
      toast.error("Errore durante il redirect al pagamento")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Riepilogo Pratica</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Dipendente</h3>
            <p>{formData.employeeName}</p>
            <p className="text-sm text-gray-600">{formData.fiscalCode}</p>
          </div>

          <div>
            <h3 className="font-medium">Contratto</h3>
            <p>{formData.contractTypeName}</p>
            {formData.contractValue > 0 && (
              <p className="text-sm text-gray-600">
                Valore: €{formData.contractValue.toFixed(2)}
              </p>
            )}
          </div>

          {formData.conventionCode && (
            <div>
              <h3 className="font-medium">Convenzione Applicata</h3>
              <p>Sconto del {formData.conventionDiscount}%</p>
            </div>
          )}

          <div>
            <h3 className="font-medium">Documenti Allegati</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {Object.entries(formData.documents || {}).map(([id, fileName]) => (
                <li key={id}>{fileName.toString().split('/').pop()}</li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium">Totale da Pagare</h3>
            <p className="text-2xl font-bold">€{formData.finalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Indietro
        </Button>
        <Button onClick={() => onSubmit(formData)}>
          Procedi al Pagamento
        </Button>
      </div>
    </div>
  )
} 