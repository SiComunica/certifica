export type PriceRange = {
  id: number
  contract_type_id: number
  base_price: number
  is_percentage: boolean
  percentage_value: number | null
  threshold_value: number | null
  min_quantity: number
  is_odcec: boolean
  is_renewal: boolean
}

export type PriceCalculation = {
  base: number
  withVAT: number
  inputs: {
    isPercentage: boolean
    threshold: number | null
    contractValue: number
    basePrice: number
    quantity: number
    isOdcec: boolean
    isRenewal: boolean
  }
}

export type EmployeeData = {
  employeeName: string
  fiscalCode: string
  contractType: string
  contractValue: number
  quantity: number
  isOdcec: boolean
  isRenewal: boolean
  contractTypeName?: string
}

export type FormData = {
  employeeName: string
  fiscalCode: string
  contractType: string
  contractTypeName: string
  contractValue: number
  quantity: number
  isOdcec: boolean
  isRenewal: boolean
  practiceId: string
  basePrice: number
  productId: string
  email?: string
  priceInfo: PriceRange
  conventionCode?: string
  conventionDiscount?: number
  documents: {
    id: string
    name: string
    url: string
  }[]
}

export type StepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
} 