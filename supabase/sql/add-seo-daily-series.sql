-- Adds day-by-day history storage for the admin website performance graph.
-- Run this once in Supabase SQL Editor before relying on the 28-day chart.

alter table public.seo_snapshots
  add column if not exists daily_series jsonb not null default '[]'::jsonb;

comment on column public.seo_snapshots.daily_series is
  'Last 28 days of daily GA4 and Search Console performance points for the Breeze Siding admin dashboard.';
