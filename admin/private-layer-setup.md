# Breeze Siding Private Admin Layer

This file defines the next step for turning the public workflow dashboard into a private customer system.

## Goal

Keep the public website on GitHub Pages, but move sensitive admin data into a protected database with login.

Sensitive data includes:

- Customer phone numbers
- Customer email addresses
- Job addresses
- Estimate numbers and prices
- Internal notes
- Schedule records
- Form submission history
- Lead stage changes

## Recommended Setup

Use a protected backend/database service with authentication. The current dashboard is ready to connect to a service such as Supabase.

Why this direction works well:

- The public website can stay on GitHub Pages.
- Private records are not stored in public JavaScript files.
- Login can be required before customer details load.
- The same database can later store leads, schedule slots, follow-up tasks, and review requests.
- Form submissions can be routed into a review queue before creating customer folders.

## Files Added For This Step

- `admin/private-data-schema.sql`  
  Database tables and security rules for private leads, events, appointments, and admin users.

- `admin/private-admin-config.example.js`  
  A safe example config file. The real config will use your database project URL and public anon key.

## How The Private Workflow Should Work

1. A website form submission arrives.
2. The lead is saved as `Needs review`.
3. You review it for spam or junk.
4. If real, mark it `Qualified`.
5. Qualified leads unlock customer-folder creation.
6. Estimate, schedule, follow-up, invoice, feedback, and review actions are tracked on the customer record.
7. Contact details stay private behind login.

## Important Security Rule

Do not put real customer phone numbers, emails, addresses, prices, or notes directly into `admin/admin.js` or any other public website file.

Those values belong in the private database only.

## Next Practical Step

Create the private database/auth project, then add the real connection values to a private config file. After that, the dashboard can be updated to load private customer records after login instead of using redacted public records.
