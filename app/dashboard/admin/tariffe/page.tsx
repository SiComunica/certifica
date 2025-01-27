"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import PriceRangeModal from "./components/PriceRangeModal"
import { toast } from "sonner"

export default function TariffePage() {
  const [priceRanges, setPriceRanges] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadPriceRanges()
  }, [])

  const loadPriceRanges = async () => {
    try {
      const { data, error } = await supabase
        .from('price_ranges')
        .select(`
          *,
          contract_types (
            name,
            code
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPriceRanges(data || [])
    } catch (error) {
      toast.error("Errore nel caricamento delle tariffe")
    }
  }

  const handleEdit = (range: any) => {
    setSelectedRange(range)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('price_ranges')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success("Tariffa eliminata con successo")
      loadPriceRanges()
    } catch (error) {
      toast.error("Errore durante l'eliminazione")
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Tariffe</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Aggiungi Tariffa
        </Button>
      </div>

      <div className="grid gap-4">
        {priceRanges.map((range) => (
          <div key={range.id} className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {range.contract_types?.name || 'Tariffa Standard'}
                </h3>
                <p className="text-sm text-gray-500">
                  Base: €{range.base_price}
                  {range.is_percentage && range.threshold_value && (
                    <> + {range.percentage_value}% oltre €{range.threshold_value}</>
                  )}
                </p>
                {range.is_odcec && (
                  <span className="text-sm text-blue-600">Convenzione ODCEC</span>
                )}
                {range.is_renewal && (
                  <span className="text-sm text-green-600 ml-2">Rinnovo</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(range)}
                >
                  Modifica
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(range.id)}
                >
                  Elimina
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PriceRangeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRange(null)
        }}
        onSave={loadPriceRanges}
        priceRange={selectedRange}
      />
    </div>
  )
} 