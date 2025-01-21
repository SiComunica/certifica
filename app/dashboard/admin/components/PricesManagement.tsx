"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface PriceRange {
  id: number
  contract_type_id: number | null
  min_quantity: number
  max_quantity: number | null
  base_price: number
  is_percentage: boolean
  percentage_value: number | null
  threshold_value: number | null
  is_odcec: boolean
  is_renewal: boolean
}

interface PricesState {
  standard: PriceRange[]
  special: PriceRange[]
  odcec: PriceRange[]
}

interface ContractType {
  id: number
  name: string
  description: string
}

export default function PricesManagement() {
  const [prices, setPrices] = useState<PricesState>({
    standard: [],
    special: [],
    odcec: []
  })
  const [editingPrice, setEditingPrice] = useState<PriceRange | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const [contractTypes, setContractTypes] = useState<ContractType[]>([])

  const loadPrices = async () => {
    try {
      // Carica prezzi standard
      const { data: standardPrices, error: standardError } = await supabase
        .from('price_ranges')
        .select('*')
        .is('is_odcec', false)
        .is('is_percentage', false)
        .order('contract_type_id')

      if (standardError) throw standardError

      // Carica prezzi speciali (con percentuale)
      const { data: specialPrices, error: specialError } = await supabase
        .from('price_ranges')
        .select('*')
        .eq('is_percentage', true)
        .order('contract_type_id')

      if (specialError) throw specialError

      // Carica prezzi ODCEC
      const { data: odcecPrices, error: odcecError } = await supabase
        .from('price_ranges')
        .select('*')
        .eq('is_odcec', true)
        .order('min_quantity')

      if (odcecError) throw odcecError

      setPrices({
        standard: standardPrices || [],
        special: specialPrices || [],
        odcec: odcecPrices || []
      })
    } catch (error) {
      console.error('Errore caricamento prezzi:', error)
      toast.error("Errore nel caricamento dei prezzi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrices()
  }, [])

  useEffect(() => {
    const loadContractTypes = async () => {
      const { data, error } = await supabase
        .from('contract_types')
        .select('*')
        .order('name')
      
      if (error) {
        toast.error('Errore nel caricamento dei tipi di contratto')
        return
      }
      
      setContractTypes(data || [])
    }
    
    loadContractTypes()
  }, [])

  const getContractName = (contractId: number | null) => {
    const contract = contractTypes.find(c => c.id === contractId)
    return contract ? contract.name : 'Tipo non specificato'
  }

  const handleEdit = (price: PriceRange) => {
    setEditingPrice(price)
  }

  const handleSave = async (price: PriceRange) => {
    try {
      const { error } = await supabase
        .from('price_ranges')
        .upsert({
          id: price.id,
          contract_type_id: price.contract_type_id,
          min_quantity: price.min_quantity,
          max_quantity: price.max_quantity,
          base_price: price.base_price,
          is_percentage: price.is_percentage,
          percentage_value: price.percentage_value,
          threshold_value: price.threshold_value,
          is_odcec: price.is_odcec,
          is_renewal: price.is_renewal
        })

      if (error) throw error

      toast.success("Prezzo aggiornato con successo")
      loadPrices()
      setEditingPrice(null)
    } catch (error) {
      console.error('Errore salvataggio:', error)
      toast.error("Errore nel salvataggio del prezzo")
    }
  }

  if (loading) {
    return <div className="p-4">Caricamento prezzi...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="standard">Prezzi Standard</TabsTrigger>
          <TabsTrigger value="special">Contratti Speciali</TabsTrigger>
          <TabsTrigger value="odcec">Convenzione ODCEC</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prices.standard.map((price) => (
              <Card key={price.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-600">
                      {getContractName(price.contract_type_id)}
                    </h3>
                    <p className="text-sm text-gray-600">ID: {price.id}</p>
                    <p className="text-sm font-medium">Prezzo Base: €{price.base_price}</p>
                    <Button 
                      onClick={() => handleEdit(price)}
                      className="w-full mt-2"
                    >
                      Modifica
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prices.special.map((price) => (
              <Card key={price.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Contratto ID: {price.contract_type_id}</h3>
                    <p className="text-sm text-gray-600">Prezzo Base: €{price.base_price}</p>
                    <p className="text-sm text-gray-600">
                      Percentuale: {price.percentage_value}% oltre €{price.threshold_value}
                    </p>
                    <Button 
                      onClick={() => handleEdit(price)}
                      className="w-full mt-2"
                    >
                      Modifica
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="odcec" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prices.odcec.map((price) => (
              <Card key={price.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">
                      Quantità: {price.min_quantity} - {price.max_quantity || '∞'}
                    </h3>
                    <p className="text-sm text-gray-600">Prezzo: €{price.base_price}</p>
                    <Button 
                      onClick={() => handleEdit(price)}
                      className="w-full mt-2"
                    >
                      Modifica
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {editingPrice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold">Modifica Prezzo</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Prezzo Base</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={editingPrice.base_price}
                  onChange={(e) => setEditingPrice({
                    ...editingPrice,
                    base_price: parseFloat(e.target.value)
                  })}
                />
              </div>

              {editingPrice.is_percentage && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="percentageValue">Percentuale</Label>
                    <Input
                      id="percentageValue"
                      type="number"
                      value={editingPrice.percentage_value || ''}
                      onChange={(e) => setEditingPrice({
                        ...editingPrice,
                        percentage_value: e.target.value ? parseFloat(e.target.value) : null
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thresholdValue">Soglia</Label>
                    <Input
                      id="thresholdValue"
                      type="number"
                      value={editingPrice.threshold_value || ''}
                      onChange={(e) => setEditingPrice({
                        ...editingPrice,
                        threshold_value: e.target.value ? parseFloat(e.target.value) : null
                      })}
                    />
                  </div>
                </>
              )}

              {editingPrice.is_odcec && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Quantità Minima</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      value={editingPrice.min_quantity}
                      onChange={(e) => setEditingPrice({
                        ...editingPrice,
                        min_quantity: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxQuantity">Quantità Massima</Label>
                    <Input
                      id="maxQuantity"
                      type="number"
                      value={editingPrice.max_quantity || ''}
                      onChange={(e) => setEditingPrice({
                        ...editingPrice,
                        max_quantity: e.target.value ? parseInt(e.target.value) : null
                      })}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingPrice(null)}
                >
                  Annulla
                </Button>
                <Button 
                  onClick={() => handleSave(editingPrice)}
                >
                  Salva
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 