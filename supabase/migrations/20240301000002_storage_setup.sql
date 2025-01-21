-- Creazione bucket per i documenti
insert into storage.buckets (id, name, public) 
values ('contracts', 'contracts', false);

-- Policy per accesso ai file nel bucket contracts
create policy "Contract files accessible by related parties"
  on storage.objects for select
  using (
    exists (
      select 1 from documents d
      join certification_requests cr on d.certification_request_id = cr.id
      join companies c on cr.company_id = c.id
      where storage.objects.name = d.file_path
      and (c.user_id = auth.uid() or auth.jwt()->>'role' = 'commission')
    )
  );

create policy "Contract files insertable by authenticated users"
  on storage.objects for insert
  with check (
    bucket_id = 'contracts' and
    auth.role() = 'authenticated'
  );