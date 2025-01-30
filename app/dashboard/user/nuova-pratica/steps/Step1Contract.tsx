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
    // Recupera il contratto da Supabase
    const { data: contract } = await supabase
      .from('contract_types')
      .select('*')
      .eq('id', value)
      .single()

    if (contract) {
      const contractData = {
        id: contract.id,
        name: contract.name,
        productId: contract.product_id,
        basePrice: contract.base_price
      }
      
      setSelectedContract(contractData)
      
      updateFormData({
        contractType: value,
        contractTypeName: contract.name,
        productId: contract.product_id,
        priceInfo: {
          ...formData.priceInfo,
          base_price: contract.base_price,
          base: contract.base_price,
          inputs: {
            ...formData.priceInfo.inputs,
            basePrice: contract.base_price,
            contractValue: formData.contractValue || 0,
            quantity: formData.quantity || 1
          },
          withVAT: contract.base_price * 1.22
        }
      })
    }
  }

  useEffect(() => {
    console.log("PriceInfo aggiornato:", formData.priceInfo)
  }, [formData.priceInfo])
} 