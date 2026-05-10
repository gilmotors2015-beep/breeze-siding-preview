# Breeze Siding CRM Foundation

This folder holds the database blueprint for the future Breeze Siding lead machine.

The live website currently still uses email form delivery. The admin dashboard at `/admin/` is a demo-safe shell with sample records only. It does not store real customer data yet.

## What this foundation supports

- New estimate leads from the homepage form
- Feedback form responses
- Private 1-4 star ratings from the rate-us page
- Public 5-star review handoff to Google
- Schedule requests and appointment slots
- Lead notes, follow-up history, and status tracking
- A private admin board for moving customers through the pipeline

## Recommended setup order

1. Create a Supabase project for Breeze Siding.
2. Open Supabase SQL Editor and run `schema.sql`.
3. Create one admin user in Supabase Auth.
4. Add authenticated admin read/update policies for the dashboard.
5. Add the public Supabase URL and anon key to a new admin config file.
6. Connect the homepage, feedback, rate-us, and schedule forms to insert records.
7. Keep email notifications active until the database workflow is fully tested.

## Security notes

Do not place a Supabase service-role key in the website files. The public site can safely use an anon key only when Row Level Security policies are enabled.

The public forms should be allowed to insert new leads, but should not be allowed to read, edit, or delete existing customer records.

The admin dashboard should require login before real customer data is visible.

## Suggested pipeline stages

- New
- Contacted
- Estimate sent
- Scheduled
- Won
- Lost
- Review follow-up

## Suggested automations later

- New lead notification by email or phone notification service
- Follow-up reminder after estimate is sent
- Feedback request for lost or ghosted estimates
- Review request after completed projects
- Re-engagement reminders for older leads
