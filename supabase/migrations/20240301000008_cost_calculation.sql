-- Tabella per le tariffe base e supplementi
create table if not exists fee_settings (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone,
  fee_type text not null,  -- 'base_fee', 'urgency_fee', 'complexity_fee'
  amount decimal not null,
  description text,
  active boolean default true
);

-- Inserimento tariffe di default
insert into fee_settings (fee_type, amount, description) values
  ('base_fee', 100.00, 'Tariffa base per certificazione'),
  ('urgency_fee', 50.00, 'Supplemento per urgenza'),
  ('complexity_fee', 75.00, 'Supplemento per complessità');

-- Funzione per il calcolo del costo totale
create or replace function calculate_certification_cost(
  p_is_urgent boolean default false,
  p_is_complex boolean default false
)
returns decimal
language plpgsql
as $$
declare
  v_total_cost decimal := 0;
  v_base_fee decimal;
  v_urgency_fee decimal;
  v_complexity_fee decimal;
begin
  -- Recupera la tariffa base
  select amount into v_base_fee
  from fee_settings
  where fee_type = 'base_fee' and active = true
  limit 1;

  v_total_cost := v_base_fee;

  -- Aggiunge supplemento per urgenza se richiesto
  if p_is_urgent then
    select amount into v_urgency_fee
    from fee_settings
    where fee_type = 'urgency_fee' and active = true
    limit 1;
    
    v_total_cost := v_total_cost + coalesce(v_urgency_fee, 0);
  end if;

  -- Aggiunge supplemento per complessità se richiesto
  if p_is_complex then
    select amount into v_complexity_fee
    from fee_settings
    where fee_type = 'complexity_fee' and active = true
    limit 1;
    
    v_total_cost := v_total_cost + coalesce(v_complexity_fee, 0);
  end if;

  return v_total_cost;
end;
$$;

-- Trigger per calcolare automaticamente il costo della pratica
create or replace function set_certification_cost()
returns trigger
language plpgsql
as $$
begin
  -- Calcola e imposta il costo solo se non è già stato impostato
  if new.payment_amount is null then
    new.payment_amount := calculate_certification_cost(
      new.is_urgent,
      new.is_complex
    );
  end if;
  return new;
end;
$$;

-- Crea il trigger sulla tabella certification_requests
create trigger trigger_set_certification_cost
  before insert on certification_requests
  for each row
  execute procedure set_certification_cost();

-- Abilita RLS sulla tabella fee_settings
alter table fee_settings enable row level security;

-- Policy per fee_settings (solo la commissione può modificare le tariffe)
create policy "Fee settings viewable by all authenticated users"
  on fee_settings for select
  to authenticated
  using (true);

create policy "Fee settings modifiable by commission only"
  on fee_settings for all
  using (auth.jwt()->>'role' = 'commission')
  with check (auth.jwt()->>'role' = 'commission'); 