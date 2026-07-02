(() => {
  const config = window.BREEZE_PRIVATE_ADMIN;
  const supabaseFactory = window.supabase;
  const requestForm = document.querySelector('#reset-request-form');
  const updateForm = document.querySelector('#reset-update-form');
  const passwordInput = document.querySelector('#reset-password');
  const confirmInput = document.querySelector('#reset-password-confirm');
  const requestMessage = document.querySelector('#reset-request-message');
  const updateMessage = document.querySelector('#reset-update-message');
  const copy = document.querySelector('#reset-copy');

  function setMessage(target, text, type = '') {
    if (!target) return;
    target.textContent = text;
    target.classList.toggle('is-error', type === 'error');
    target.classList.toggle('is-success', type === 'success');
  }

  function loginUrl() {
    return `/admin-login/?next=${encodeURIComponent('/reset-password/')}`;
  }

  function showLoginRequired() {
    requestForm.hidden = false;
    updateForm.hidden = true;
    if (copy) copy.textContent = 'Sign in with the admin account before changing the password.';
    setMessage(requestMessage, 'Password changes require an active admin login.', 'error');
  }

  function showUpdateMode() {
    requestForm.hidden = true;
    updateForm.hidden = false;
    if (copy) copy.textContent = 'Enter a new password for the admin dashboard.';
  }

  function passwordStrengthMessage(password) {
    if (password.length < 12) return 'Use at least 12 characters.';
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Use uppercase, lowercase, and a number.';
    }
    return '';
  }

  if (!config?.enabled || config.provider !== 'supabase' || !supabaseFactory?.createClient) {
    showLoginRequired();
    setMessage(requestMessage, 'Secure password change could not load. Refresh the page and try again.', 'error');
    return;
  }

  const client = supabaseFactory.createClient(config.supabaseUrl, config.supabaseAnonKey);

  client.auth.getSession().then(({ data }) => {
    if (data.session) {
      showUpdateMode();
      return;
    }
    showLoginRequired();
  }).catch(() => {
    showLoginRequired();
  });

  requestForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    window.location.assign(loginUrl());
  });

  updateForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = passwordInput?.value || '';
    const confirm = confirmInput?.value || '';
    const strengthMessage = passwordStrengthMessage(password);
    if (strengthMessage) {
      setMessage(updateMessage, strengthMessage, 'error');
      return;
    }
    if (password !== confirm) {
      setMessage(updateMessage, 'Passwords do not match.', 'error');
      return;
    }

    setMessage(updateMessage, 'Updating password...');
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      setMessage(updateMessage, `Update failed: ${error.message}`, 'error');
      return;
    }
    setMessage(updateMessage, 'Password updated. Sign in again with the new password.', 'success');
    await client.auth.signOut({ scope: 'local' }).catch(() => {});
    window.setTimeout(() => window.location.replace('/admin-login/?fresh=1'), 1600);
  });
})();