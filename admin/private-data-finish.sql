-- Breeze Siding private admin finish script
-- Run this after private-data-schema.sql.
-- Replace YOUR-AUTH-USER-ID with the user id from Supabase Authentication > Users.

insert into public.admin_users (user_id, email, role)
values ('YOUR-AUTH-USER-ID', 'gilmotors2015@gmail.com', 'owner')
on conflict (user_id) do update
set email = excluded.email,
    role = excluded.role;

grant usage on schema public to authenticated;
grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.lead_events to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, update, delete on public.follow_up_tasks to authenticated;
