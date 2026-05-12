(() => {
  const config = window.BREEZE_PRIVATE_ADMIN;
  const supabaseFactory = window.supabase;
  const form = document.querySelector('#admin-login-form');
  const emailInput = document.querySelector('#admin-login-email');
  const passwordInput = document.querySelector('#admin-login-password');
  const message = document.querySelector('#admin-login-message');
  const submitButton = form?.querySelector('button[type="submit"]');

  function setMessage(text, type = '') {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle('is-error', type === 'error');
    message.classList.toggle('is-success', type === 'success');
  }

  function nextUrl() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next && next.startsWith('/admin/')) return next;
    return '/admin/';
  }

  function setBusy(isBusy) {
    if (submitButton) submitButton.disabled = isBusy;
  }

  if (!config?.enabled || config.provider !== 'supabase' || !supabaseFactory?.createClient) {
    setMessage('Secure login could not load. Refresh the page and try again.', 'error');
    return;
  }

  const client = supabaseFactory.createClient(config.supabaseUrl, config.supabaseAnonKey);
  if (emailInput && config.ownerEmail) emailInput.value = config.ownerEmail;

  client.auth.getSession().then(({ data }) => {
    if (data.session) window.location.replace(nextUrl());
  });

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
    const { error } = await client.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (error) {
      setMessage(`Sign-in failed: ${error.message}`, 'error');
      return;
    }

    setMessage('Login successful. Opening dashboard...', 'success');
    window.location.replace(nextUrl());
  });
})();
