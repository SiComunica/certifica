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
  requires_value: boolean
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

interface Props {
  formData: any
  onSubmit: (data: any) => void
}

export default function Step1EmployeeInfo({ formData, onSubmit }: Props) {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({
    employeeName: formData.employeeName || "",
    fiscalCode: formData.fiscalCode || "",
    contractType: formData.contractType || "",
    contractValue: formData.contractValue || 0,
    isOdcec: formData.isOdcec || false,
    isRenewal: formData.isRenewal || false,
    quantity: formData.quantity || 1,
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    loadContractTypes()
  }, [])

  const loadContractTypes = async () => {
    try {
      // Carica tipi di contratto
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
    } catch (error) {
      console.error('Errore caricamento contratti:', error)
      toast.error("Errore nel caricamento dei tipi di contratto")
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
    
    // Se è un contratto a valore aggiunto, calcola l'1.5%
    const selectedContract = contractTypes.find(c => c.id === parseInt(contractTypeId))
    if (selectedContract?.requires_value && value > 0) {
      const additionalValue = value * 0.015 // 1.5%
      price += additionalValue
    }

    return price * form.quantity
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.employeeName || !form.fiscalCode || !form.contractType) {
      toast.error("Compila tutti i campi obbligatori")
      return
    }

    const selectedContract = contractTypes.find(c => c.id === parseInt(form.contractType))
    const finalPrice = calculatePrice(form.contractType, form.contractValue)

    onSubmit({
      ...form,
      contractTypeName: selectedContract?.name,
      finalPrice
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
            onValueChange={(value) => setForm({ ...form, contractType: value })}
            className="space-y-2"
          >
            {contractTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <RadioGroupItem value={type.id.toString()} id={`contract-${type.id}`} />
                <Label htmlFor={`contract-${type.id}`}>{type.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {contractTypes.find(c => 
          c.id === parseInt(form.contractType) && 
          c.requires_value
        ) && (
          <div>
            <Label htmlFor="contractValue">Valore Contratto</Label>
            <Input
              id="contractValue"
              type="number"
              value={form.contractValue}
              onChange={(e) => setForm({ 
                ...form, 
                contractValue: parseFloat(e.target.value) || 0 
              })}
              placeholder="Inserisci il valore del contratto"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Verrà applicato l'1.5% sul valore inserito
            </p>
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

        <div className="flex items-center space-x-2">
          <Switch
            id="isOdcec"
            checked={form.isOdcec}
            onCheckedChange={handleCheckedChange('isOdcec')}
          />
          <Label htmlFor="isOdcec">Convenzione ODCEC</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isRenewal"
            checked={form.isRenewal}
            onCheckedChange={handleCheckedChange('isRenewal')}
          />
          <Label htmlFor="isRenewal">Rinnovo</Label>
        </div>

        {form.contractType && (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-lg font-semibold">
              Prezzo Calcolato: €{calculatePrice(form.contractType, form.contractValue).toFixed(2)}
            </p>
            {contractTypes.find(c => 
              c.id === parseInt(form.contractType) && 
              c.requires_value
            ) && form.contractValue > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Include 1.5% su €{form.contractValue.toFixed(2)}: €{(form.contractValue * 0.015).toFixed(2)}
              </p>
            )}
          </div>
        )}
      </div>

      <Button type="submit">Avanti</Button>
    </form>
  )
} 