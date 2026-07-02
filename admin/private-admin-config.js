window.BREEZE_PRIVATE_ADMIN = {
  enabled: true,
  provider: 'supabase',
  supabaseUrl: 'https://nwvsriwsbpdhszmmousi.supabase.co',
  supabaseAnonKey: 'sb_publishable_SHsFk0DcYRACTjzr_xZsAA_e-wX-Vt7',
  ownerEmail: 'gilmotors2015@gmail.com',
  reauthAfter: '2026-07-02T02:20:00Z'
};

(() => {
  const config = window.BREEZE_PRIVATE_ADMIN || {};
  const ownerEmail = String(config.ownerEmail || '').trim().toLowerCase();
  const reauthAfterMs = Date.parse(config.reauthAfter || '') || 0;
  const lockKey = 'breeze-admin-login-lock-v1';
  const maxAttempts = 5;
  const lockMs = 15 * 60 * 1000;

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function isOwnerEmail(value) {
    return !ownerEmail || normalizeEmail(value) === ownerEmail;
  }

  function sessionNeedsReauth(session) {
    if (!reauthAfterMs || !session) return false;
    const lastSignInMs = Date.parse(session.user?.last_sign_in_at || '');
    return !lastSignInMs || lastSignInMs < reauthAfterMs;
  }

  function readLock() {
    try {
      return JSON.parse(window.localStorage.getItem(lockKey) || '{}');
    } catch (_error) {
      return {};
    }
  }

  function writeLock(state) {
    try {
      window.localStorage.setItem(lockKey, JSON.stringify(state));
    } catch (_error) {}
  }

  function clearFailures() {
    try {
      window.localStorage.removeItem(lockKey);
    } catch (_error) {}
  }

  function remainingLockMs() {
    const state = readLock();
    const lockedUntil = Number(state.lockedUntil || 0);
    return Math.max(0, lockedUntil - Date.now());
  }

  function lockMessage() {
    const minutes = Math.max(1, Math.ceil(remainingLockMs() / 60000));
    return `Too many failed sign-in attempts. Please wait about ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`;
  }

  function recordFailure() {
    const state = readLock();
    const attempts = Number(state.attempts || 0) + 1;
    if (attempts >= maxAttempts) {
      writeLock({ attempts, lockedUntil: Date.now() + lockMs });
      return;
    }
    writeLock({ attempts, lockedUntil: 0 });
  }

  function weakPasswordMessage(password) {
    const value = String(password || '');
    if (value.length < 12) return 'Use at least 12 characters for the admin password.';
    if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
      return 'Use a stronger admin password with uppercase, lowercase, and a number.';
    }
    return '';
  }

  window.BREEZE_ADMIN_SECURITY = {
    clearFailures,
    isOwnerEmail,
    lockMessage,
    recordFailure,
    remainingLockMs,
    weakPasswordMessage
  };

  const supabaseGlobal = window.supabase;
  if (!supabaseGlobal?.createClient || supabaseGlobal.__breezeSecurityWrapped) return;

  const originalCreateClient = supabaseGlobal.createClient.bind(supabaseGlobal);
  supabaseGlobal.createClient = (...args) => {
    const client = originalCreateClient(...args);
    if (client.__breezeSecurityWrapped || !client.auth) return client;

    const auth = client.auth;
    const originalGetSession = auth.getSession?.bind(auth);
    const originalSignIn = auth.signInWithPassword?.bind(auth);
    const originalReset = auth.resetPasswordForEmail?.bind(auth);
    const originalUpdateUser = auth.updateUser?.bind(auth);

    if (originalGetSession) {
      auth.getSession = async (...sessionArgs) => {
        const result = await originalGetSession(...sessionArgs);
        const session = result?.data?.session;
        const sessionEmail = session?.user?.email;
        if (sessionEmail && !isOwnerEmail(sessionEmail)) {
          await auth.signOut?.({ scope: 'local' }).catch(() => {});
          return { ...result, data: { ...(result.data || {}), session: null } };
        }
        if (sessionNeedsReauth(session)) {
          await auth.signOut?.({ scope: 'local' }).catch(() => {});
          return { ...result, data: { ...(result.data || {}), session: null } };
        }
        return result;
      };
    }

    if (originalSignIn) {
      auth.signInWithPassword = async (credentials = {}) => {
        if (remainingLockMs() > 0) {
          return { data: null, error: { message: lockMessage() } };
        }

        const email = normalizeEmail(credentials.email);
        if (email && !isOwnerEmail(email)) {
          recordFailure();
          return { data: null, error: { message: 'This email is not approved for the Breeze Siding dashboard.' } };
        }

        const result = await originalSignIn(credentials);
        if (result?.error) {
          recordFailure();
          return result;
        }

        const signedInEmail = result?.data?.user?.email || email;
        if (!isOwnerEmail(signedInEmail)) {
          await auth.signOut?.({ scope: 'local' }).catch(() => {});
          recordFailure();
          return { data: null, error: { message: 'This account is not approved for the Breeze Siding dashboard.' } };
        }

        clearFailures();
        return result;
      };
    }

    if (originalReset) {
      auth.resetPasswordForEmail = async (email, options) => {
        if (!isOwnerEmail(email)) {
          return { data: {}, error: null };
        }
        return originalReset(email, options);
      };
    }

    if (originalUpdateUser) {
      auth.updateUser = async (attributes = {}, ...rest) => {
        if (attributes.password) {
          const message = weakPasswordMessage(attributes.password);
          if (message) return { data: null, error: { message } };
        }
        return originalUpdateUser(attributes, ...rest);
      };
    }

    client.__breezeSecurityWrapped = true;
    return client;
  };

  supabaseGlobal.__breezeSecurityWrapped = true;
})();