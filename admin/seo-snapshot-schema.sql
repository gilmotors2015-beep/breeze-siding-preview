-- Breeze Siding SEO tracker daily snapshot table
-- Run this in Supabase SQL Editor after the private admin schema is active.

create extension if not exists pgcrypto;

create table if not exists public.seo_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  checked_on date not null default current_date,
  visitors_28d integer,
  visitors_per_day numeric(8,2),
  leads_7d integer,
  leads_28d integer,
  search_clicks_28d integer,
  search_impressions_28d integer,
  search_ctr numeric(8,2),
  average_position numeric(8,2),
  indexed_pages integer,
  not_indexed_pages integer,
  notes text,
  source text not null default 'manual',
  unique (checked_on)
);

alter table public.seo_snapshots add column if not exists wa_active_users_28d integer;
alter table public.seo_snapshots add column if not exists wa_sessions_28d integer;
alter table public.seo_snapshots add column if not exists wa_engaged_sessions_28d integer;
alter table public.seo_snapshots add column if not exists wa_engagement_rate numeric(8,2);
alter table public.seo_snapshots add column if not exists wa_average_session_duration numeric(10,2);
alter table public.seo_snapshots add column if not exists organic_search_sessions_28d integer;
alter table public.seo_snapshots add column if not exists top_cities jsonb not null default '[]'::jsonb;
alter table public.seo_snapshots add column if not exists top_pages jsonb not null default '[]'::jsonb;
alter table public.seo_snapshots add column if not exists synced_at timestamptz;

alter table public.seo_snapshots enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seo_snapshots'
      and policyname = 'Admin users can read SEO snapshots'
  ) then
    create policy "Admin users can read SEO snapshots"
      on public.seo_snapshots for select
      using (public.is_admin_user());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seo_snapshots'
      and policyname = 'Admins can insert SEO snapshots'
  ) then
    create policy "Admins can insert SEO snapshots"
      on public.seo_snapshots for insert
      with check (public.can_edit_admin_data());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seo_snapshots'
      and policyname = 'Admins can update SEO snapshots'
  ) then
    create policy "Admins can update SEO snapshots"
      on public.seo_snapshots for update
      using (public.can_edit_admin_data())
      with check (public.can_edit_admin_data());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'seo_snapshots'
      and policyname = 'Admins can delete SEO snapshots'
  ) then
    create policy "Admins can delete SEO snapshots"
      on public.seo_snapshots for delete
      using (public.can_edit_admin_data());
  end if;
end $$;

-- Test row. You can delete this after confirming the dashboard reads it.
insert into public.seo_snapshots (
  checked_on,
  visitors_28d,
  visitors_per_day,
  leads_7d,
  leads_28d,
  search_clicks_28d,
  search_impressions_28d,
  search_ctr,
  average_position,
  indexed_pages,
  not_indexed_pages,
  wa_active_users_28d,
  wa_sessions_28d,
  wa_engaged_sessions_28d,
  wa_engagement_rate,
  wa_average_session_duration,
  organic_search_sessions_28d,
  top_cities,
  top_pages,
  notes,
  source,
  synced_at
)
values (
  current_date,
  441,
  15.75,
  4,
  8,
  39,
  31807,
  0.12,
  14.20,
  35,
  null,
  159,
  208,
  32,
  15.38,
  87,
  59,
  '[{"city":"Seattle","activeUsers":57,"sessions":72},{"city":"Tacoma","activeUsers":19,"sessions":41},{"city":"Everett","activeUsers":7,"sessions":7},{"city":"Bellevue","activeUsers":6,"sessions":7}]'::jsonb,
  '[]'::jsonb,
  'Initial SEO baseline before daily automation is connected.',
  'baseline',
  now()
)
on conflict (checked_on) do update set
  visitors_28d = excluded.visitors_28d,
  visitors_per_day = excluded.visitors_per_day,
  leads_7d = excluded.leads_7d,
  leads_28d = excluded.leads_28d,
  search_clicks_28d = excluded.search_clicks_28d,
  search_impressions_28d = excluded.search_impressions_28d,
  search_ctr = excluded.search_ctr,
  average_position = excluded.average_position,
  indexed_pages = excluded.indexed_pages,
  not_indexed_pages = excluded.not_indexed_pages,
  wa_active_users_28d = excluded.wa_active_users_28d,
  wa_sessions_28d = excluded.wa_sessions_28d,
  wa_engaged_sessions_28d = excluded.wa_engaged_sessions_28d,
  wa_engagement_rate = excluded.wa_engagement_rate,
  wa_average_session_duration = excluded.wa_average_session_duration,
  organic_search_sessions_28d = excluded.organic_search_sessions_28d,
  top_cities = excluded.top_cities,
  top_pages = excluded.top_pages,
  notes = excluded.notes,
  source = excluded.source,
  synced_at = excluded.synced_at;