create table if not exists public.admin_security_events (
  id uuid primary key default gen_random_uuid(),
  email text,
  event_type text not null,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_login_protection (
  email text primary key,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  last_failed_at timestamptz,
  last_success_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_security_events_email_created_at
  on public.admin_security_events(email, created_at desc);

create index if not exists idx_admin_security_events_type_created_at
  on public.admin_security_events(event_type, created_at desc);

drop trigger if exists trg_admin_login_protection_updated_at on public.admin_login_protection;
create trigger trg_admin_login_protection_updated_at
before update on public.admin_login_protection
for each row
execute function public.set_updated_at();

alter table public.admin_security_events enable row level security;
alter table public.admin_login_protection enable row level security;
