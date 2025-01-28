"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContractType {
  id: number
  name: string
  code: string
  description: string
  is_premium?: boolean  // Per identificare contratti premium
  threshold_value: number  // Aggiunto campo per la soglia (es. 20000)
}

interface PriceRange {
  id: number
  contract_type_id: number
  base_price: number
  min_quantity: number
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

interface PriceInfo extends PriceRange {
  finalPrice: number
}

interface Props {
  formData: {
    employeeName?: string
    fiscalCode?: string
    contractType?: string
    contractValue?: number
    isOdcec?: boolean
    isRenewal?: boolean
    quantity?: number
  }
  onSubmit: (data: any) => void
}

export default function Step1EmployeeInfo({ formData, onSubmit }: Props) {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([])
  const [conventions, setConventions] = useState<Convention[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [employeeData, setEmployeeData] = useState({
    employeeName: formData.employeeName || "",
    fiscalCode: formData.fiscalCode || "",
    contractType: formData.contractType || "",
    contractValue: formData.contractValue || 0,
    isOdcec: formData.isOdcec || false,
    isRenewal: formData.isRenewal || false,
    quantity: formData.quantity || 1
  })
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null)

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

  const calculatePremiumPrice = (basePrice: number, contractValue: number) => {
    if (contractValue <= 20000) return basePrice
    
    const excessValue = contractValue - 20000
    const additionalFee = excessValue * 0.015 // 1.5% sul valore eccedente
    return basePrice + additionalFee
  }

  useEffect(() => {
    const fetchPrice = async () => {
      if (!employeeData.contractType) return

      try {
        const { data: priceRange, error } = await supabase
          .from('price_ranges')
          .select('*')
          .eq('contract_type_id', employeeData.contractType)
          .eq('is_odcec', employeeData.isOdcec)
          .eq('is_renewal', employeeData.isRenewal)
          .single()

        if (error) throw error

        const selectedContract = contractTypes.find(
          ct => ct.id.toString() === employeeData.contractType
        )

        let finalPrice = priceRange.base_price
        if (selectedContract?.is_premium && employeeData.contractValue > 0) {
          finalPrice = calculatePremiumPrice(
            priceRange.base_price,
            employeeData.contractValue
          )
        }

        setPriceInfo({ ...priceRange, finalPrice })
      } catch (error) {
        console.error('Errore:', error)
      }
    }

    fetchPrice()
  }, [employeeData.contractType, employeeData.contractValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employeeData.employeeName || !employeeData.fiscalCode || !employeeData.contractType) {
      toast.error("Compila tutti i campi obbligatori")
      return
    }

    const selectedContract = contractTypes.find(c => c.id === parseInt(employeeData.contractType))
    if (selectedContract && selectedContract.threshold_value > 0 && employeeData.contractValue <= selectedContract.threshold_value) {
      toast.error("Il valore del contratto deve essere superiore alla soglia")
      return
    }

    const selectedConvention = conventions.find(c => c.code === employeeData.contractType)

    onSubmit({
      ...employeeData,
      contractTypeName: selectedContract?.name,
      finalPrice: priceInfo?.finalPrice || 0,
      conventionDiscount: selectedConvention?.discount_percentage || 0
    })
  }

  const handleValueChange = (value: string) => {
    setEmployeeData({ ...employeeData, contractType: value })
  }

  const handleCheckedChange = (field: string) => (checked: boolean) => {
    setEmployeeData({ ...employeeData, [field]: checked })
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
            value={employeeData.employeeName}
            onChange={(e) => setEmployeeData({ ...employeeData, employeeName: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="fiscalCode">Codice Fiscale</Label>
          <Input
            id="fiscalCode"
            value={employeeData.fiscalCode}
            onChange={(e) => setEmployeeData({ ...employeeData, fiscalCode: e.target.value })}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contractType">Tipo Contratto *</Label>
          <Select 
            value={employeeData.contractType}
            onValueChange={(value) => {
              const selectedContract = contractTypes.find(ct => ct.id.toString() === value)
              setEmployeeData(prev => ({ 
                ...prev, 
                contractType: value,
                contractValue: 0 // Reset valore quando cambia contratto
              }))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona tipo contratto" />
            </SelectTrigger>
            <SelectContent>
              {contractTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {employeeData.contractType && contractTypes.find(
          ct => ct.id.toString() === employeeData.contractType && ct.is_premium
        ) && (
          <div className="grid gap-2">
            <Label htmlFor="contractValue">Valore del Contratto *</Label>
            <Input
              id="contractValue"
              type="number"
              min="20000"
              step="1000"
              value={employeeData.contractValue || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                setEmployeeData(prev => ({ 
                  ...prev, 
                  contractValue: value 
                }))
              }}
              placeholder="Inserisci il valore del contratto (min. €20.000)"
              required
            />
            {employeeData.contractValue > 20000 && (
              <div className="text-sm text-gray-600">
                <p>Valore eccedente €20.000: €{(employeeData.contractValue - 20000).toLocaleString()}</p>
                <p>Maggiorazione 1,5%: €{((employeeData.contractValue - 20000) * 0.015).toLocaleString()}</p>
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
            value={employeeData.quantity}
            onChange={(e) => setEmployeeData({ ...employeeData, quantity: parseInt(e.target.value) })}
            required
          />
        </div>

        {conventions.length > 0 && (
          <div>
            <Label htmlFor="convention">Convenzione</Label>
            <select
              id="convention"
              value={employeeData.contractType}
              onChange={(e) => setEmployeeData({ ...employeeData, contractType: e.target.value })}
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
            checked={employeeData.isRenewal}
            onCheckedChange={handleCheckedChange('isRenewal')}
          />
          <Label htmlFor="isRenewal">Rinnovo</Label>
        </div>

        {employeeData.contractType && (
          <div className="p-4 bg-gray-50 rounded-md space-y-2">
            <p className="text-lg font-semibold">
              Prezzo Calcolato: €{priceInfo?.finalPrice.toFixed(2) || ''}
            </p>
          </div>
        )}
      </div>

      <Button type="submit">Avanti</Button>
    </form>
  )
} 