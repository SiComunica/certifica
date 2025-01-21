-- Sequenza per i numeri di pratica
create sequence if not exists certification_request_seq;

-- Funzione per generare il numero di pratica
create or replace function generate_request_number()
returns text
language plpgsql
as $$
declare
  year text := extract(year from current_timestamp)::text;
  seq_number text;
begin
  -- Ottiene il prossimo numero dalla sequenza e lo formatta con padding di zeri
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
  -- Assegna il numero solo se non è già stato impostato
  if new.request_number is null then
    new.request_number := generate_request_number();
  end if;
  return new;
end;
$$;

-- Crea il trigger sulla tabella certification_requests
create trigger trigger_set_request_number
  before insert on certification_requests
  for each row
  execute procedure set_request_number(); 