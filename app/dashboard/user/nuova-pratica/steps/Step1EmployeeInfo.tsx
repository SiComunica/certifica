"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface PriceRange {
  id: number
  contract_type_id: number
  base_price: number
  is_percentage: boolean
  percentage_value: number | null
  threshold_value: number | null
  min_quantity: number
  is_odcec: boolean
  is_renewal: boolean
}

interface ContractType {
  id: number
  name: string
  code: string
  description: string
}

interface EmployeeData {
  employeeName: string
  fiscalCode: string
  contractType: string
  contractValue: number
  isOdcec: boolean
  isRenewal: boolean
  quantity: number
  odcecNumber?: string
  odcecProvince?: string
  odcecDocument?: File
}

interface Props {
  formData: Partial<EmployeeData>
  onSubmit: (data: EmployeeData & { contractTypeName?: string, priceInfo?: PriceRange }) => void
}

export default function Step1EmployeeInfo({ formData, onSubmit }: Props) {
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    employeeName: formData.employeeName || "",
    fiscalCode: formData.fiscalCode || "",
    contractType: formData.contractType || "",
    contractValue: formData.contractValue || 0,
    isOdcec: formData.isOdcec || false,
    isRenewal: formData.isRenewal || false,
    quantity: formData.quantity || 1
  })
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [priceInfo, setPriceInfo] = useState<PriceRange | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadContractTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('contract_types')
          .select('*')
          .order('name')

        if (error) throw error
        setContractTypes(data || [])
      } catch (error) {
        console.error('Errore caricamento contratti:', error)
        toast.error("Errore nel caricamento dei tipi di contratto")
      }
    }

    loadContractTypes()
  }, [])

  useEffect(() => {
    const fetchPrice = async () => {
      if (!employeeData.contractType) return

      try {
        setIsLoading(true)
        const { data: priceRange, error } = await supabase
          .from('price_ranges')
          .select('*')
          .eq('contract_type_id', employeeData.contractType)
          .eq('min_quantity', 1)
          .single()

        if (error) throw error
        setPriceInfo(priceRange)
      } catch (error) {
        console.error('Errore:', error)
        toast.error("Errore nel caricamento del prezzo")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrice()
  }, [employeeData.contractType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employeeData.employeeName || !employeeData.fiscalCode || !employeeData.contractType) {
      toast.error("Compila tutti i campi obbligatori")
      return
    }

    const selectedContract = contractTypes.find(ct => ct.id.toString() === employeeData.contractType)
    
    onSubmit({
      ...employeeData,
      contractTypeName: selectedContract?.name,
      priceInfo
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="employeeName">Nome e Cognome Dipendente *</Label>
          <Input
            id="employeeName"
            value={employeeData.employeeName}
            onChange={(e) => setEmployeeData(prev => ({ ...prev, employeeName: e.target.value }))}
            placeholder="Inserisci nome e cognome"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fiscalCode">Codice Fiscale *</Label>
          <Input
            id="fiscalCode"
            value={employeeData.fiscalCode}
            onChange={(e) => setEmployeeData(prev => ({ ...prev, fiscalCode: e.target.value }))}
            placeholder="Inserisci il codice fiscale"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contractType">Tipo Contratto *</Label>
          <Select 
            value={employeeData.contractType}
            onValueChange={(value) => setEmployeeData(prev => ({ ...prev, contractType: value }))}
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

        {priceInfo?.is_percentage && (
          <div className="grid gap-2">
            <Label htmlFor="contractValue">Valore del Contratto *</Label>
            <Input
              id="contractValue"
              type="number"
              min="0"
              step="1000"
              value={employeeData.contractValue || 0}
              onChange={(e) => setEmployeeData(prev => ({ 
                ...prev, 
                contractValue: parseFloat(e.target.value) || 0
              }))}
              placeholder="Inserisci il valore del contratto"
              required
            />
            {employeeData.contractValue > (priceInfo.threshold_value || 0) && (
              <div className="mt-2 p-4 bg-gray-50 rounded-md space-y-2">
                <p className="text-sm">
                  Valore eccedente: €{(employeeData.contractValue - (priceInfo.threshold_value || 0)).toLocaleString()}
                </p>
                <p className="text-sm">
                  Maggiorazione {priceInfo.percentage_value}%: €{((employeeData.contractValue - (priceInfo.threshold_value || 0)) * (priceInfo.percentage_value || 0) / 100).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOdcec"
              checked={employeeData.isOdcec}
              onCheckedChange={(checked) => 
                setEmployeeData(prev => ({ ...prev, isOdcec: checked as boolean }))
              }
            />
            <Label htmlFor="isOdcec">Convenzione ODCEC</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRenewal"
              checked={employeeData.isRenewal}
              onCheckedChange={(checked) => 
                setEmployeeData(prev => ({ ...prev, isRenewal: checked as boolean }))
              }
            />
            <Label htmlFor="isRenewal">Rinnovo Certificazione</Label>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Caricamento..." : "Avanti"}
      </Button>
    </form>
  )
} 