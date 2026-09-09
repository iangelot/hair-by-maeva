-- ============================================================
-- HAIR BY MAEVA — SUPABASE DATABASE SCHEMA
-- Run this in your free Supabase project: SQL Editor -> New Query -> Run
-- Safe to run multiple times (even if tables already exist).
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

alter table public.bookings enable row level security;

drop policy if exists "Allow anonymous select on bookings" on public.bookings;
create policy "Allow anonymous select on bookings"
  on public.bookings for select
  using (true);

drop policy if exists "Allow anonymous insert on bookings" on public.bookings;
create policy "Allow anonymous insert on bookings"
  on public.bookings for insert
  with check (true);

drop policy if exists "Allow anonymous update on bookings" on public.bookings;
create policy "Allow anonymous update on bookings"
  on public.bookings for update
  using (true);

drop policy if exists "Allow anonymous delete on bookings" on public.bookings;
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

drop policy if exists "Allow anonymous select on services" on public.services;
create policy "Allow anonymous select on services"
  on public.services for select
  using (true);

drop policy if exists "Allow anonymous insert on services" on public.services;
create policy "Allow anonymous insert on services"
  on public.services for insert
  with check (true);

drop policy if exists "Allow anonymous update on services" on public.services;
create policy "Allow anonymous update on services"
  on public.services for update
  using (true);

drop policy if exists "Allow anonymous delete on services" on public.services;
create policy "Allow anonymous delete on services"
  on public.services for delete
  using (true);

-- 3. SITE CONTENT TABLE (Admin panel -> live website sync)
-- Stores the editable site content (services, posters, payment settings,
-- salon info, policies) so admin edits show for every visitor.
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

alter table public.site_content enable row level security;

-- Every visitor can read the latest content
drop policy if exists "Allow anonymous select on site_content" on public.site_content;
create policy "Allow anonymous select on site_content"
  on public.site_content for select
  to anon, authenticated
  using (true);

-- Writes are NOT allowed with the public anon key.
-- The admin panel saves through /api/content, which validates the admin
-- passkey server-side and writes with the SUPABASE_SERVICE_ROLE_KEY.

-- New tables are not always auto-exposed to the Data API, so grant explicitly
grant select on public.site_content to anon, authenticated;
grant select, insert, update, delete on public.site_content to service_role;
