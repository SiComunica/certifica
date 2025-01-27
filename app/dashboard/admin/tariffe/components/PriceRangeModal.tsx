"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface PriceRange {
  id?: number
  contract_type_id: number
  base_price: number
  is_percentage: boolean
  percentage_value: number | null
  threshold_value: number | null
  is_odcec: boolean
  is_renewal: boolean
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  priceRange: PriceRange | null
}

export default function PriceRangeModal({ isOpen, onClose, onSave, priceRange }: Props) {
  const [contractTypes, setContractTypes] = useState<any[]>([])
  const [formData, setFormData] = useState<PriceRange>({
    contract_type_id: 0,
    base_price: 0,
    is_percentage: false,
    percentage_value: null,
    threshold_value: null,
    is_odcec: false,
    is_renewal: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadContractTypes()
    if (priceRange) {
      setFormData(priceRange)
    }
  }, [priceRange])

  const loadContractTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_types')
        .select('*')
        .order('name')

      if (error) throw error
      setContractTypes(data || [])
    } catch (error) {
      toast.error("Errore nel caricamento dei tipi di contratto")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (priceRange?.id) {
        // Update
        const { error } = await supabase
          .from('price_ranges')
          .update(formData)
          .eq('id', priceRange.id)

        if (error) throw error
        toast.success("Tariffa aggiornata con successo")
      } else {
        // Insert
        const { error } = await supabase
          .from('price_ranges')
          .insert(formData)

        if (error) throw error
        toast.success("Tariffa creata con successo")
      }

      onSave()
      onClose()
    } catch (error) {
      toast.error("Errore durante il salvataggio")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {priceRange ? "Modifica Tariffa" : "Nuova Tariffa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contractType">Tipo Contratto</Label>
              <Select
                value={formData.contract_type_id.toString()}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  contract_type_id: parseInt(value) 
                }))}
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

            <div className="grid gap-2">
              <Label htmlFor="basePrice">Prezzo Base</Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  base_price: parseFloat(e.target.value) 
                }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPercentage"
                checked={formData.is_percentage}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  is_percentage: checked as boolean 
                }))}
              />
              <Label htmlFor="isPercentage">Calcolo Percentuale</Label>
            </div>

            {formData.is_percentage && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="percentageValue">Percentuale</Label>
                  <Input
                    id="percentageValue"
                    type="number"
                    value={formData.percentage_value || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      percentage_value: parseFloat(e.target.value) 
                    }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="thresholdValue">Valore Soglia</Label>
                  <Input
                    id="thresholdValue"
                    type="number"
                    value={formData.threshold_value || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      threshold_value: parseFloat(e.target.value) 
                    }))}
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOdcec"
                checked={formData.is_odcec}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  is_odcec: checked as boolean 
                }))}
              />
              <Label htmlFor="isOdcec">Tariffa ODCEC</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRenewal"
                checked={formData.is_renewal}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  is_renewal: checked as boolean 
                }))}
              />
              <Label htmlFor="isRenewal">Tariffa Rinnovo</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvataggio..." : "Salva"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 