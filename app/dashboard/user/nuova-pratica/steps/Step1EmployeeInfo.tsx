"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface ContractType {
  id: number
  name: string
  code: string
  description: string
  base_price: number
}

interface PriceInfo {
  base_price: number
  is_percentage: boolean
  percentage_value: number | null
  threshold_value: number | null
}

interface EmployeeData {
  employeeName: string
  fiscalCode: string
  contractType: string
  contractValue?: number
  isOdcec: boolean
  isRenewal: boolean
  quantity: number
  odcecNumber?: string
  odcecProvince?: string
  odcecDocument?: File
}

interface Props {
  formData: any
  onSubmit: (data: EmployeeData) => void
}

export default function Step1EmployeeInfo({ formData, onSubmit }: Props) {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    employeeName: formData.employeeName || "",
    fiscalCode: formData.fiscalCode || "",
    contractType: formData.contractType || "",
    contractValue: formData.contractValue || 0,
    isOdcec: formData.isOdcec || false,
    isRenewal: formData.isRenewal || false,
    quantity: formData.quantity || 1,
    odcecNumber: formData.odcecNumber || "",
    odcecProvince: formData.odcecProvince || ""
  })
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadContractTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('contract_types')
          .select(`
            id,
            name,
            code,
            description,
            price_ranges (base_price)
          `)
          .order('name')

        if (error) throw error

        const formattedData = data.map(type => ({
          id: type.id,
          name: type.name,
          code: type.code,
          description: type.description,
          base_price: type.price_ranges[0]?.base_price || 0
        }))

        setContractTypes(formattedData)
      } catch (error) {
        console.error('Errore caricamento tipi contratto:', error)
        toast.error("Errore nel caricamento dei tipi di contratto")
      }
    }

    loadContractTypes()
  }, [])

  useEffect(() => {
    const loadPriceInfo = async () => {
      if (!employeeData.contractType) return

      try {
        const { data, error } = await supabase
          .from('price_ranges')
          .select('*')
          .eq('contract_type_id', employeeData.contractType)
          .eq('is_odcec', employeeData.isOdcec)
          .eq('is_renewal', employeeData.isRenewal)
          .single()

        if (error) throw error
        setPriceInfo(data)
      } catch (error) {
        console.error('Errore caricamento prezzo:', error)
        setPriceInfo(null)
      }
    }

    loadPriceInfo()
  }, [employeeData.contractType, employeeData.isOdcec, employeeData.isRenewal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employeeData.employeeName || !employeeData.fiscalCode || !employeeData.contractType) {
      toast.error("Compila tutti i campi obbligatori")
      return
    }

    if (employeeData.isOdcec && (!employeeData.odcecNumber || !employeeData.odcecProvince)) {
      toast.error("Inserisci i dati ODCEC")
      return
    }

    onSubmit(employeeData)
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
            placeholder="Mario Rossi"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fiscalCode">Codice Fiscale *</Label>
          <Input
            id="fiscalCode"
            value={employeeData.fiscalCode}
            onChange={(e) => setEmployeeData(prev => ({ ...prev, fiscalCode: e.target.value }))}
            placeholder="RSSMRA80A01H501U"
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

        {employeeData.contractType && (
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantità</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={employeeData.quantity}
              onChange={(e) => setEmployeeData(prev => ({ 
                ...prev, 
                quantity: parseInt(e.target.value) || 1 
              }))}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isOdcec"
            checked={employeeData.isOdcec}
            onCheckedChange={(checked) => 
              setEmployeeData(prev => ({ ...prev, isOdcec: checked as boolean }))
            }
          />
          <label
            htmlFor="isOdcec"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Convenzione ODCEC
          </label>
        </div>

        {employeeData.isOdcec && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="odcecNumber">Numero Iscrizione ODCEC</Label>
              <Input
                id="odcecNumber"
                value={employeeData.odcecNumber}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, odcecNumber: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="odcecProvince">Provincia ODCEC</Label>
              <Input
                id="odcecProvince"
                value={employeeData.odcecProvince}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, odcecProvince: e.target.value }))}
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRenewal"
            checked={employeeData.isRenewal}
            onCheckedChange={(checked) => 
              setEmployeeData(prev => ({ ...prev, isRenewal: checked as boolean }))
            }
          />
          <label
            htmlFor="isRenewal"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Rinnovo
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Avanti
        </button>
      </div>
    </form>
  )
} 