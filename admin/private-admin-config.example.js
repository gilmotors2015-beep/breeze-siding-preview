// Copy this file to private-admin-config.js after creating the secure backend.
// Do not place service-role keys or private secrets in any browser file.
// The anon key is acceptable only when row-level security policies are enabled.

window.BREEZE_PRIVATE_ADMIN = {
  enabled: false,
  provider: 'supabase',
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR-PUBLIC-ANON-KEY',
  ownerEmail: 'service@breezesiding.com'
};
