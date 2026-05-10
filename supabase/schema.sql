-- Breeze Siding CRM foundation
-- Run this in Supabase SQL Editor when you are ready to connect real form submissions.
-- Never place a Supabase service-role key in the public website code.

create extension if not exists pgcrypto;

create type lead_stage as enum (
  'new',
  'contacted',
  'estimate_sent',
  'scheduled',
  'won',
  'lost',
  'review_follow_up'
);

create type lead_source as enum (
  'homepage_form',
  'feedback_form',
  'rate_us',
  'schedule_page',
  'manual_entry',
  'phone_call',
  'email'
);

create type appointment_status as enum (
  'open',
  'held',
  'requested',
  'confirmed',
  'completed',
  'cancelled'
);

create type performance_source as enum (
  'google_analytics',
  'search_console',
  'pagespeed',
  'manual'
);

create type workflow_trigger as enum (
  'first_contact',
  'schedule_ready',
  'estimate_ready',
  'bid_accepted',
  'final_walkthrough',
  'feedback_or_review',
  'maintenance_checkup'
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source lead_source not null default 'homepage_form',
  stage lead_stage not null default 'new',
  name text,
  email text,
  phone text,
  city text,
  address text,
  project_type text,
  timeline text,
  message text,
  preferred_contact_method text,
  estimate_value numeric(12,2),
  next_step text,
  assigned_to text,
  tags text[] not null default '{}'
);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  note text not null,
  created_by text
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  event_type text not null,
  title text not null,
  detail text,
  metadata jsonb not null default '{}'
);

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  template_name text not null unique,
  template_file text not null,
  trigger_key workflow_trigger not null,
  description text,
  active boolean not null default true
);

create table public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  step_order int not null unique,
  title text not null,
  trigger_key workflow_trigger not null,
  recommended_template_id uuid references public.email_templates(id) on delete set null,
  lead_stage lead_stage,
  next_stage lead_stage,
  action_summary text,
  active boolean not null default true
);

create table public.lead_template_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  template_id uuid references public.email_templates(id) on delete set null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  subject text,
  attachment_name text,
  sent_by text,
  status text not null default 'planned',
  notes text
);

create table public.schedule_slots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status appointment_status not null default 'open',
  appointment_type text not null default 'estimate',
  internal_note text,
  constraint schedule_slot_time_check check (ends_at > starts_at)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  slot_id uuid references public.schedule_slots(id) on delete set null,
  created_at timestamptz not null default now(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status appointment_status not null default 'requested',
  appointment_type text not null default 'estimate',
  customer_note text,
  internal_note text,
  constraint appointment_time_check check (ends_at > starts_at)
);

create table public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  name text,
  email text,
  reason text,
  rating int check (rating between 1 and 5),
  message text,
  source text not null default 'feedback'
);

create table public.website_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  period_start date not null,
  period_end date not null,
  source performance_source not null,
  visitors int,
  sessions int,
  search_clicks int,
  search_impressions int,
  average_position numeric(6,2),
  conversions int,
  notes text,
  metadata jsonb not null default '{}',
  constraint website_metric_period_check check (period_end >= period_start)
);

create table public.keyword_targets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  keyword text not null unique,
  target_url text not null,
  priority int not null default 1 check (priority between 1 and 5),
  active boolean not null default true,
  plan text
);

create table public.keyword_rank_snapshots (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid not null references public.keyword_targets(id) on delete cascade,
  created_at timestamptz not null default now(),
  period_start date not null,
  period_end date not null,
  position numeric(6,2),
  clicks int,
  impressions int,
  ctr numeric(6,4),
  source performance_source not null default 'search_console',
  constraint keyword_rank_period_check check (period_end >= period_start)
);

