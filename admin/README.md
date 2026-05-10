# Admin Dashboard

This is the first foundation step for the Breeze Siding customer workflow system.

Current status:

- `/admin/` is not linked from the public website navigation.
- It has `noindex, nofollow` so search engines should not index it.
- It currently shows sample demo records only.
- It is ready to be connected to a secure database after Supabase is configured.
- The dashboard now includes the new customer folder standard for future leads.

Before adding real customer data:

- Add Supabase Auth.
- Enable strict Row Level Security policies.
- Require an admin login before reading leads, appointments, or notes.
- Keep service-role keys out of public website files.
- Keep private customer documents in OneDrive, not in this public repository.

Planned modules:

- Lead inbox
- Pipeline board
- Appointment slots
- Customer folder status
- Follow-up history
- Feedback and review request tracking
- Website performance and keyword tracking

## Customer Folder Standard

Future customer folders should use this structure:

```text
Customer Name
  01 Intake
  02 Photos
  03 Measurements
  04 Estimate
  05 Contract
  06 Job Docs
  07 Invoice
  08 Follow Up
  _Archive
```

Starter pack files should be copied only when a new customer folder is created:

- Estimate workbook
- Invoice workbook
- Takeoff workbook
- Contract PDF
- Commercial siding bid proposal PDF
- Receipt document
- Project expenses workbook

Email templates should stay in the master template folder and be linked from the dashboard workflow instead of copied into every customer folder.

A lead record should eventually track:

- customer folder path
- folder status
- folder created date
- estimate document path
- invoice document path
- next workflow step

Static GitHub Pages cannot create OneDrive folders by itself. That requires a local helper, Power Automate, Make, or a secure backend connection.
