"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { calculatePrice } from "@/lib/utils"
import { PriceRange, FormData } from "../types"

interface Convention {
  id: string
  code: string
  discount_percentage: number
  is_active: boolean
}

interface ApiError {
  message: string
  code?: string | number
  details?: Record<string, unknown>
  [key: string]: unknown
}

interface Props {
  formData: FormData
  onSubmit: (data: any) => void
  onBack: () => void
}

// Funzione helper per gestire gli errori
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError
    return apiError.message || "Errore sconosciuto"
  }
  
  return "Errore durante l'avvio del pagamento"
}

// Funzione helper per estrarre il nome del file
const getFileName = (fileName: unknown): string => {
  if (typeof fileName !== 'string') {
    return ''
  }
  const parts = fileName.split('/')
  return parts[parts.length - 1] || ''
}

export default function Step4Payment({ formData, onSubmit, onBack }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [conventionCode, setConventionCode] = useState("")
  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [appliedConvention, setAppliedConvention] = useState<Convention | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)

  const verifyConvention = async () => {
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

      const discountAmount = (totalPrice * convention.discount_percentage) / 100
      const newPrice = totalPrice - discountAmount

      setTotalPrice(newPrice)
      setAppliedConvention(convention)
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
      setIsProcessing(true)
      console.log('Invio dati pagamento:', {
        totalPrice: formData.priceInfo.base_price,
        productId: formData.productId,
        // Log altri dati
        formData
      })

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalPrice: formData.priceInfo.base_price,
          productId: formData.productId,
          employeeName: formData.employeeName,
          fiscalCode: formData.fiscalCode,
          email: formData.email,
          contractType: formData.contractType,
          contractValue: formData.contractValue,
          quantity: formData.quantity,
          isOdcec: formData.isOdcec,
          isRenewal: formData.isRenewal
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Errore durante l'avvio del pagamento")
      }

      const data = await response.json()
      console.log('Risposta pagamento:', data)

      toast.success('Reindirizzamento al sistema di pagamento...')
      // TODO: gestire il redirect alla pagina di pagamento
    } catch (error) {
      console.error('Errore completo:', error)
      toast.error(error instanceof Error ? error.message : "Errore durante l'avvio del pagamento")
      setIsProcessing(false)
    }
  }
  const getDocumentName = (key: string): string => {
    const fileName = formData.documents[key as keyof typeof formData.documents]
    return getFileName(fileName)
  }

  useEffect(() => {
    const calculateTotal = async () => {
      try {
        let total = 0
        const {
          priceInfo,
          contractValue,
          quantity,
          isOdcec,
          isRenewal
        } = formData

        // Calcolo base
        if (priceInfo.is_percentage && priceInfo.threshold_value && contractValue > 0) {
          // Caso Contratto Premium
          total = priceInfo.base_price
          if (contractValue > priceInfo.threshold_value) {
            const excess = contractValue - priceInfo.threshold_value
            const percentageAmount = (excess * (priceInfo.percentage_value || 0)) / 100
            total += percentageAmount
          }
        } else {
          // Caso standard
          total = priceInfo.base_price * (quantity || 1)
        }

        // Applica sconti quantità per ODCEC se applicabile
        if (isOdcec) {
          const { data: quantityDiscount } = await supabase
            .from('price_ranges')
            .select('*')
            .is('contract_type_id', null)
            .eq('is_odcec', true)
            .lte('min_quantity', quantity || 1)
            .order('min_quantity', { ascending: false })
            .limit(1)

          if (quantityDiscount?.[0]) {
            console.log('Sconto ODCEC trovato:', quantityDiscount[0])
            total = quantityDiscount[0].base_price * (quantity || 1)
          }
        }

        // Applica sconto rinnovo se applicabile
        if (isRenewal) {
          total = total * 0.5 // 50% di sconto
        }

        // Applica IVA
        const totalWithVAT = total * 1.22

        console.log('Calcolo prezzo:', {
          base: total,
          withVAT: totalWithVAT,
          inputs: {
            isPercentage: priceInfo.is_percentage,
            threshold: priceInfo.threshold_value,
            contractValue,
            basePrice: priceInfo.base_price,
            quantity,
            isOdcec,
            isRenewal
          }
        })

        setTotalPrice(totalWithVAT)

      } catch (error) {
        console.error('Errore nel calcolo del prezzo:', error)
        toast.error("Errore nel calcolo del prezzo")
      }
    }

    calculateTotal()
  }, [formData])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserData(user)
    }
    getUser()
  }, [supabase])

  // Calcoliamo il prezzo finale includendo lo sconto convenzione
  const finalTotal = appliedConvention 
    ? totalPrice - (totalPrice * appliedConvention.discount_percentage / 100)
    : totalPrice

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
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
              disabled={!!appliedConvention}
            />
            <Button
              onClick={verifyConvention}
              disabled={isCheckingCode || !!appliedConvention}
            >
              {isCheckingCode ? "Verifica..." : "Applica"}
            </Button>
          </div>
          
          {appliedConvention && (
            <div className="mt-2 p-3 bg-green-50 rounded">
              <p className="text-green-600">
                Sconto del {appliedConvention.discount_percentage}% applicato
              </p>
            </div>
          )}
        </div>

          {/* Box informativo */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Procedura di Pagamento</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>1. Cliccando su "Procedi al Pagamento" verrai reindirizzato alla piattaforma pagoPA</li>
              <li>2. Dopo il pagamento, riceverai una email con la ricevuta telematica</li>
              <li>3. Torna in questa piattaforma nella sezione "Le Mie Pratiche"</li>
              <li>4. Carica la ricevuta telematica per completare la procedura</li>
              <li>5. La pratica verrà inviata alla commissione per la valutazione</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600">Imponibile:</span>
                <span className="font-medium">€{(finalTotal / 1.22).toLocaleString()}</span>
              </div>

              {appliedConvention && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Sconto ({appliedConvention.discount_percentage}%):</span>
                  <span>- €{(totalPrice - finalTotal).toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600">IVA (22%):</span>
                <span className="font-medium">€{(finalTotal - (finalTotal / 1.22)).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-blue-600 font-medium">Totale da pagare:</span>
                <span className="text-xl font-bold text-blue-600">
                  €{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between space-x-4">
        <Button onClick={onBack} variant="outline">
          Indietro
        </Button>
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? "Elaborazione..." : "Procedi al Pagamento"}
        </Button>
      </div>
    </div>
  )
} 