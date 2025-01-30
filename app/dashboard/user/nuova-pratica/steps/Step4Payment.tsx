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
import { PraticaFormData } from "../types"

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

type Props = {
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

export function Step4Payment({ formData, updateFormData, onSubmit, onBack }: Props) {
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
    console.log("=== INIZIO PROCESSO PAGAMENTO FRONTEND ===")
    
    if (!formData.productId) {
      console.error("ProductId mancante")
      return
    }

    if (!formData.priceInfo?.base) {
      console.error("Prezzo base mancante")
      return
    }

    console.log("Procedendo al pagamento con:", {
      productId: formData.productId,
      price: totalPrice,
      priceInfo: formData.priceInfo
    })

    try {
      setIsProcessing(true)
      
      // Verifica dati obbligatori
      if (!formData.email) {
        console.log('Email mancante nel formData:', formData)
        toast.error("L'email è obbligatoria per il pagamento")
        setIsProcessing(false)
        return
      }

      const paymentData = {
        totalPrice: formData.priceInfo.base,
        productId: formData.productId,
        employeeName: formData.employeeName,
        fiscalCode: formData.fiscalCode,
        email: formData.email,
        contractType: formData.contractType,
        quantity: formData.quantity,
        isOdcec: formData.isOdcec,
        isRenewal: formData.isRenewal
      }
      
      console.log('Dati completi form:', formData)
      console.log('Dati inviati al server:', paymentData)

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      console.log('Risposta ricevuta:', response.status)
      const data = await response.json()
      console.log('Dati risposta:', data)
      
      if (!response.ok) {
        throw new Error(data.message || data.details || "Errore durante l'avvio del pagamento")
      }
      
      if (data.redirectUrl) {
        console.log('Redirect a:', data.redirectUrl)
        window.location.href = data.redirectUrl
      } else {
        console.log('URL redirect mancante nella risposta:', data)
        throw new Error('URL di redirect mancante nella risposta')
      }

    } catch (error) {
      console.error('=== ERRORE PAGAMENTO FRONTEND ===', error)
      toast.error(error instanceof Error ? error.message : "Errore durante l'avvio del pagamento")
      setIsProcessing(false)
    }
  }

  const getDocumentName = (key: string): string => {
    const fileName = formData.documents[key as keyof typeof formData.documents]
    return getFileName(fileName)
  }

  useEffect(() => {
    if (formData.priceInfo) {
      const basePrice = formData.priceInfo.base || 0
      const quantity = formData.priceInfo.inputs.quantity || 1
      const total = basePrice * quantity * 1.22 // Includi IVA
      setTotalPrice(total)
      console.log("Dati prezzo:", {
        basePrice,
        quantity,
        total,
        fullPriceInfo: formData.priceInfo
      })
    }
  }, [formData.priceInfo])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        setUserData(user)
        
        // Aggiorna l'email nel formData se non è già impostata
        if (user?.email && !formData.email) {
          console.log('Impostazione email da utente:', user.email)
          updateFormData({ email: user.email })
        }
      } catch (error) {
        console.error('Errore nel recupero utente:', error)
      }
    }
    getUser()
  }, [supabase, formData.email, updateFormData])

  useEffect(() => {
    console.log("Calcolo prezzo:", formData.priceInfo)
  }, [formData.priceInfo])

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

      <div className="flex gap-4">
        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full"
        >
          Indietro
        </Button>
        
        <Button 
          onClick={handlePayment} 
          disabled={isProcessing || !formData.email}
          className="w-full"
        >
          {isProcessing ? 'Elaborazione...' : 'Procedi al Pagamento'}
        </Button>
      </div>
    </div>
  )
} 