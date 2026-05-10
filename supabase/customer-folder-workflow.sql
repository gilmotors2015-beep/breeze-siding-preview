-- Breeze Siding customer folder workflow migration
-- Run after the base Supabase schema when ready to track OneDrive/customer folder status.
-- Keep private customer documents in OneDrive. Store only paths/status metadata here.

create type customer_folder_status as enum (
  'not_started',
  'created',
  'starter_pack_copied',
  'estimate_ready',
  'contract_ready',
  'invoice_ready',
  'archived'
);

alter table public.leads
  add column if not exists customer_folder_path text,
  add column if not exists customer_folder_status customer_folder_status not null default 'not_started',
  add column if not exists customer_folder_created_at timestamptz,
  add column if not exists folder_template_version text not null default '2026-05-standard',
  add column if not exists estimate_document_path text,
  add column if not exists invoice_document_path text;

create table if not exists public.customer_folder_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  task_key text not null,
  title text not null,
  detail text,
  document_path text,
  completed boolean not null default false
);

create index if not exists leads_customer_folder_status_idx on public.leads(customer_folder_status);
create index if not exists customer_folder_tasks_lead_id_idx on public.customer_folder_tasks(lead_id);

alter table public.customer_folder_tasks enable row level security;

-- Admin policies should be added after Supabase Auth is configured.
-- Do not expose customer folder task data publicly.
