"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit2, Trash2 } from 'lucide-react'

interface DiscountCode {
  id: number
  code: string
  percentage: number
  valid_until: string
  is_active: boolean
  created_at: string
}

export function DiscountCodes() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCodes(data || [])
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
      code: formData.get('code') as string,
      percentage: parseInt(formData.get('percentage') as string),
      valid_until: formData.get('valid_until') as string,
      is_active: formData.get('is_active') === 'on'
    }

    try {
      if (editingCode) {
        // Aggiorna codice esistente
        const { error } = await supabase
          .from('discount_codes')
          .update(data)
          .eq('id', editingCode.id)

        if (error) throw error
      } else {
        // Crea nuovo codice
        const { error } = await supabase
          .from('discount_codes')
          .insert(data)

        if (error) throw error
      }

      await loadData()
      setEditingCode(null)
      e.currentTarget.reset()
    } catch (error) {
      console.error('Errore salvataggio:', error)
      alert('Errore durante il salvataggio del codice sconto')
    }
  }

  const deleteCode = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo codice sconto?')) return

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Errore eliminazione:', error)
      alert('Errore durante l\'eliminazione del codice sconto')
    }
  }

  if (loading) {
    return <div>Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-medium">
          {editingCode ? 'Modifica Codice Sconto' : 'Nuovo Codice Sconto'}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Codice</Label>
            <Input
              name="code"
              defaultValue={editingCode?.code}
              required
            />
          </div>

          <div>
            <Label htmlFor="percentage">Percentuale Sconto</Label>
            <Input
              type="number"
              name="percentage"
              defaultValue={editingCode?.percentage}
              min="0"
              max="100"
              required
            />
          </div>

          <div>
            <Label htmlFor="valid_until">Valido fino al</Label>
            <Input
              type="date"
              name="valid_until"
              defaultValue={editingCode?.valid_until}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              name="is_active"
              defaultChecked={editingCode?.is_active}
            />
            <Label htmlFor="is_active">Attivo</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          {editingCode && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setEditingCode(null)}
            >
              Annulla
            </Button>
          )}
          <Button type="submit">
            {editingCode ? 'Aggiorna' : 'Crea'} Codice
          </Button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Codici Sconto Esistenti</h3>
        <div className="space-y-2">
          {codes.map(code => (
            <div 
              key={code.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded"
            >
              <div>
                <div className="font-medium">{code.code}</div>
                <div className="text-sm text-gray-500">
                  {code.percentage}% di sconto | Valido fino al {new Date(code.valid_until).toLocaleDateString()}
                </div>
                <div className="text-xs">
                  <span className={`px-2 py-1 rounded ${
                    code.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {code.is_active ? 'Attivo' : 'Inattivo'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCode(code)}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteCode(code.id)}
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