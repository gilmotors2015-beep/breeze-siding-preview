# Admin Dashboard

This is the first foundation step for the Breeze Siding customer workflow system.

Current status:

- `/admin/` is not linked from the public website navigation.
- It has `noindex, nofollow` so search engines should not index it.
- It currently shows sample demo records only.
- It is ready to be connected to a secure database after Supabase is configured.

Before adding real customer data:

- Add Supabase Auth.
- Enable strict Row Level Security policies.
- Require an admin login before reading leads, appointments, or notes.
- Keep service-role keys out of public website files.

Planned modules:

- Lead inbox
- Pipeline board
- Appointment slots
- Follow-up history
- Feedback and review request tracking
