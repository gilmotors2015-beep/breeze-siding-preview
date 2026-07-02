(() => {
  const config = window.BREEZE_PRIVATE_ADMIN;
  const supabaseFactory = window.supabase;
  const form = document.querySelector('#admin-login-form');
  const emailInput = document.querySelector('#admin-login-email');
  const passwordInput = document.querySelector('#admin-login-password');
  const message = document.querySelector('#admin-login-message');
  const submitButton = form?.querySelector('button[type="submit"]');
  const searchParams = new URLSearchParams(window.location.search);

  function setMessage(text, type = '') {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle('is-error', type === 'error');
    message.classList.toggle('is-success', type === 'success');
  }

  function clearSavedAuthStorage() {
    const stores = [window.localStorage, window.sessionStorage].filter(Boolean);
    stores.forEach((store) => {
      try {
        Object.keys(store).forEach((key) => {
          const lower = key.toLowerCase();
          if ((lower.startsWith('sb-') && lower.includes('auth-token')) || lower.includes('supabase.auth.token')) {
            store.removeItem(key);
          }
        });
      } catch (_error) {}
    });
  }

  function nextUrl() {
    const next = searchParams.get('next');
    const destination = next && next.startsWith('/admin/') ? next : '/admin/';
    const separator = destination.includes('?') ? '&' : '?';
    return `${destination}${separator}v=auth-${Date.now()}`;
  }

  function setBusy(isBusy) {
    if (submitButton) submitButton.disabled = isBusy;
  }

  async function waitForSession(client, initialSession) {
    if (initialSession) return initialSession;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const { data } = await client.auth.getSession();
      if (data.session) return data.session;
      await new Promise((resolve) => window.setTimeout(resolve, 120));
    }
    return null;
  }

  if (!config?.enabled || config.provider !== 'supabase' || !supabaseFactory?.createClient) {
    setMessage('Secure login could not load. Refresh the page and try again.', 'error');
    return;
  }

  const client = supabaseFactory.createClient(config.supabaseUrl, config.supabaseAnonKey);
  const isFreshLogin = searchParams.get('fresh') === '1';
  if (emailInput) emailInput.value = '';

  if (isFreshLogin) {
    clearSavedAuthStorage();
    client.auth.signOut({ scope: 'local' }).catch(() => {});
    setMessage('Old saved login cleared. Sign in again to open the dashboard.');
  } else {
    client.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(nextUrl());
    });
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      setMessage('Enter your admin email and password.', 'error');
      return;
    }

    setBusy(true);
    setMessage('Signing in...');
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      setBusy(false);
      setMessage(`Sign-in failed: ${error.message}`, 'error');
      return;
    }

    setMessage('Login accepted. Opening dashboard...', 'success');
    const session = await waitForSession(client, data.session);
    setBusy(false);

    if (!session) {
      setMessage('Login was accepted, but the browser did not save the session. Please try again in a fresh incognito window.', 'error');
      return;
    }

    window.location.replace(nextUrl());
  });
})();
