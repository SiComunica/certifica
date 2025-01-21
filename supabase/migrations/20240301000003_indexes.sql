-- Indici per ricerche frequenti
create index idx_certification_requests_status on certification_requests(status);
create index idx_certification_requests_payment_status on certification_requests(payment_status);
create index idx_employees_company_id on employees(company_id);
create index idx_documents_certification_request_id on documents(certification_request_id);
create index idx_companies_user_id on companies(user_id);

-- Indice per ricerca full-text sui nomi delle aziende
create index idx_companies_name_search on companies using gin(to_tsvector('italian', company_name));