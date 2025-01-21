-- Sequenza per i numeri di pratica
create sequence certification_request_seq;

-- Funzione per generare il numero di pratica
create or replace function generate_request_number()
returns text
language plpgsql
as $$
declare
  year text := extract(year from current_timestamp)::text;
  seq_number text;
begin
  -- Ottiene il prossimo numero dalla sequenza
  seq_number := lpad(nextval('certification_request_seq')::text, 6, '0');
  -- Restituisce il numero nel formato ANNO-NUMERO (es. 2024-000001)
  return year || '-' || seq_number;
end;
$$;

-- Trigger per assegnare automaticamente il numero di pratica
create or replace function set_request_number()
returns trigger
language plpgsql
as $$
begin
  if new.request_number is null then
    new.request_number := generate_request_number();
  end if;
  return new;
end;
$$;

create trigger trigger_set_request_number
  before insert on certification_requests
  for each row
  execute procedure set_request_number();