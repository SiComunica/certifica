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
  url: string
  type: string
  size?: number
  path?: string
}

interface ContractType {
  name: string
  id: string
}

export interface Pratica {
  id: string
  pratica_number: string
  user_id: string
  user_email?: string
  created_at: string
  status: string
  employee_name: string
  employee_fiscal_code: string
  contract_type: string
  contract_types?: ContractType
  payment_receipt: string | null
  documents?: Document[]
  hearing_date?: string
  hearing_link?: string
  hearing_confirmed?: boolean
  hearing_needs_reschedule?: boolean
  hearing_confirmation_date?: string
} 