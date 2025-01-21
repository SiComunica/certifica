"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit2, Trash2, Plus } from 'lucide-react'

interface PriceRange {
  id: number
  contract_type_id: number
  min_quantity: number
  max_quantity: number
  base_price: number
  is_percentage: boolean
  percentage_value: number | null
  threshold_value: number | null
  max_price: number | null
  is_odcec: boolean
  is_renewal: boolean
}

interface ContractType {
  id: number
  name: string
}

export function PriceRanges() {
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([])
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRange, setEditingRange] = useState<PriceRange | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carica tipi di contratto
      const { data: types, error: typesError } = await supabase
        .from('contract_types')
        .select('id, name')
        .order('id')
      
      if (typesError) throw typesError
      setContractTypes(types || [])

      // Carica fasce di prezzo
      const { data: ranges, error: rangesError } = await supabase
        .from('price_ranges')
        .select('*')
        .order('contract_type_id')
        .order('min_quantity')
      
      if (rangesError) throw rangesError
      setPriceRanges(ranges || [])
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      contract_type_id: parseInt(formData.get('contract_type_id') as string),
      min_quantity: parseInt(formData.get('min_quantity') as string),
      max_quantity: parseInt(formData.get('max_quantity') as string),
      base_price: parseFloat(formData.get('base_price') as string),
      is_percentage: formData.get('is_percentage') === 'on',
      percentage_value: formData.get('percentage_value') ? parseFloat(formData.get('percentage_value') as string) : null,
      threshold_value: formData.get('threshold_value') ? parseFloat(formData.get('threshold_value') as string) : null,
      max_price: formData.get('max_price') ? parseFloat(formData.get('max_price') as string) : null,
      is_odcec: formData.get('is_odcec') === 'on',
      is_renewal: formData.get('is_renewal') === 'on'
    }

    try {
      if (editingRange) {
        // Aggiorna fascia esistente
        const { error } = await supabase
          .from('price_ranges')
          .update(data)
          .eq('id', editingRange.id)

        if (error) throw error
      } else {
        // Crea nuova fascia
        const { error } = await supabase
          .from('price_ranges')
          .insert(data)

        if (error) throw error
      }

      await loadData()
      setEditingRange(null)
      e.currentTarget.reset()
    } catch (error) {
      console.error('Errore salvataggio:', error)
      alert('Errore durante il salvataggio della fascia di prezzo')
    }
  }

  const deleteRange = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa fascia di prezzo?')) return

    try {
      const { error } = await supabase
        .from('price_ranges')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Errore eliminazione:', error)
      alert('Errore durante l\'eliminazione della fascia di prezzo')
    }
  }

  if (loading) {
    return <div>Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-medium">
          {editingRange ? 'Modifica Fascia di Prezzo' : 'Nuova Fascia di Prezzo'}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contract_type_id">Tipo Contratto</Label>
            <select 
              name="contract_type_id"
              defaultValue={editingRange?.contract_type_id}
              className="w-full border rounded p-2"
              required
            >
              {contractTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="base_price">Prezzo Base</Label>
            <Input
              type="number"
              name="base_price"
              defaultValue={editingRange?.base_price}
              step="0.01"
              required
            />
          </div>

          <div>
            <Label htmlFor="min_quantity">Quantità Minima</Label>
            <Input
              type="number"
              name="min_quantity"
              defaultValue={editingRange?.min_quantity}
              required
            />
          </div>

          <div>
            <Label htmlFor="max_quantity">Quantità Massima</Label>
            <Input
              type="number"
              name="max_quantity"
              defaultValue={editingRange?.max_quantity}
              required
            />
          </div>

          <div className="col-span-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                name="is_percentage"
                defaultChecked={editingRange?.is_percentage}
              />
              <Label htmlFor="is_percentage">Usa Percentuale</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                name="is_odcec"
                defaultChecked={editingRange?.is_odcec}
              />
              <Label htmlFor="is_odcec">ODCEC</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                name="is_renewal"
                defaultChecked={editingRange?.is_renewal}
              />
              <Label htmlFor="is_renewal">Rinnovo</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          {editingRange && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setEditingRange(null)}
            >
              Annulla
            </Button>
          )}
          <Button type="submit">
            {editingRange ? 'Aggiorna' : 'Crea'} Fascia
          </Button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Fasce di Prezzo Esistenti</h3>
        <div className="space-y-2">
          {priceRanges.map(range => (
            <div 
              key={range.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded"
            >
              <div>
                <div className="font-medium">
                  {contractTypes.find(t => t.id === range.contract_type_id)?.name}
                </div>
                <div className="text-sm text-gray-500">
                  {range.min_quantity} - {range.max_quantity} unità | €{range.base_price}
                  {range.is_percentage && ` + ${range.percentage_value}%`}
                </div>
                <div className="text-xs space-x-2">
                  {range.is_odcec && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      ODCEC
                    </span>
                  )}
                  {range.is_renewal && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Rinnovo
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRange(range)}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteRange(range.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 