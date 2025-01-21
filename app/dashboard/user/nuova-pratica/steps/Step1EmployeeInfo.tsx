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
  onSubmit: (data: any) => void
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
  const [priceInfo, setPriceInfo] = useState<any>(null)
  const supabase = createClientComponentClient()

  // Carica i tipi di contratto
  useEffect(() => {
    const loadContractTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('contract_types')
          .select('*')
          .order('name')

        if (error) throw error
        console.log('Contratti caricati:', data)
        setContractTypes(data || [])
      } catch (error) {
        console.error('Errore caricamento contratti:', error)
        toast.error("Errore nel caricamento dei tipi di contratto")
      }
    }

    loadContractTypes()
  }, [])

  // Carica il prezzo quando viene selezionato un contratto
  useEffect(() => {
    const fetchPrice = async () => {
      if (!employeeData.contractType) return

      try {
        console.log('Cerco prezzo per:', employeeData.contractType)
        
        const { data: priceRange, error } = await supabase
          .from('price_ranges')
          .select('*')
          .eq('contract_type_id', employeeData.contractType)
          .eq('min_quantity', 1)
          .eq('is_odcec', false)
          .eq('is_renewal', false)
          .single()

        if (error) throw error
        console.log('Prezzo trovato:', priceRange)
        setPriceInfo(priceRange)
      } catch (error) {
        console.error('Errore caricamento prezzo:', error)
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

    // Trova il nome del contratto dal suo ID
    const selectedContract = contractTypes.find(ct => ct.id.toString() === employeeData.contractType)
    
    onSubmit({
      ...employeeData,
      contractTypeName: selectedContract?.name, // Aggiungiamo il nome del contratto
      priceInfo // Includiamo le info sul prezzo
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
                  {type.name} - {type.description}
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
              value={employeeData.contractValue}
              onChange={(e) => setEmployeeData(prev => ({ 
                ...prev, 
                contractValue: parseFloat(e.target.value) 
              }))}
              placeholder="Inserisci il valore del contratto"
              required
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="quantity">Numero di Pratiche</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={employeeData.quantity}
            onChange={(e) => setEmployeeData(prev => ({ 
              ...prev, 
              quantity: parseInt(e.target.value) 
            }))}
            placeholder="Inserisci il numero di pratiche"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOdcec"
              checked={employeeData.isOdcec}
              onCheckedChange={(checked) => 
                setEmployeeData(prev => ({ ...prev, isOdcec: checked as boolean }))
              }
            />
            <Label 
              htmlFor="isOdcec" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Convenzione ODCEC
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRenewal"
              checked={employeeData.isRenewal}
              onCheckedChange={(checked) => 
                setEmployeeData(prev => ({ ...prev, isRenewal: checked as boolean }))
              }
            />
            <Label 
              htmlFor="isRenewal"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Rinnovo Certificazione
            </Label>
          </div>
        </div>

        {employeeData.isOdcec && (
          <div className="space-y-4 border p-4 rounded-lg bg-blue-50">
            <h4 className="font-medium text-blue-600">Verifica ODCEC</h4>
            
            <div className="grid gap-2">
              <Label htmlFor="odcecNumber">Numero Iscrizione Albo *</Label>
              <Input
                id="odcecNumber"
                value={employeeData.odcecNumber || ""}
                onChange={(e) => setEmployeeData(prev => ({ 
                  ...prev, 
                  odcecNumber: e.target.value 
                }))}
                placeholder="Es. 12345"
                required={employeeData.isOdcec}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="odcecProvince">Provincia Ordine *</Label>
              <Select
                value={employeeData.odcecProvince || ""}
                onValueChange={(value) => setEmployeeData(prev => ({ 
                  ...prev, 
                  odcecProvince: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona provincia" />
                </SelectTrigger>
                <SelectContent>
                  {/* Lista province italiane */}
                  <SelectItem value="MI">Milano</SelectItem>
                  <SelectItem value="RM">Roma</SelectItem>
                  {/* ... altre province ... */}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-blue-600">
              <p>Per verificare l'iscrizione:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Carica documento di iscrizione all'Albo</li>
                <li>O tessera professionale</li>
              </ul>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="odcecDocument">Documento ODCEC *</Label>
              <Input
                id="odcecDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Gestione upload file
                    setEmployeeData(prev => ({ 
                      ...prev, 
                      odcecDocument: file 
                    }))
                  }
                }}
                required={employeeData.isOdcec}
              />
            </div>
          </div>
        )}

        {priceInfo && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">
              {priceInfo.is_percentage && priceInfo.threshold_value ? (
                <>
                  <div>Costo base: €{priceInfo.base_price.toFixed(2)}</div>
                  <div className="text-xs mt-1">
                    + {priceInfo.percentage_value}% sul valore eccedente €{priceInfo.threshold_value.toFixed(2)}
                  </div>
                </>
              ) : (
                <>
                  <div>Costo pratica: €{priceInfo.base_price.toFixed(2)}</div>
                  <div className="text-xs mt-1">
                    * Il prezzo finale potrebbe variare in base a:
                    <ul className="list-disc list-inside mt-1">
                      <li>Quantità di pratiche ({employeeData.quantity})</li>
                      {employeeData.isOdcec && <li>Convenzione ODCEC (applicata)</li>}
                      {employeeData.isRenewal && <li>Rinnovo certificazione (applicato)</li>}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        Avanti
      </Button>
    </form>
  )
} 