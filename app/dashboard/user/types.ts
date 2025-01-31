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

export interface Pratica {
  id: string
  pratica_number: string
  user_id: string
  employee_name: string
  contract_type: string
  contract_type_name: string
  status: string
  total_amount: number
  documents: any[]
  receipt_path?: string
  fiscal_code: string
  is_odcec: boolean
  is_renewal: boolean
  convention_code?: string
  convention_discount?: number
  created_at: string
  submitted_at?: string
  quantity: number
  contract_value?: number
} 