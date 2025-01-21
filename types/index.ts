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