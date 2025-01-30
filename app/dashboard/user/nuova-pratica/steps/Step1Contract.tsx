import { useEffect, useState } from "react"
import { StepProps, PraticaFormData } from "../types"

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

  const handleContractTypeChange = (value: string) => {
    const selectedContract = contractTypes.find(c => c.id === value)
    if (selectedContract) {
      updateFormData({
        contractType: value,
        productId: selectedContract.productId,
        priceInfo: {
          ...formData.priceInfo,
          base_price: selectedContract.basePrice
        }
      })
    }
  }
} 