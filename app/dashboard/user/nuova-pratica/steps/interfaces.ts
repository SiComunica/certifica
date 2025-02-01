export interface AppliedConvention {
  id: string
  code: string
  discount_percentage: number
}

export interface PraticaFormData {
  userId?: string
  employeeName: string
  contractType: string
  contractTypeName: string
  documents: any[]
  fiscalCode: string
  isOdcec: boolean
  isRenewal: boolean
  conventionCode?: string
  conventionDiscount?: number
  quantity: number
  contractValue: number
  priceInfo?: any
} 