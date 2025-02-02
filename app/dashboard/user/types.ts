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

export interface Document {
  name: string
  path: string
}

export interface Pratica {
  id: string
  pratica_number: string
  user_id: string
  created_at: string
  status: string
  employee_name: string
  employee_fiscal_code: string
  contract_type_name: string
  total_amount: number
  receipt_path?: string
  submitted_at?: string
  hearing_date?: string
  hearing_link?: string
  documents?: Document[]
} 