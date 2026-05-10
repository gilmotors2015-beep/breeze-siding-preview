# Breeze Siding CRM Foundation

This folder holds the database blueprint for the future Breeze Siding lead machine and website performance dashboard.

The live website currently still uses email form delivery. The admin dashboard at `/admin/` is a demo-safe shell with sample records only. It does not store real customer data yet.

## What this foundation supports

- New estimate leads from the homepage form
- Feedback form responses
- Private 1-4 star ratings from the rate-us page
- Public 5-star review handoff to Google
- Schedule requests and appointment slots
- Lead notes, follow-up history, and status tracking
- A private admin board for moving customers through the pipeline
- Google Analytics-style website markers
- Search Console-style indexing and keyword markers
- Top keyword targets with page-level action plans

## Recommended setup order

1. Create a Supabase project for Breeze Siding.
2. Open Supabase SQL Editor and run `schema.sql`.
3. Create one admin user in Supabase Auth.
4. Add authenticated admin read/update policies for the dashboard.
5. Add the public Supabase URL and anon key to a new admin config file.
6. Connect the homepage, feedback, rate-us, and schedule forms to insert records.
7. Keep email notifications active until the database workflow is fully tested.
8. Connect or import Search Console and Analytics data after the dashboard is secured.

## Security notes

Do not place a Supabase service-role key in the website files. The public site can safely use an anon key only when Row Level Security policies are enabled.

The public forms should be allowed to insert new leads, but should not be allowed to read, edit, or delete existing customer records.

The admin dashboard should require login before real customer data is visible.

Google Analytics and Search Console API keys or service credentials should not be placed in public website files. Use a backend function, scheduled import, or manual export/import workflow.

## Suggested pipeline stages

- New
- Contacted
- Estimate sent
- Scheduled
- Won
- Lost
- Review follow-up

## Suggested keyword targets

- siding replacement seattle
- siding contractor tacoma
- james hardie siding installer

These can change after real Search Console data shows which pages and queries are closest to page-one movement.

## Suggested automations later

- New lead notification by email or phone notification service
- Follow-up reminder after estimate is sent
- Feedback request for lost or ghosted estimates
- Review request after completed projects
- Re-engagement reminders for older leads
- Weekly Search Console keyword snapshot
- Monthly performance review with next-page SEO priorities
