-- Breeze Siding private admin database schema
-- Intended for a Postgres/Supabase-style backend with authentication and row-level security.
-- Run this only inside the private backend database, not on the public website.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key,
  email text not null unique,
  role text not null default 'admin' check (role in ('owner', 'admin', 'viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'manual',
  stage text not null default 'needs_review' check (stage in (
    'needs_review',
    'qualified',
    'contacted',
    'estimate_sent',
    'scheduled',
    'won',
    'lost',
    'spam',
    'review_follow_up'
  )),
  customer_name text not null,
  contact_person text,
  phone text,
  email text,
  address_line text,
  city text,
  state text default 'WA',
  zip text,
  project_type text,
  project_summary text,
  estimate_no text,
  estimate_date date,
  estimate_total numeric(12,2),
  due_date date,
  folder_path text,
  folder_status text default 'not_started',
  next_step text,
  notes text,
  is_spam boolean not null default false
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  event_type text not null,
  event_note text,
  created_by uuid
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'available' check (status in ('available', 'held', 'booked', 'completed', 'cancelled')),
  appointment_type text default 'estimate',
  location_note text,
  internal_note text
);

create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  due_at timestamptz,
  status text not null default 'open' check (status in ('open', 'done', 'skipped')),
  task_type text not null default 'follow_up',
  title text not null,
  notes text
);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
before update on public.leads
for each row execute function public.touch_updated_at();

alter table public.admin_users enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table public.appointments enable row level security;
alter table public.follow_up_tasks enable row level security;

create or replace function public.is_admin_user()
returns boolean as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role in ('owner', 'admin', 'viewer')
  );
$$ language sql stable security definer;

create or replace function public.can_edit_admin_data()
returns boolean as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$ language sql stable security definer;

create policy "Admin users can read admin users"
  on public.admin_users for select
  using (public.is_admin_user());

create policy "Owners can manage admin users"
  on public.admin_users for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'owner'))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'owner'));

create policy "Admin users can read leads"
  on public.leads for select
  using (public.is_admin_user());

create policy "Admins can insert leads"
  on public.leads for insert
  with check (public.can_edit_admin_data());

create policy "Admins can update leads"
  on public.leads for update
  using (public.can_edit_admin_data())
  with check (public.can_edit_admin_data());

create policy "Admins can delete leads"
  on public.leads for delete
  using (public.can_edit_admin_data());

create policy "Admin users can read lead events"
  on public.lead_events for select
  using (public.is_admin_user());

create policy "Admins can manage lead events"
  on public.lead_events for all
  using (public.can_edit_admin_data())
  with check (public.can_edit_admin_data());

create policy "Admin users can read appointments"
  on public.appointments for select
  using (public.is_admin_user());

create policy "Admins can manage appointments"
  on public.appointments for all
  using (public.can_edit_admin_data())
  with check (public.can_edit_admin_data());

create policy "Admin users can read follow up tasks"
  on public.follow_up_tasks for select
  using (public.is_admin_user());

create policy "Admins can manage follow up tasks"
  on public.follow_up_tasks for all
  using (public.can_edit_admin_data())
  with check (public.can_edit_admin_data());

-- After creating your first auth user, add that user to admin_users.
-- Example:
-- insert into public.admin_users (user_id, email, role)
-- values ('YOUR-AUTH-USER-ID', 'service@breezesiding.com', 'owner');
