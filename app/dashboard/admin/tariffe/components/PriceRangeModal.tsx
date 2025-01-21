"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PriceRange {
  id: number
  contract_type_id: number
  min_quantity: number
  max_quantity: number | null
  base_price: string
  is_percentage: boolean
  percentage_value: string | null
  threshold_value: string | null
  max_price: string | null
  is_odcec: boolean
  is_renewal: boolean
}

interface ContractType {
  id: number
  name: string
  code: string
}

interface PriceRangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<PriceRange>) => Promise<void>
  editingPrice?: PriceRange | null
  contractTypes: ContractType[]
}

export default function PriceRangeModal({
  isOpen,
  onClose,
  onSave,
  editingPrice,
  contractTypes
}: PriceRangeModalProps) {
  const [formData, setFormData] = useState<Partial<PriceRange>>({
    contract_type_id: undefined,
    min_quantity: undefined,
    max_quantity: null,
    base_price: '',
    is_percentage: false,
    percentage_value: null,
    threshold_value: null,
    max_price: null,
    is_odcec: false,
    is_renewal: false
  })

  useEffect(() => {
    if (editingPrice) {
      setFormData(editingPrice)
    } else {
      setFormData({
        contract_type_id: undefined,
        min_quantity: undefined,
        max_quantity: null,
        base_price: '',
        is_percentage: false,
        percentage_value: null,
        threshold_value: null,
        max_price: null,
        is_odcec: false,
        is_renewal: false
      })
    }
  }, [editingPrice, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingPrice ? 'Modifica Tariffa' : 'Nuova Tariffa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo Contratto</Label>
              <Select
                value={formData.contract_type_id?.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, contract_type_id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
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

            <div className="space-y-2">
              <Label>Prezzo Base</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantità Minima</Label>
              <Input
                type="number"
                value={formData.min_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, min_quantity: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Quantità Massima</Label>
              <Input
                type="number"
                value={formData.max_quantity || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_quantity: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="Lascia vuoto per illimitato"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_odcec"
              checked={formData.is_odcec}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_odcec: checked as boolean }))
              }
            />
            <Label htmlFor="is_odcec">ODCEC</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_renewal"
              checked={formData.is_renewal}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_renewal: checked as boolean }))
              }
            />
            <Label htmlFor="is_renewal">Rinnovo</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit">
              {editingPrice ? 'Salva Modifiche' : 'Aggiungi Tariffa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 