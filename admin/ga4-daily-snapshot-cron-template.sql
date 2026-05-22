-- Optional Supabase cron template for the GA4 daily SEO snapshot.
-- Run only after the Edge Function works when tested manually.
-- Store the service role key and GA4 sync secret in Vault first.

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists vault;

-- Run these once, replacing the placeholder values.
-- If a secret already exists, update it in Vault instead of duplicating it.
-- select vault.create_secret('YOUR_SUPABASE_SERVICE_ROLE_KEY', 'breeze_service_role_key');
-- select vault.create_secret('YOUR_GA4_SYNC_SECRET', 'ga4_sync_secret');

-- Daily at 6 PM Pacific during daylight saving time is 1 AM UTC.
-- During Pacific standard time, change this to '0 2 * * *' if you want to keep 6 PM local time.
select cron.schedule(
  'breeze-ga4-daily-seo-snapshot',
  '0 1 * * *',
  $$
  select net.http_post(
    url := 'https://nwvsriwsbpdhszmmousi.supabase.co/functions/v1/ga4-daily-snapshot',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'breeze_service_role_key'),
      'x-sync-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ga4_sync_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- To remove the schedule later:
-- select cron.unschedule('breeze-ga4-daily-seo-snapshot');