create index leads_stage_idx on public.leads(stage);
create index leads_source_idx on public.leads(source);
create index leads_created_at_idx on public.leads(created_at desc);
create index lead_template_events_lead_id_created_at_idx on public.lead_template_events(lead_id, created_at desc);
create index schedule_slots_starts_at_idx on public.schedule_slots(starts_at);
create index appointments_starts_at_idx on public.appointments(starts_at);
create index lead_events_lead_id_created_at_idx on public.lead_events(lead_id, created_at desc);
create index website_metric_period_idx on public.website_metric_snapshots(period_end desc);
create index keyword_rank_keyword_period_idx on public.keyword_rank_snapshots(keyword_id, period_end desc);

insert into public.email_templates (template_name, template_file, trigger_key, description)
values
  ('Welcome', 'Welcome.oft', 'first_contact', 'Initial response after a form submission, phone call, or manually entered lead.'),
  ('Schedule', 'schedule.oft', 'schedule_ready', 'Appointment scheduling, confirmation, and visit expectations.'),
  ('Estimate', 'Estimate.oft', 'estimate_ready', 'Bid email sent with estimate PDF attachment.'),
  ('Bid Accepted', 'bid accepted.oft', 'bid_accepted', 'Accepted estimate next steps, job expectations, and start date planning.'),
  ('Final Invoice', 'Final invoice.oft', 'final_walkthrough', 'Final walkthrough, invoice, and payment options.'),
  ('Feedback', 'feedback.oft', 'feedback_or_review', 'Feedback request, review request, or lost-estimate follow-up.')
on conflict (template_name) do nothing;

insert into public.workflow_steps (step_order, title, trigger_key, lead_stage, next_stage, action_summary)
values
  (1, 'First contact received', 'first_contact', 'new', 'contacted', 'Confirm the request, set expectations, and move the lead toward scheduling.'),
  (2, 'Appointment scheduling', 'schedule_ready', 'contacted', 'scheduled', 'Send scheduling instructions or appointment confirmation.'),
  (3, 'Bid sent', 'estimate_ready', 'scheduled', 'estimate_sent', 'Send estimate email with the PDF attachment and track follow-up.'),
  (4, 'Bid accepted', 'bid_accepted', 'estimate_sent', 'won', 'Lay out job expectations, next steps, start date planning, and prep details.'),
  (5, 'Final walkthrough and invoice', 'final_walkthrough', 'won', 'review_follow_up', 'Schedule final walkthrough, send invoice, and include payment options.'),
  (6, 'Feedback, review, and maintenance loop', 'feedback_or_review', 'review_follow_up', 'review_follow_up', 'Request feedback, review, or future maintenance/checkup follow-up.')
on conflict (step_order) do nothing;

insert into public.keyword_targets (keyword, target_url, priority, plan)
values
  ('siding replacement seattle', '/siding-replacement-seattle.html', 1, 'Strengthen city page content and add internal links from related blog posts.'),
  ('siding contractor tacoma', '/siding-replacement-tacoma.html', 1, 'Build local proof, completed project references, and Tacoma-specific service copy.'),
  ('james hardie siding installer', '/siding-replacement.html', 2, 'Add stronger James Hardie sections, FAQs, and supporting comparison content.')
on conflict (keyword) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- RLS is intentionally enabled here. Policies should be tightened during setup.
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_events enable row level security;
alter table public.email_templates enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.lead_template_events enable row level security;
alter table public.schedule_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.feedback_responses enable row level security;
alter table public.website_metric_snapshots enable row level security;
alter table public.keyword_targets enable row level security;
alter table public.keyword_rank_snapshots enable row level security;

-- Public insert policies let website forms submit records without exposing existing leads.
create policy "public can submit leads"
on public.leads for insert
to anon
with check (true);

create policy "public can submit feedback"
on public.feedback_responses for insert
to anon
with check (true);

create policy "public can request appointments"
on public.appointments for insert
to anon
with check (true);

-- Admin read/update policies should be added after Supabase Auth is configured.
-- Recommended next step: create an admin user and add authenticated-only policies for select/update/delete.
