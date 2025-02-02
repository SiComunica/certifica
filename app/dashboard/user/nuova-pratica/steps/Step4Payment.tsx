"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { calculatePrice } from "@/lib/utils"
import { PraticaFormData } from "../../types"

// Definiamo l'interfaccia qui direttamente invece di importarla
interface AppliedConvention {
  code: string
  discount_percentage: number
}

interface Convention {
  id: string
  code: string
  discount_percentage: number
  is_active: boolean
  description: string
}

interface ApiError {
  message: string
  code?: string | number
  details?: Record<string, unknown>
  [key: string]: unknown
}

interface Props {
  formData: PraticaFormData
  updateFormData: (data: Partial<PraticaFormData>) => void
  onSubmit: (stepData: Partial<PraticaFormData>) => Promise<void>
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

export default function Step4Payment({ formData, updateFormData, onSubmit, onBack }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [conventionCode, setConventionCode] = useState("")
  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [appliedConvention, setAppliedConvention] = useState<AppliedConvention | null>(null)

  const PAYMENT_PORTAL_URL = 'https://easy-webreport.ccd.uniroma2.it/easyCommerce/test'

  const calculateTotal = async () => {
    if (!formData.contractType) {
      console.log('Nessun tipo contratto nei formData:', formData)
      return
    }

    try {
      console.log('Calcolo prezzo per:', formData)

      const contractTypeId = formData.contractType
      const quantity = formData.quantity || 1
      const isOdcec = formData.isOdcec || false
      const isRenewal = formData.isRenewal || false
      const contractValue = formData.contractValue || 0

      // Ottieni il prezzo base
      const { data: basePrice, error: priceError } = await supabase
        .from('price_ranges')
        .select('*')
        .eq('contract_type_id', contractTypeId)
        .eq('min_quantity', 1)
        .single()

      if (priceError) {
        console.error('Errore prezzo base:', priceError)
        return
      }

      console.log('Prezzo base trovato:', basePrice)

      // Calcola il prezzo
      let total = 0

      if (basePrice.is_percentage && basePrice.threshold_value && contractValue > 0) {
        // Caso Contratto Commerciale Premium
        total = basePrice.base_price
        if (contractValue > basePrice.threshold_value) {
          const excess = contractValue - basePrice.threshold_value
          const percentageAmount = (excess * (basePrice.percentage_value || 0)) / 100
          total += percentageAmount
        }
      } else {
        // Caso standard
        total = basePrice.base_price * quantity

        // Applica sconti quantità per ODCEC se applicabile
        if (isOdcec) {
          const { data: quantityDiscount } = await supabase
            .from('price_ranges')
            .select('*')
            .is('contract_type_id', null)
            .eq('is_odcec', true)
            .lte('min_quantity', quantity)
            .order('min_quantity', { ascending: false })
            .limit(1)

          if (quantityDiscount?.[0]) {
            console.log('Sconto quantità trovato:', quantityDiscount[0])
            total = quantityDiscount[0].base_price * quantity
          }
        }
      }

      // Applica sconto rinnovo se applicabile
      if (isRenewal) {
        total = total * 0.5 // 50% di sconto
      }

      // Applica IVA
      const totalWithVAT = total * 1.22 // 22% IVA

      console.log('Prezzo finale calcolato:', { 
        basePrice: total, 
        totalWithVAT,
        quantity,
        isOdcec,
        isRenewal,
        contractValue,
        appliedConvention 
      })
      
      setTotalPrice(totalWithVAT)

    } catch (error) {
      console.error('Errore nel calcolo del prezzo:', error)
      toast.error("Errore nel calcolo del prezzo")
    }
  }

  const checkConventionCode = async () => {
    try {
      setIsCheckingCode(true)
      
      const { data: convention, error } = await supabase
        .from('conventions')
        .select('*')
        .eq('code', conventionCode)
        .single()

      if (error || !convention) {
        toast.error('Codice convenzione non valido')
        return
      }

      setAppliedConvention({
        code: convention.code,
        discount_percentage: convention.discount_percentage
      })

      toast.success('Codice convenzione applicato')
      
    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nella verifica del codice')
    } finally {
      setIsCheckingCode(false)
    }
  }

  const removeConvention = () => {
    setAppliedConvention(null)
    setConventionCode("")
    calculateTotal()
    updateFormData({
      conventionCode: "",
      conventionDiscount: 0
    })
    toast.success("Convenzione rimossa")
  }

  // Usa calculateTotal nell'effetto
  useEffect(() => {
    calculateTotal()
  }, [formData, appliedConvention])

  const handleBack = () => {
    onBack()
  }

  const handlePayment = async () => {
    try {
      setIsProcessing(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Utente non autenticato")
        return
      }

      // Genera un numero pratica univoco
      const praticaNumber = `P${Date.now()}`
      console.log('Creando pratica:', praticaNumber) // Debug

      // Salva la pratica
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .insert({
          user_id: user.id,
          pratica_number: praticaNumber,
          employee_name: formData.employeeName,
          employee_fiscal_code: formData.fiscalCode,
          contract_type: formData.contractType,
          status: 'pending_payment',
          documents: formData.documents || [],
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (practiceError) {
        console.error('Errore salvataggio pratica:', practiceError)
        toast.error("Errore nel salvataggio della pratica")
        return
      }

      console.log('Pratica salvata:', practice) // Debug

      // Reindirizza a EasyCommerce
      window.location.href = PAYMENT_PORTAL_URL

    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nel processo")
    } finally {
      setIsProcessing(false)
    }
  }

  const getDocumentName = (key: string): string => {
    const fileName = formData.documents[key as keyof typeof formData.documents]
    return getFileName(fileName)
  }

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

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium mb-3">Codice Convenzione</h4>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Inserisci il codice"
              value={conventionCode}
              onChange={(e) => setConventionCode(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              disabled={!!appliedConvention}
            />
            {!appliedConvention ? (
              <Button 
                onClick={checkConventionCode}
                disabled={isCheckingCode}
              >
                {isCheckingCode ? "Verifica..." : "Applica"}
              </Button>
            ) : (
              <Button 
                onClick={removeConvention}
                variant="destructive"
              >
                Rimuovi
              </Button>
            )}
          </div>

          {appliedConvention && (
            <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
              <p className="text-green-700">
                Sconto del {appliedConvention.discount_percentage}% applicato
              </p>
              <p className="text-sm text-green-600">
                Risparmio: €{((totalPrice / (1 - appliedConvention.discount_percentage/100)) - totalPrice).toFixed(2)}
              </p>
            </div>
          )}
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

      <div className="flex justify-between items-center mt-6">
        <div className="space-x-4">
          <Button
            onClick={onBack}
            variant="outline"
            type="button"
          >
            Torna Indietro
          </Button>
          
          <Button
            onClick={() => router.push('/dashboard/user')}
            variant="destructive"
            type="button"
          >
            Annulla
          </Button>
        </div>

        <div className="space-x-4">
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="mr-2">Elaborazione...</span>
              </span>
            ) : (
              "Procedi al Pagamento"
            )}
          </Button>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600">
          <ul className="list-disc ml-5 mt-2">
            <li>Verrai reindirizzato al portale EasyCommerce per il pagamento</li>
            <li>Se non sei registrato su EasyCommerce, dovrai prima creare un account</li>
            <li>Dopo aver effettuato il pagamento, torna qui per caricare la ricevuta</li>
          </ul>
        </p>
      </div>
    </div>
  )
} 