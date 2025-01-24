"use client"

import React, { useState, useEffect } from "react"
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

const PROVINCE_ITALIANE = [
  { value: "AG", label: "Agrigento" },
  { value: "AL", label: "Alessandria" },
  { value: "AN", label: "Ancona" },
  { value: "AO", label: "Aosta" },
  { value: "AR", label: "Arezzo" },
  { value: "AP", label: "Ascoli Piceno" },
  { value: "AT", label: "Asti" },
  { value: "AV", label: "Avellino" },
  { value: "BA", label: "Bari" },
  { value: "BT", label: "Barletta-Andria-Trani" },
  { value: "BL", label: "Belluno" },
  { value: "BN", label: "Benevento" },
  { value: "BG", label: "Bergamo" },
  { value: "BI", label: "Biella" },
  { value: "BO", label: "Bologna" },
  { value: "BZ", label: "Bolzano" },
  { value: "BS", label: "Brescia" },
  { value: "BR", label: "Brindisi" },
  { value: "CA", label: "Cagliari" },
  { value: "CL", label: "Caltanissetta" },
  { value: "CB", label: "Campobasso" },
  { value: "CE", label: "Caserta" },
  { value: "CT", label: "Catania" },
  { value: "CZ", label: "Catanzaro" },
  { value: "CH", label: "Chieti" },
  { value: "CO", label: "Como" },
  { value: "CS", label: "Cosenza" },
  { value: "CR", label: "Cremona" },
  { value: "KR", label: "Crotone" },
  { value: "CN", label: "Cuneo" },
  { value: "EN", label: "Enna" },
  { value: "FM", label: "Fermo" },
  { value: "FE", label: "Ferrara" },
  { value: "FI", label: "Firenze" },
  { value: "FG", label: "Foggia" },
  { value: "FC", label: "Forlì-Cesena" },
  { value: "FR", label: "Frosinone" },
  { value: "GE", label: "Genova" },
  { value: "GO", label: "Gorizia" },
  { value: "GR", label: "Grosseto" },
  { value: "IM", label: "Imperia" },
  { value: "IS", label: "Isernia" },
  { value: "SP", label: "La Spezia" },
  { value: "AQ", label: "L'Aquila" },
  { value: "LT", label: "Latina" },
  { value: "LE", label: "Lecce" },
  { value: "LC", label: "Lecco" },
  { value: "LI", label: "Livorno" },
  { value: "LO", label: "Lodi" },
  { value: "LU", label: "Lucca" },
  { value: "MC", label: "Macerata" },
  { value: "MN", label: "Mantova" },
  { value: "MS", label: "Massa-Carrara" },
  { value: "MT", label: "Matera" },
  { value: "ME", label: "Messina" },
  { value: "MI", label: "Milano" },
  { value: "MO", label: "Modena" },
  { value: "MB", label: "Monza e Brianza" },
  { value: "NA", label: "Napoli" },
  { value: "NO", label: "Novara" },
  { value: "NU", label: "Nuoro" },
  { value: "OR", label: "Oristano" },
  { value: "PD", label: "Padova" },
  { value: "PA", label: "Palermo" },
  { value: "PR", label: "Parma" },
  { value: "PV", label: "Pavia" },
  { value: "PG", label: "Perugia" },
  { value: "PU", label: "Pesaro e Urbino" },
  { value: "PE", label: "Pescara" },
  { value: "PC", label: "Piacenza" },
  { value: "PI", label: "Pisa" },
  { value: "PT", label: "Pistoia" },
  { value: "PN", label: "Pordenone" },
  { value: "PZ", label: "Potenza" },
  { value: "PO", label: "Prato" },
  { value: "RG", label: "Ragusa" },
  { value: "RA", label: "Ravenna" },
  { value: "RC", label: "Reggio Calabria" },
  { value: "RE", label: "Reggio Emilia" },
  { value: "RI", label: "Rieti" },
  { value: "RN", label: "Rimini" },
  { value: "RM", label: "Roma" },
  { value: "RO", label: "Rovigo" },
  { value: "SA", label: "Salerno" },
  { value: "SS", label: "Sassari" },
  { value: "SV", label: "Savona" },
  { value: "SI", label: "Siena" },
  { value: "SR", label: "Siracusa" },
  { value: "SO", label: "Sondrio" },
  { value: "SU", label: "Sud Sardegna" },
  { value: "TA", label: "Taranto" },
  { value: "TE", label: "Teramo" },
  { value: "TR", label: "Terni" },
  { value: "TO", label: "Torino" },
  { value: "TP", label: "Trapani" },
  { value: "TN", label: "Trento" },
  { value: "TV", label: "Treviso" },
  { value: "TS", label: "Trieste" },
  { value: "UD", label: "Udine" },
  { value: "VA", label: "Varese" },
  { value: "VE", label: "Venezia" },
  { value: "VB", label: "Verbano-Cusio-Ossola" },
  { value: "VC", label: "Vercelli" },
  { value: "VR", label: "Verona" },
  { value: "VV", label: "Vibo Valentia" },
  { value: "VI", label: "Vicenza" },
  { value: "VT", label: "Viterbo" }
]

export default function Step1EmployeeInfo({ formData, onSubmit }: Props) {
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    employeeName: formData?.employeeName || "",
    fiscalCode: formData?.fiscalCode || "",
    contractType: formData?.contractType || "",
    isOdcec: formData?.isOdcec || false,
    isRenewal: formData?.isRenewal || false,
    quantity: formData?.quantity || 1,
    odcecNumber: formData?.odcecNumber || "",
    odcecProvince: formData?.odcecProvince || "",
  })
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [priceInfo, setPriceInfo] = useState<any>(null)
  const supabase = createClientComponentClient()

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
    console.log("Form submitted:", employeeData) // Per debug
    
    if (!employeeData.employeeName || !employeeData.fiscalCode) {
      toast.error("Compila tutti i campi obbligatori")
      return
    }

    if (employeeData.isOdcec) {
      if (!employeeData.odcecNumber || !employeeData.odcecProvince) {
        toast.error("Compila tutti i campi ODCEC")
        return
      }
    }

    if (priceInfo?.is_percentage && (!employeeData.contractValue || employeeData.contractValue <= 0)) {
      toast.error("Inserisci un valore contratto valido")
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

        {employeeData.isOdcec && (
          <div className="space-y-4 border p-4 rounded-lg">
            <div className="grid gap-2">
              <Label htmlFor="odcecNumber">Numero Iscrizione Albo *</Label>
              <Input
                id="odcecNumber"
                value={employeeData.odcecNumber}
                onChange={(e) => setEmployeeData(prev => ({ 
                  ...prev, 
                  odcecNumber: e.target.value 
                }))}
                required={employeeData.isOdcec}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="odcecProvince">Provincia Ordine *</Label>
              <Input
                id="odcecProvince"
                value={employeeData.odcecProvince}
                onChange={(e) => setEmployeeData(prev => ({ 
                  ...prev, 
                  odcecProvince: e.target.value 
                }))}
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

        <div className="grid gap-2">
          <Label htmlFor="quantity">Numero di Pratiche</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={employeeData.quantity}
            onChange={(e) => setEmployeeData(prev => ({ 
              ...prev, 
              quantity: parseInt(e.target.value) || 1
            }))}
            placeholder="Inserisci il numero di pratiche"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button type="submit">
          Avanti
        </Button>
      </div>
    </form>
  )
} 