# GA4 Daily Snapshot Setup

This connects the Breeze Siding admin performance dashboard to a reliable daily GA4 snapshot.

## What this tracks

- Washington active users, sessions, engaged sessions, engagement rate, and average session duration
- Organic Search sessions from Washington visitors
- Top Washington cities
- Top Washington landing pages
- Lead counts from the existing Supabase `leads` table
- Existing Search Console fields are preserved for a later Search Console sync

## 1. Run the table setup

In Supabase, open **SQL Editor** and run:

`admin/seo-snapshot-schema.sql`

This creates or updates the `seo_snapshots` table used by the admin dashboard.

## 2. Create a Google service account

1. Open Google Cloud Console.
2. Create or select a project for Breeze Siding analytics.
3. Enable **Google Analytics Data API**.
4. Go to **IAM & Admin > Service Accounts**.
5. Create a service account named `breeze-ga4-dashboard-reader`.
6. Create a JSON key for that service account.
7. Copy the service account email from the JSON file.

## 3. Add the service account to GA4

1. Open GA4.
2. Go to **Admin > Property Access Management**.
3. Add the service account email.
4. Give it **Viewer** access.

## 4. Add Supabase Edge Function secrets

In Supabase, go to **Edge Functions > Secrets** and add these values:

- `GA4_PROPERTY_ID`: the numeric GA4 property ID, not the `G-...` measurement ID.
- `GA4_CLIENT_EMAIL`: the service account email from the JSON key.
- `GA4_PRIVATE_KEY`: the private key from the JSON key, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`.
- `SUPABASE_SERVICE_ROLE_KEY`: the project service role key from Supabase API settings.
- `GA4_SYNC_SECRET`: a long private password used by the cron job.

Keep these private. Do not put the JSON key or service role key in GitHub.

## 5. Deploy the Edge Function

Deploy `supabase/functions/ga4-daily-snapshot/index.ts` as a Supabase Edge Function named:

`ga4-daily-snapshot`

You can test it from Supabase with a POST request and header:

`x-sync-secret: your GA4_SYNC_SECRET value`

## 6. Schedule the daily run

Schedule the function to run daily after GA4 has had time to settle. For the requested 6 PM Pacific rhythm, use:

- `0 1 * * *` during Pacific daylight time
- `0 2 * * *` during Pacific standard time

If Supabase offers a timezone-aware scheduler in your project UI, choose **daily at 6:00 PM America/Los_Angeles**.

The scheduled request should POST to:

`https://nwvsriwsbpdhszmmousi.supabase.co/functions/v1/ga4-daily-snapshot`

Use these headers:

- `Content-Type: application/json`
- `Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`
- `x-sync-secret: YOUR_GA4_SYNC_SECRET`

Use this body:

`{}`

## 7. Confirm it worked

1. Open Supabase table editor.
2. Check `seo_snapshots` for today's row with `source = ga4-auto`.
3. Open `/admin/` and go to **Website Performance**.
4. Confirm the dashboard shows the latest synced snapshot and local traffic cards.
