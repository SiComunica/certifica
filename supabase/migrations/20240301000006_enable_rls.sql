-- Prima abilitiamo RLS su tutte le tabelle
alter table companies enable row level security;
alter table employees enable row level security;
alter table documents enable row level security;

-- Ora creiamo le policy una per una

-- Companies policies
create policy "Companies are viewable by owner"
  on companies for all
  using (auth.uid() = user_id);

-- Employees policies
create policy "Employees are viewable by company owner"
  on employees for all
  using (
    exists (
      select 1 from companies
      where companies.id = employees.company_id
      and companies.user_id = auth.uid()
    )
  );

-- Documents policies
create policy "Documents viewable by related parties"
  on documents for all
  using (
    exists (
      select 1 from certification_requests cr
      join companies c on cr.company_id = c.id
      where cr.id = documents.certification_request_id
      and (c.user_id = auth.uid() or auth.jwt()->>'role' = 'commission')
    )
  );

-- Verifica bucket e policy storage
select * from storage.buckets;

-- Se il bucket 'contracts' non esiste, crealo
insert into storage.buckets (id, name, public) 
values ('contracts', 'contracts', false);

-- Aggiungi policy per lo storage
create policy "Contract files accessible by related parties"
  on storage.objects for all
  using (
    exists (
      select 1 from documents d
      join certification_requests cr on d.certification_request_id = cr.id
      join companies c on cr.company_id = c.id
      where storage.objects.name = d.file_path
      and (c.user_id = auth.uid() or auth.jwt()->>'role' = 'commission')
    )
  ); 

-- Funzione per le statistiche
create or replace function get_certification_statistics(company_id uuid)
returns table (
  total_requests bigint,
  pending_requests bigint,
  approved_requests bigint,
  rejected_requests bigint,
  total_amount numeric
)
language plpgsql
as $$
begin
  return query
  select
    count(*) as total_requests,
    count(*) filter (where status = 'pending') as pending_requests,
    count(*) filter (where status = 'approved') as approved_requests,
    count(*) filter (where status = 'rejected') as rejected_requests,
    sum(payment_amount) as total_amount
  from certification_requests
  where certification_requests.company_id = $1;
end;
$$; 