"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ContractFormData {
  type: string
  startDate: string
  endDate?: string
  salary: string
  notes?: string
}

interface Step2Props {
  formData: ContractFormData
  onSubmit: (data: ContractFormData) => void
  onBack: () => void
}

export default function Step2ContractInfo({ formData, onSubmit, onBack }: Step2Props) {
  const [contractData, setContractData] = useState<ContractFormData>({
    type: formData.type || "",
    startDate: formData.startDate || "",
    endDate: formData.endDate || "",
    salary: formData.salary || "",
    notes: formData.notes || ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contractData.type || !contractData.startDate || !contractData.salary) {
      toast.error("Compila tutti i campi obbligatori")
      return
    }

    // Validazione data fine se contratto determinato
    if (contractData.type === "determinato" && !contractData.endDate) {
      toast.error("Inserisci la data di fine contratto")
      return
    }

    onSubmit(contractData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="type">Tipo Contratto *</Label>
          <Select 
            value={contractData.type}
            onValueChange={(value) => setContractData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona tipo contratto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indeterminato">Tempo Indeterminato</SelectItem>
              <SelectItem value="determinato">Tempo Determinato</SelectItem>
              <SelectItem value="apprendistato">Apprendistato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="startDate">Data Inizio *</Label>
          <Input
            id="startDate"
            type="date"
            value={contractData.startDate}
            onChange={(e) => setContractData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>

        {contractData.type === "determinato" && (
          <div className="grid gap-2">
            <Label htmlFor="endDate">Data Fine *</Label>
            <Input
              id="endDate"
              type="date"
              value={contractData.endDate}
              onChange={(e) => setContractData(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="salary">Retribuzione Mensile Lorda *</Label>
          <Input
            id="salary"
            type="number"
            value={contractData.salary}
            onChange={(e) => setContractData(prev => ({ ...prev, salary: e.target.value }))}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Note Aggiuntive</Label>
          <Textarea
            id="notes"
            value={contractData.notes}
            onChange={(e) => setContractData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Inserisci eventuali note..."
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Indietro
        </Button>
        <Button type="submit">
          Avanti
        </Button>
      </div>
    </form>
  )
} 