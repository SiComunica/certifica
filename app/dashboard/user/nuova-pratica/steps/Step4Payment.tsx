"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Convention {
  id: string
  code: string
  discount_percentage: number
  description: string
  is_active: boolean
}

interface FormData {
  employeeName: string
  fiscalCode: string
  contractType: string
  contractValue: number
  conventionCode?: string
  conventionDiscount?: number
  isRenewal: boolean
  isOdcec: boolean
  quantity: number
  contractTypeName: string
  practiceId: string
  documents: Record<string, string>
  finalPrice: number
}

interface Props {
  formData: FormData
  onSubmit: (data: FormData) => void
  onBack: () => void
}

export default function Step4Payment({ formData, onSubmit, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [finalPrice, setFinalPrice] = useState(0)
  const [conventionCode, setConventionCode] = useState("")
  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [appliedConvention, setAppliedConvention] = useState<Convention | null>(null)
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

  const handleApplyConvention = async () => {
    if (!conventionCode.trim()) {
      toast.error("Inserisci un codice convenzione")
      return
    }

    setIsCheckingCode(true)
    try {
      const { data: convention, error } = await supabase
        .from('conventions')
        .select('*')
        .eq('code', conventionCode)
        .eq('is_active', true)
        .single()

      if (error || !convention) {
        toast.error("Codice convenzione non valido")
        return
      }

      setAppliedConvention(convention)
      const discountedPrice = formData.finalPrice - (formData.finalPrice * convention.discount_percentage / 100)
      
      onSubmit({
        ...formData,
        conventionCode: convention.code,
        conventionDiscount: convention.discount_percentage,
        finalPrice: discountedPrice
      })

      toast.success(`Sconto del ${convention.discount_percentage}% applicato!`)
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nella verifica del codice")
    } finally {
      setIsCheckingCode(false)
    }
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      
      // Salviamo la pratica come pending_payment
      await supabase.from('practices').update({
        status: 'pending_payment',
        convention_code: conventionCode,
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
        </div>

        <div className="mt-6 pt-4 border-t">
          <h3 className="font-medium mb-2">Hai un codice convenzione?</h3>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={conventionCode}
              onChange={(e) => setConventionCode(e.target.value)}
              placeholder="Inserisci codice"
              className="max-w-xs"
            />
            <Button 
              variant="outline"
              onClick={handleApplyConvention}
              disabled={isCheckingCode || !!appliedConvention}
            >
              {isCheckingCode ? "Verifica..." : "Applica"}
            </Button>
          </div>
          {appliedConvention && (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-600">
                Sconto del {appliedConvention.discount_percentage}% applicato
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t mt-6">
          <h3 className="font-medium">Totale da Pagare</h3>
          <p className="text-2xl font-bold">€{formData.finalPrice.toFixed(2)}</p>
          {appliedConvention && (
            <p className="text-sm text-green-600 mt-1">
              Risparmio: €{((formData.finalPrice * appliedConvention.discount_percentage / 100)).toFixed(2)}
            </p>
          )}
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