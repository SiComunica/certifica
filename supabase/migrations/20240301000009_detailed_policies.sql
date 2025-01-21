-- Policy per Companies
drop policy if exists "Companies are viewable by owner" on companies;

create policy "Companies viewable by owner"
  on companies for select
  using (auth.uid() = user_id);

create policy "Companies insertable by owner"
  on companies for insert
  with check (auth.uid() = user_id);

create policy "Companies updatable by owner"
  on companies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Companies deletable by owner"
  on companies for delete
  using (auth.uid() = user_id);

-- Policy per Employees
drop policy if exists "Employees are viewable by company owner" on employees;

create policy "Employees viewable by company owner"
  on employees for select
  using (
    exists (
      select 1 from companies
      where companies.id = employees.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Employees insertable by company owner"
  on employees for insert
  with check (
    exists (
      select 1 from companies
      where companies.id = employees.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Employees updatable by company owner"
  on employees for update
  using (
    exists (
      select 1 from companies
      where companies.id = employees.company_id
      and companies.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from companies
      where companies.id = employees.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Employees deletable by company owner"
  on employees for delete
  using (
    exists (
      select 1 from companies
      where companies.id = employees.company_id
      and companies.user_id = auth.uid()
    )
  );

-- Policy per Certification Requests
create policy "Requests viewable by owner or commission"
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

create policy "Requests updatable by commission only"
  on certification_requests for update
  using (auth.jwt()->>'role' = 'commission')
  with check (auth.jwt()->>'role' = 'commission');

-- Policy per Documents con controlli più specifici
drop policy if exists "Documents viewable by related parties" on documents;

create policy "Documents viewable by owner or commission"
  on documents for select
  using (
    exists (
      select 1 from certification_requests cr
      join companies c on cr.company_id = c.id
      where cr.id = documents.certification_request_id
      and (c.user_id = auth.uid() or auth.jwt()->>'role' = 'commission')
    )
  );

create policy "Documents insertable by owner"
  on documents for insert
  with check (
    exists (
      select 1 from certification_requests cr
      join companies c on cr.company_id = c.id
      where cr.id = documents.certification_request_id
      and c.user_id = auth.uid()
    )
  );

create policy "Documents updatable by commission"
  on documents for update
  using (auth.jwt()->>'role' = 'commission')
  with check (auth.jwt()->>'role' = 'commission');

create policy "Documents deletable by commission"
  on documents for delete
  using (auth.jwt()->>'role' = 'commission'); 