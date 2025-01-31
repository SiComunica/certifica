import { useEffect, useState } from "react"
import { StepProps, PraticaFormData } from "../types"
import { supabase } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "react-hot-toast"

const contractTypes = [
  { 
    id: "9", 
    name: "Contratto Tipo A",
    productId: "PROD_A",
    basePrice: 250 
  },
  { 
    id: "10", 
    name: "Contratto Tipo B",
    productId: "PROD_B",
    basePrice: 350 
  },
  // ... altri tipi di contratto ...
]

type ContractType = {
  id: string
  name: string
  productId: string
  basePrice: number
}

type Props = {
  formData: PraticaFormData
  updateFormData: (data: Partial<PraticaFormData>) => void
}

export function Step1Contract({ formData, updateFormData }: Props) {
  const [selectedContract, setSelectedContract] = useState<ContractType | null>(null)
  const [priceInfo, setPriceInfo] = useState<any>(null)
  const supabase = createClientComponentClient()

  const handleContractTypeChange = async (value: string) => {
    console.log("Selezionato contratto con ID:", value)
    
    try {
      // 1. Recupera il contratto
      const { data: contract, error: contractError } = await supabase
        .from('contract_types')
        .select('*')
        .eq('id', value)
        .single()

      if (contractError) throw contractError

      // 2. Recupera il prezzo base
      const { data: priceRange, error: priceError } = await supabase
        .from('price_ranges')
        .select('*')
        .eq('contract_type_id', value)
        .eq('min_quantity', 1)
        .eq('is_odcec', false)
        .eq('is_renewal', false)
        .single()

      if (priceError) throw priceError

      console.log('Prezzo trovato:', priceRange)

      // 3. Aggiorna lo stato locale
      setPriceInfo(priceRange)

      // 4. Aggiorna formData con tutti i dati necessari
      updateFormData({
        contractType: value,
        contractTypeName: contract.name,
        productId: contract.product_id,
        priceInfo: {
          ...priceRange,
          base: priceRange.base_price,
          base_price: priceRange.base_price,
          inputs: {
            isPercentage: priceRange.is_percentage,
            threshold: priceRange.threshold_value,
            contractValue: formData.contractValue || 0,
            basePrice: priceRange.base_price,
            quantity: formData.quantity || 1,
            isOdcec: false,
            isRenewal: false,
            conventionDiscount: 0
          },
          withVAT: priceRange.base_price * 1.22
        }
      })

    } catch (error) {
      console.error('Errore durante l\'aggiornamento del contratto:', error)
      toast.error("Errore nel recupero dei dati del contratto")
    }
  }

  useEffect(() => {
    // Se c'è già un contractType selezionato, recupera i dati
    if (formData.contractType && !selectedContract) {
      handleContractTypeChange(formData.contractType)
    }
  }, [formData.contractType])

  useEffect(() => {
    console.log("PriceInfo aggiornato:", formData.priceInfo)
  }, [formData.priceInfo])

  return (
    <div>
      {/* ... form esistente ... */}
      
      {priceInfo && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">
            <div>Costo base: €{priceInfo.base_price.toFixed(2)}</div>
            <div className="text-xs mt-1">
              * Il prezzo finale potrebbe variare in base a:
              <ul className="list-disc list-inside mt-1">
                <li>Quantità di pratiche</li>
                <li>Convenzioni applicate</li>
                <li>Rinnovo certificazione</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* ... resto del form ... */}
    </div>
  )
} 