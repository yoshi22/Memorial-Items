do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'new',
      'in_review',
      'proof_uploaded',
      'revision_requested',
      'approved',
      'in_production',
      'shipped',
      'completed',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'unpaid',
      'pending',
      'paid',
      'refunded'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'revision_status') then
    create type public.revision_status as enum (
      'open',
      'addressed',
      'closed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'art_asset_type') then
    create type public.art_asset_type as enum (
      'reference',
      'selected_reference',
      'proof',
      'print_master'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  public_order_token text not null unique default md5(gen_random_uuid()::text || clock_timestamp()::text),
  public_proof_token text not null unique default md5(gen_random_uuid()::text || clock_timestamp()::text),
  customer_name text not null,
  customer_email text not null,
  pet_name text not null,
  style text not null,
  size text not null,
  frame text not null,
  must_keep_features text,
  notes text,
  status public.order_status not null default 'new',
  payment_status public.payment_status not null default 'unpaid',
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_images (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  file_path text not null,
  original_filename text,
  mime_type text,
  file_size bigint,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  version integer not null,
  proof_image_url text not null,
  production_notes text,
  created_at timestamptz not null default now(),
  unique (order_id, version)
);

create table if not exists public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  proof_id uuid not null references public.proofs(id) on delete cascade,
  request_text text not null,
  status public.revision_status not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.art_assets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  asset_type public.art_asset_type not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  note text not null,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.content_examples (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_description text,
  image_url text not null,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_images_order_id on public.order_images(order_id);
create index if not exists idx_proofs_order_id on public.proofs(order_id);
create index if not exists idx_revision_requests_order_id on public.revision_requests(order_id);
create index if not exists idx_art_assets_order_id on public.art_assets(order_id);
create index if not exists idx_admin_notes_order_id on public.admin_notes(order_id);
create index if not exists idx_content_examples_published_sort on public.content_examples(is_published, sort_order);
create index if not exists idx_faq_items_published_sort on public.faq_items(is_published, sort_order);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists trg_content_examples_updated_at on public.content_examples;
create trigger trg_content_examples_updated_at
before update on public.content_examples
for each row
execute function public.set_updated_at();

drop trigger if exists trg_faq_items_updated_at on public.faq_items;
create trigger trg_faq_items_updated_at
before update on public.faq_items
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_images enable row level security;
alter table public.proofs enable row level security;
alter table public.revision_requests enable row level security;
alter table public.art_assets enable row level security;
alter table public.admin_notes enable row level security;
alter table public.content_examples enable row level security;
alter table public.faq_items enable row level security;

insert into storage.buckets (id, name, public)
values
  ('customer-uploads', 'customer-uploads', false),
  ('proofs', 'proofs', false),
  ('print-masters', 'print-masters', false),
  ('examples', 'examples', true)
on conflict (id) do nothing;
