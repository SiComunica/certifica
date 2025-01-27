export interface Practice {
  id: string;
  contract_type: string;
  submission_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  worker_name: string;
  worker_fiscal_code: string;
  certification_type: string;
  notes?: string;
}

export interface PriceRange {
  id?: number
  contract_type_id: number
  base_price: number
  is_percentage: boolean
  percentage_value: number | null
  threshold_value: number | null
  is_odcec: boolean
  is_renewal: boolean
} 