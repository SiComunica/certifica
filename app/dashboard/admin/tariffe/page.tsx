"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface ContractType {
  id: number
  name: string
  code: string
}

interface PriceRange {
  id: number
  contract_type_id: number
  min_quantity: number
  max_quantity: number | null
  base_price: string
  contract_types?: ContractType
}

export default function TariffePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<PriceRange[]>([])
  const supabase = createClientComponentClient()

  // Monitora tutte le richieste di rete
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('rates')) {
          console.log('Richiesta rates rilevata:', {
            url: entry.name,
            initiatorType: (entry as any).initiatorType,
            timestamp: new Date().toISOString(),
            stack: new Error().stack
          })
        }
      })
    })

    observer.observe({ entryTypes: ['resource'] })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Prima carica i tipi di contratto
        const { data: contractTypes, error: contractError } = await supabase
          .from('contract_types')
          .select('*')
          .order('id')

        if (contractError) {
          console.error('Errore tipi contratto:', contractError)
          throw contractError
        }

        console.log('Tipi contratto:', contractTypes)

        // Poi carica le tariffe
        const { data: priceRanges, error: priceError } = await supabase
          .from('price_ranges')
          .select(`
            *,
            contract_types (
              id,
              name,
              code
            )
          `)
          .order('contract_type_id')

        if (priceError) {
          console.error('Errore tariffe:', priceError)
          throw priceError
        }

        console.log('Tariffe:', priceRanges)
        setData(priceRanges || [])

      } catch (error) {
        console.error('Errore dettagliato:', error)
        toast.error("Errore nel caricamento dei dati")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestione Tariffe</h1>
      
      {isLoading ? (
        <div className="p-4 bg-gray-50 rounded-lg">Caricamento...</div>
      ) : data.length > 0 ? (
        <div className="grid gap-4">
          {data.map((price) => (
            <div key={price.id} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {price.contract_types?.name}
                  </h3>
                  <p className="text-gray-600">
                    Range: {price.min_quantity} - {price.max_quantity || '∞'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">
                    €{price.base_price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center p-4">Nessuna tariffa trovata</p>
      )}
    </div>
  )
} 