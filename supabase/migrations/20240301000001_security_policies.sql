-- Policy per employees
create policy "Employees are viewable by company owner"
  on employees for select
  using (
    exists (
      select 1 from companies
      where companies.id = employees.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Employees are insertable by company owner"
  on employees for insert
  with check (
    exists (
      select 1 from companies
      where companies.id = employees.company_id
      and companies.user_id = auth.uid()
    )
  );

-- Policy per certification_requests
create policy "Requests viewable by company owner or commission"
  on certification_requests for select
  using (
    exists (
      select 1 from companies
      where companies.id = certification_requests.company_id
      and companies.user_id = auth.uid()
    ) or 
    auth.jwt()->>'role' = 'commission'
  );

create policy "Requests insertable by company owner"
  on certification_requests for insert
  with check (
    exists (
      select 1 from companies
      where companies.id = certification_requests.company_id
      and companies.user_id = auth.uid()
    )
  );

-- Policy per documents
create policy "Documents viewable by related parties"
  on documents for select
  using (
    exists (
      select 1 from certification_requests cr
      join companies c on cr.company_id = c.id
      where cr.id = documents.certification_request_id
      and (c.user_id = auth.uid() or auth.jwt()->>'role' = 'commission')
    )
  );

create policy "Documents insertable by related parties"
  on documents for insert
  with check (
    exists (
      select 1 from certification_requests cr
      join companies c on cr.company_id = c.id
      where cr.id = documents.certification_request_id
      and (c.user_id = auth.uid() or auth.jwt()->>'role' = 'commission')
    )
  );