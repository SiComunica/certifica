export type PriceRange = {
  id: number
  contract_type_id: number
  min_quantity: number
  max_quantity: number
  base_price: number
  is_percentage: boolean
  percentage_value: number
  threshold_value: number | null
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
  email: string
  contractType: string
  contractValue: number
  isOdcec: boolean
  isRenewal: boolean
  quantity: number
}

export type Document = {
  id: string
  name: string
  url: string
}

export type PriceInfo = {
  id: number
  contract_type_id: number
  min_quantity: number
  max_quantity: number
  base_price: number
  base: number
  is_percentage: boolean
  percentage_value: number
  threshold_value: number | null
  is_odcec: boolean
  is_renewal: boolean
  inputs: {
    isPercentage: boolean
    threshold: number | null
    contractValue: number
    basePrice: number
    quantity: number
    isOdcec: boolean
    isRenewal: boolean
    conventionDiscount: number
  }
  withVAT: number
}

export type PraticaFormData = {
  employeeName: string
  fiscalCode: string
  email: string
  contractType: string
  contractTypeName: string
  contractValue: number
  documents: Document[]
  conventionCode: string
  conventionDiscount: number
  isOdcec: boolean
  isRenewal: boolean
  quantity: number
  productId: string
  practiceId: string
  priceInfo: PriceInfo
}

export type PracticeData = {
  status: string
  user_id: string
  created_at: string
  employeeName: string
  fiscalCode: string
  email: string
  contractType: string
  contractTypeName: string
  contractValue: number
  documents: Document[]
  conventionCode: string
  conventionDiscount: number
  isOdcec: boolean
  isRenewal: boolean
  quantity: number
  productId: string
  practiceId: string
  priceInfo: PriceInfo
}

export type StepProps = {
  formData: PraticaFormData
  updateFormData: (data: Partial<PraticaFormData>) => void
} 