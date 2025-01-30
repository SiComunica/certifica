import { useEffect, useState } from "react"
import { StepProps, PraticaFormData } from "../types"
import { supabase } from "@/lib/supabase"

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

  const handleContractTypeChange = async (value: string) => {
    console.log("Selezionato contratto con ID:", value)
    
    try {
      // Recupera il contratto da Supabase
      const { data: contract, error } = await supabase
        .from('contract_types')
        .select('*')
        .eq('id', value)
        .single()

      if (error) {
        console.error("Errore nel recupero del contratto:", error)
        return
      }

      console.log("Dati contratto recuperati:", contract)

      if (contract) {
        const basePrice = Number(contract.base_price) || 0
        console.log("Base price:", basePrice)

        const updatedPriceInfo = {
          id: Number(contract.id),
          contract_type_id: Number(contract.id),
          base_price: basePrice,
          base: basePrice,
          min_quantity: 1,
          max_quantity: 1,
          is_percentage: false,
          percentage_value: 0,
          threshold_value: null,
          is_odcec: false,
          is_renewal: false,
          inputs: {
            isPercentage: false,
            threshold: null,
            contractValue: formData.contractValue || 0,
            basePrice: basePrice,
            quantity: formData.quantity || 1,
            isOdcec: false,
            isRenewal: false,
            conventionDiscount: 0
          },
          withVAT: basePrice * 1.22
        }

        console.log("Aggiornamento priceInfo:", updatedPriceInfo)
        
        updateFormData({
          contractType: value,
          contractTypeName: contract.name,
          productId: contract.product_id,
          priceInfo: updatedPriceInfo
        })
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento del contratto:", error)
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
} 