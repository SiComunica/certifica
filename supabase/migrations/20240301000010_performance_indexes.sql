-- Indici per ottimizzare le ricerche più comuni

-- Indici per companies
create index if not exists idx_companies_user_id on companies(user_id);
create index if not exists idx_companies_search on companies using gin(to_tsvector('italian', company_name || ' ' || fiscal_code || ' ' || vat_number));

-- Indici per employees
create index if not exists idx_employees_company_id on employees(company_id);
create index if not exists idx_employees_search on employees using gin(to_tsvector('italian', first_name || ' ' || last_name || ' ' || email));

-- Indici per certification_requests
create index if not exists idx_certification_requests_company_id on certification_requests(company_id);
create index if not exists idx_certification_requests_status on certification_requests(status);
create index if not exists idx_certification_requests_payment_status on certification_requests(payment_status);
create index if not exists idx_certification_requests_created_at on certification_requests(created_at);
create index if not exists idx_certification_requests_request_number on certification_requests(request_number);

-- Indici per documents
create index if not exists idx_documents_certification_request_id on documents(certification_request_id);
create index if not exists idx_documents_created_at on documents(created_at);

-- Indici per fee_settings
create index if not exists idx_fee_settings_type_active on fee_settings(fee_type) where active = true;

-- Indice per la ricerca full-text nei documenti
create index if not exists idx_documents_search on documents using gin(to_tsvector('italian', file_name));

-- Indici per ottimizzare i join più comuni
create index if not exists idx_certification_requests_employee_id on certification_requests(employee_id);

-- Indici per timestamp
create index if not exists idx_companies_updated_at on companies(updated_at);
create index if not exists idx_employees_updated_at on employees(updated_at);
create index if not exists idx_certification_requests_updated_at on certification_requests(updated_at);
create index if not exists idx_documents_updated_at on documents(updated_at); 