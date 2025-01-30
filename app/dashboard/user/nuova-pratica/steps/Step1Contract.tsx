import { StepProps } from "../types"

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

export function Step1Contract({ formData, updateFormData }: StepProps) {
  const handleContractTypeChange = (value: string) => {
    const selectedContract = contractTypes.find(c => c.id === value)
    updateFormData({
      ...formData,
      contractType: value,
      productId: selectedContract?.productId || '',
      basePrice: selectedContract?.basePrice || 0
    })
  }
} 