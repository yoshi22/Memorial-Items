do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum (
      'unknown',
      'credit_card',
      'paypay_qr'
    );
  end if;
end
$$;

alter table public.orders
  add column if not exists payment_method public.payment_method not null default 'unknown';

create index if not exists idx_orders_payment_method on public.orders(payment_method);
