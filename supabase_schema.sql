-- ============================================================
-- HAIR BY MAEVA — SUPABASE DATABASE SCHEMA
-- Run this in your free Supabase project: SQL Editor -> New Query -> Run
-- ============================================================

-- 1. BOOKINGS TABLE
create table if not exists public.bookings (
  id text primary key,
  client_name text not null,
  client_phone text not null,
  client_email text,
  service_id text,
  service_name text not null,
  selected_length text,
  total_price numeric not null,
  deposit_amount numeric not null,
  appointment_date text not null,
  appointment_time text not null,
  notes text,
  status text default 'pending_deposit',
  payment_reference text,
  zelle_sender_name text,
  zelle_memo text,
  created_at timestamp with time zone default now()
);

-- Enable RLS and public access policies
alter table public.bookings enable row level security;

create policy "Allow anonymous select on bookings"
  on public.bookings for select
  using (true);

create policy "Allow anonymous insert on bookings"
  on public.bookings for insert
  with check (true);

create policy "Allow anonymous update on bookings"
  on public.bookings for update
  using (true);

create policy "Allow anonymous delete on bookings"
  on public.bookings for delete
  using (true);

-- 2. SERVICES CATALOGUE TABLE
create table if not exists public.services (
  id text primary key,
  name text not null,
  price numeric not null,
  deposit numeric not null,
  image text,
  notice text,
  lengths jsonb,
  created_at timestamp with time zone default now()
);

alter table public.services enable row level security;

create policy "Allow anonymous select on services"
  on public.services for select
  using (true);

create policy "Allow anonymous insert on services"
  on public.services for insert
  with check (true);

create policy "Allow anonymous update on services"
  on public.services for update
  using (true);

create policy "Allow anonymous delete on services"
  on public.services for delete
  using (true);
