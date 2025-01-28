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
  formData: {
    employeeName: string
    fiscalCode: string
    contractType: string
    contractTypeName: string
    contractValue: number
    finalPrice: number
    conventionCode?: string
    conventionDiscount?: number
    quantity: number
    isOdcec: boolean
    isRenewal: boolean
    practiceId: string
    documents: Record<string, string>
  }
  onSubmit: (data: any) => void
  onBack: () => void
}

export default function Step4Payment({ formData, onSubmit, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [finalPrice, setFinalPrice] = useState(formData.finalPrice || 0)
  const [conventionCode, setConventionCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const verifyConvention = async () => {
    if (!conventionCode.trim()) {
      toast.error("Inserisci un codice convenzione")
      return
    }

    setIsVerifying(true)
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

      const discountAmount = (formData.finalPrice * convention.discount_percentage) / 100
      const newPrice = formData.finalPrice - discountAmount

      setFinalPrice(newPrice)
      setAppliedDiscount(convention.discount_percentage)
      toast.success(`Sconto del ${convention.discount_percentage}% applicato!`)

    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nella verifica del codice")
    } finally {
      setIsVerifying(false)
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

  const getDocumentName = (key: string): string => {
    const fileName = formData.documents[key]
    return typeof fileName === 'string' ? fileName.split('/').pop() || '' : ''
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
                <li key={id}>{getDocumentName(id)}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium mb-4">Codice Convenzione</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              value={conventionCode}
              onChange={(e) => setConventionCode(e.target.value)}
              placeholder="Inserisci il codice convenzione"
              disabled={!!appliedDiscount}
            />
            <Button
              onClick={verifyConvention}
              disabled={isVerifying || !!appliedDiscount}
            >
              {isVerifying ? "Verifica..." : "Applica"}
            </Button>
          </div>
          
          {appliedDiscount && (
            <div className="mt-2 p-3 bg-green-50 rounded">
              <p className="text-green-600">
                Sconto del {appliedDiscount}% applicato
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium">Totale da Pagare</h3>
          <p className="text-2xl font-bold">€{finalPrice.toFixed(2)}</p>
          {appliedDiscount && (
            <p className="text-sm text-green-600">
              Risparmi: €{(formData.finalPrice - finalPrice).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Indietro
        </Button>
        <Button 
          onClick={() => onSubmit({ 
            ...formData, 
            finalPrice,
            conventionDiscount: appliedDiscount 
          })}
        >
          Procedi al Pagamento
        </Button>
      </div>
    </div>
  )
} 