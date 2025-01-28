"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface ContractType {
  id: number
  name: string
  threshold_value: number  // es. 20000 per contratti premium
  is_value_added: boolean  // flag per contratti a valore aggiunto
}

interface PriceRange {
  id: number
  contract_type_id: number
  base_price: number
  is_percentage: boolean
  percentage_value: number
  threshold_value: number
  max_price: number
  is_odcec: boolean
  is_renewal: boolean
}

interface Convention {
  id: string
  code: string
  discount_percentage: number
  description: string
  is_active: boolean
}

interface Props {
  formData: any
  onSubmit: (data: any) => void
}

export default function Step1EmployeeInfo({ formData, onSubmit }: Props) {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([])
  const [conventions, setConventions] = useState<Convention[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({
    employeeName: formData.employeeName || "",
    fiscalCode: formData.fiscalCode || "",
    contractType: formData.contractType || "",
    contractValue: formData.contractValue || 0,
    conventionCode: formData.conventionCode || "",
    isRenewal: formData.isRenewal || false,
    isOdcec: formData.isOdcec || false,
    quantity: formData.quantity || 1,
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Carica tipi contratto
      const { data: types, error: typesError } = await supabase
        .from('contract_types')
        .select('*')
      if (typesError) throw typesError
      setContractTypes(types)

      // Carica prezzi
      const { data: prices, error: pricesError } = await supabase
        .from('price_ranges')
        .select('*')
      if (pricesError) throw pricesError
      setPriceRanges(prices)

      // Carica convenzioni attive
      const { data: activeConventions, error: conventionsError } = await supabase
        .from('conventions')
        .select('*')
        .eq('is_active', true)
      if (conventionsError) throw conventionsError
      setConventions(activeConventions)
    } catch (error) {
      console.error('Errore caricamento dati:', error)
      toast.error("Errore nel caricamento dei dati")
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePrice = (contractTypeId: string, value: number = 0) => {
    const priceRange = priceRanges.find(p => 
      p.contract_type_id === parseInt(contractTypeId) &&
      p.is_odcec === form.isOdcec &&
      p.is_renewal === form.isRenewal
    )

    if (!priceRange) return 0

    let price = priceRange.base_price
    
    // Calcola 1.5% sul valore eccedente la soglia
    const selectedContract = contractTypes.find(c => c.id === parseInt(contractTypeId))
    if (selectedContract?.is_value_added && value > selectedContract.threshold_value) {
      const excessValue = value - selectedContract.threshold_value
      const additionalValue = excessValue * 0.015 // 1.5%
      price += additionalValue
    }

    return price
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.employeeName || !form.fiscalCode || !form.contractType) {
      toast.error("Compila tutti i campi obbligatori")
      return
    }

    const selectedContract = contractTypes.find(c => c.id === parseInt(form.contractType))
    if (selectedContract && selectedContract.threshold_value > 0 && form.contractValue <= selectedContract.threshold_value) {
      toast.error("Il valore del contratto deve essere superiore alla soglia")
      return
    }

    const finalPrice = calculatePrice(form.contractType, form.contractValue)
    const selectedConvention = conventions.find(c => c.code === form.conventionCode)

    onSubmit({
      ...form,
      contractTypeName: selectedContract?.name,
      finalPrice,
      conventionDiscount: selectedConvention?.discount_percentage || 0
    })
  }

  const handleValueChange = (value: string) => {
    setForm({ ...form, contractType: value })
  }

  const handleCheckedChange = (field: string) => (checked: boolean) => {
    setForm({ ...form, [field]: checked })
  }

  if (isLoading) {
    return <div>Caricamento...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="employeeName">Nome e Cognome Dipendente</Label>
          <Input
            id="employeeName"
            value={form.employeeName}
            onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="fiscalCode">Codice Fiscale</Label>
          <Input
            id="fiscalCode"
            value={form.fiscalCode}
            onChange={(e) => setForm({ ...form, fiscalCode: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>Tipo Contratto</Label>
          <RadioGroup
            value={form.contractType}
            onValueChange={(value) => {
              setForm({ 
                ...form, 
                contractType: value,
                contractValue: 0  // Reset valore quando cambia contratto
              })
            }}
            className="space-y-2"
          >
            {contractTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <RadioGroupItem value={type.id.toString()} id={`contract-${type.id}`} />
                <Label htmlFor={`contract-${type.id}`}>
                  {type.name}
                  {type.threshold_value > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Soglia: €{type.threshold_value.toLocaleString()})
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {form.contractType && contractTypes.find(c => 
          c.id === parseInt(form.contractType) && 
          c.is_value_added
        ) && (
          <div className="space-y-2">
            <Label htmlFor="contractValue">Valore del Contratto</Label>
            <Input
              id="contractValue"
              type="number"
              value={form.contractValue || ''}
              onChange={(e) => setForm({ 
                ...form, 
                contractValue: parseFloat(e.target.value) || 0 
              })}
              placeholder="Inserisci il valore del contratto"
              required
            />
            {form.contractValue > 0 && (
              <div className="mt-2 p-4 bg-gray-50 rounded-md space-y-2">
                <p className="text-sm">
                  Valore base: €{contractTypes.find(c => 
                    c.id === parseInt(form.contractType)
                  )?.threshold_value.toLocaleString()}
                </p>
                <p className="text-sm">
                  Valore eccedente: €{(form.contractValue - (contractTypes.find(c => 
                    c.id === parseInt(form.contractType)
                  )?.threshold_value || 0)).toLocaleString()}
                </p>
                <p className="text-sm font-medium">
                  Maggiorazione 1.5%: €{((form.contractValue - (contractTypes.find(c => 
                    c.id === parseInt(form.contractType)
                  )?.threshold_value || 0)) * 0.015).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="quantity">Quantità</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
            required
          />
        </div>

        {conventions.length > 0 && (
          <div>
            <Label htmlFor="convention">Convenzione</Label>
            <select
              id="convention"
              value={form.conventionCode}
              onChange={(e) => setForm({ ...form, conventionCode: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Nessuna convenzione</option>
              {conventions.map((convention) => (
                <option key={convention.id} value={convention.code}>
                  {convention.description} ({convention.discount_percentage}% sconto)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="isRenewal"
            checked={form.isRenewal}
            onCheckedChange={handleCheckedChange('isRenewal')}
          />
          <Label htmlFor="isRenewal">Rinnovo</Label>
        </div>

        {form.contractType && (
          <div className="p-4 bg-gray-50 rounded-md space-y-2">
            <p className="text-lg font-semibold">
              Prezzo Calcolato: €{calculatePrice(form.contractType, form.contractValue).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <Button type="submit">Avanti</Button>
    </form>
  )
} 