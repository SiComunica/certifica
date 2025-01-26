"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface Props {
  formData: any
  setFormData: (data: any) => void
}

interface PriceRange {
  base_price: number
  is_percentage: boolean
  percentage_value: number | null
  threshold_value: number | null
  is_odcec: boolean
  is_renewal: boolean
}

interface Convention {
  code: string
  discount: number
}

export default function Step4Payment({ formData, setFormData }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [conventionCode, setConventionCode] = useState("")
  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [appliedConvention, setAppliedConvention] = useState<Convention | null>(null)

  useEffect(() => {
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
          contractValue 
        })
        
        setTotalPrice(totalWithVAT)

      } catch (error) {
        console.error('Errore nel calcolo del prezzo:', error)
        toast.error("Errore nel calcolo del prezzo")
      }
    }

    calculateTotal()
  }, [formData])

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      console.log('Inizio pagamento per pratica:', formData.practiceId)

      // Ottieni l'utente corrente
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Utente non autenticato")

      // Debug log per verificare i dati della pratica
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('*')
        .eq('id', formData.practiceId)
        .single()

      console.log('Dati pratica trovati:', practice)
      console.log('Errore ricerca pratica:', practiceError)

      if (practiceError || !practice) {
        console.error('Errore recupero pratica:', practiceError)
        throw new Error('Pratica non trovata')
      }

      // Prepara i dati per EasyCommerce
      const paymentData = {
        Name: formData.employeeName?.split(' ')[0] || '',
        Surname: formData.employeeName?.split(' ').slice(1).join(' ') || '',
        CF: practice.fiscal_code || practice.employee_fiscal_code,
        Email: user.email || '',
        Amount: Math.round(finalTotal * 100),
        ContractType: formData.contractTypeName,
        PracticeId: formData.practiceId
      }

      console.log('Dati pagamento:', paymentData)

      // Invia la richiesta al nostro endpoint
      const response = await fetch('/api/payment/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore durante l\'avvio del pagamento')
      }

      const { redirectUrl } = await response.json()

      // Aggiorna lo stato della pratica
      const { error: updateError } = await supabase
        .from('practices')
        .update({
          status: 'payment_pending',
          payment_started_at: new Date().toISOString(),
          payment_amount: finalTotal,
          convention_code: appliedConvention?.code || null,
          convention_discount: appliedConvention?.discount || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.practiceId)

      if (updateError) throw updateError

      // Redirect alla pagina di pagamento di EasyCommerce
      window.location.href = redirectUrl

    } catch (error: any) {
      console.error('Errore:', error)
      toast.error(error.message || "Errore durante l'avvio del pagamento")
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    try {
      const { error } = await supabase
        .from('practices')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.practiceId)

      if (error) throw error

      toast.success("Pratica annullata")
      router.push('/dashboard/user')

    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore durante l'annullamento della pratica")
    }
  }

  const checkConventionCode = async () => {
    if (!conventionCode.trim()) {
      toast.error("Inserisci un codice convenzione")
      return
    }

    setIsCheckingCode(true)
    try {
      const { data: convention, error } = await supabase
        .from('conventions')
        .select('code, discount_percentage')
        .eq('code', conventionCode)
        .eq('is_active', true)
        .single()

      if (error || !convention) {
        toast.error("Codice convenzione non valido")
        return
      }

      setAppliedConvention({
        code: convention.code,
        discount: convention.discount_percentage
      })
      toast.success(`Sconto del ${convention.discount_percentage}% applicato!`)

    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore nella verifica del codice")
    } finally {
      setIsCheckingCode(false)
    }
  }

  const removeConvention = () => {
    setAppliedConvention(null)
    setConventionCode("")
    toast.success("Convenzione rimossa")
  }

  const finalTotal = appliedConvention 
    ? totalPrice - (totalPrice * appliedConvention.discount / 100)
    : totalPrice

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Riepilogo Pratica</h3>
            
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
                  <button 
                    onClick={checkConventionCode}
                    disabled={isCheckingCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isCheckingCode ? "Verifica..." : "Applica"}
                  </button>
                ) : (
                  <button 
                    onClick={removeConvention}
                    className="px-4 py-2 text-red-500 hover:text-red-600 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rimuovi
                  </button>
                )}
              </div>

              {appliedConvention && (
                <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-green-700">
                    Sconto del {appliedConvention.discount}% applicato
                  </p>
                  <p className="text-sm text-green-600">
                    Risparmio: €{(totalPrice - finalTotal).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Dipendente:</span>
                <span className="font-medium">{formData.employeeName}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Tipo Contratto:</span>
                <span className="font-medium">{formData.contractTypeName}</span>
              </div>

              {formData.contractValue > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Valore Contratto:</span>
                  <span className="font-medium">€{formData.contractValue.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Numero Pratiche:</span>
                <span className="font-medium">{formData.quantity || 1}</span>
              </div>

              {formData.isOdcec && (
                <div className="flex justify-between py-2 border-b text-blue-600">
                  <span>Convenzione ODCEC</span>
                  <span>✓</span>
                </div>
              )}

              {formData.isRenewal && (
                <div className="flex justify-between py-2 border-b text-green-600">
                  <span>Rinnovo Certificazione (50% sconto)</span>
                  <span>✓</span>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600">Imponibile:</span>
                    <span className="font-medium">€{(finalTotal / 1.22).toFixed(2)}</span>
                  </div>

                  {appliedConvention && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Sconto ({appliedConvention.discount}%):</span>
                      <span>- €{(totalPrice - finalTotal).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600">IVA (22%):</span>
                    <span className="font-medium">€{(finalTotal - (finalTotal / 1.22)).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-blue-600 font-medium">Totale da pagare:</span>
                    <span className="text-xl font-bold text-blue-600">
                      €{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between space-x-4">
        <Button
          onClick={handleCancel}
          variant="destructive"
          type="button"
        >
          Annulla
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