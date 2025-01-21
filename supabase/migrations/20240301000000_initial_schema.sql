-- Creazione della tabella profiles
create table profiles (
  id uuid references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  primary key (id)
);

-- Funzione per gestire gli aggiornamenti timestamp
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger per aggiornare automaticamente updated_at
create trigger handle_profiles_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at(); 

-- Tabella per le aziende
create table companies (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone,
  company_name text not null,
  vat_number text not null unique,
  fiscal_code text not null unique,
  address text not null,
  city text not null,
  email text not null unique,
  user_id uuid references auth.users on delete cascade
);

-- Tabella per i dipendenti
create table employees (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone,
  first_name text not null,
  last_name text not null,
  contract_type text not null,
  address text not null,
  city text not null,
  email text not null,
  company_id uuid references companies on delete cascade
);

-- Tabella per le pratiche
create table certification_requests (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone,
  request_number text unique not null,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  payment_amount decimal not null,
  employee_id uuid references employees on delete cascade,
  company_id uuid references companies on delete cascade
);

-- Tabella per i documenti
create table documents (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone,
  file_name text not null,
  file_path text not null,
  document_type text not null,
  certification_request_id uuid references certification_requests on delete cascade
);

-- Trigger per updated_at su tutte le tabelle
create trigger handle_companies_updated_at
  before update on companies
  for each row
  execute procedure handle_updated_at();

create trigger handle_employees_updated_at
  before update on employees
  for each row
  execute procedure handle_updated_at();

create trigger handle_certification_requests_updated_at
  before update on certification_requests
  for each row
  execute procedure handle_updated_at();

create trigger handle_documents_updated_at
  before update on documents
  for each row
  execute procedure handle_updated_at();

-- Policies di sicurezza RLS
alter table companies enable row level security;
alter table employees enable row level security;
alter table certification_requests enable row level security;
alter table documents enable row level security;

-- Policy per companies (esempio)
create policy "Companies are viewable by owner"
  on companies for select
  using (auth.uid() = user_id);

create policy "Companies are insertable by authenticated users"
  on companies for insert
  with check (auth.uid() = user_id);