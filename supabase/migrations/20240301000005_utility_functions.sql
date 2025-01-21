-- Funzione per ottenere statistiche sulle pratiche
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

-- Funzione per aggiornare lo stato di una pratica
create or replace function update_request_status(
  request_id uuid,
  new_status text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Verifica che l'utente sia della commissione
  if auth.jwt()->>'role' != 'commission' then
    raise exception 'Non autorizzato';
  end if;

  update certification_requests
  set 
    status = new_status,
    updated_at = now()
  where id = request_id;
end;
$$;