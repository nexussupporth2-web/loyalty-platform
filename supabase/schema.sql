-- Run this once in Supabase: SQL Editor > New query > paste > Run.
create table stores (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  business_name text not null,
  logo_url text,
  contact_person text not null,
  contact_number text not null,
  business_details text,
  address text not null,
  status text not null default 'active', -- use 'pending' later if you want to approve stores first
  created_at timestamptz default now()
);

-- No public policies: only the server (service role key) reads and writes for now.
alter table stores enable row level security;

-- Public bucket for store logos.
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
on conflict (id) do nothing;
