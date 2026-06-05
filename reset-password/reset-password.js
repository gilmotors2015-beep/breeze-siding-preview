(() => {
  const config = window.BREEZE_PRIVATE_ADMIN;
  const supabaseFactory = window.supabase;
  const requestForm = document.querySelector('#reset-request-form');
  const updateForm = document.querySelector('#reset-update-form');
  const emailInput = document.querySelector('#reset-email');
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

  function showUpdateMode() {
    requestForm.hidden = true;
    updateForm.hidden = false;
    if (copy) copy.textContent = 'Enter a new password for the admin dashboard.';
  }

  function resetRedirectUrl() {
    return `${window.location.origin}/reset-password/`;
  }

  function passwordStrengthMessage(password) {
    if (password.length < 12) return 'Use at least 12 characters.';
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Use uppercase, lowercase, and a number.';
    }
    return '';
  }

  if (!config?.enabled || config.provider !== 'supabase' || !supabaseFactory?.createClient) {
    setMessage(requestMessage, 'Secure reset could not load. Refresh the page and try again.', 'error');
    return;
  }

  const client = supabaseFactory.createClient(config.supabaseUrl, config.supabaseAnonKey);
  if (emailInput && config.ownerEmail) emailInput.value = config.ownerEmail;

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  if (hash.get('type') === 'recovery' || hash.has('access_token') || hash.has('refresh_token')) {
    showUpdateMode();
  }

  client.auth.getSession().then(({ data }) => {
    if (data.session && (window.location.hash || updateForm?.hidden === false)) showUpdateMode();
  });

  requestForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput?.value.trim();
    if (!email) {
      setMessage(requestMessage, 'Enter the admin email address.', 'error');
      return;
    }

    setMessage(requestMessage, 'Sending reset email...');
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: resetRedirectUrl() });
    if (error) {
      setMessage(requestMessage, `Reset failed: ${error.message}`, 'error');
      return;
    }
    setMessage(requestMessage, 'Check your email for the secure reset link.', 'success');
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
    setMessage(updateMessage, 'Password updated. You can sign in now.', 'success');
    window.setTimeout(() => window.location.replace('/admin-login/'), 1600);
  });
})();
