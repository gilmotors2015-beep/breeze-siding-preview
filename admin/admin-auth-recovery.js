(() => {
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

  function loginHref() {
    const next = `${window.location.pathname}${window.location.search}${window.location.hash}` || '/admin/';
    return `/admin-login/?next=${encodeURIComponent(next)}&fresh=1`;
  }

  function recoverIfNeeded() {
    const screen = document.querySelector('#auth-check-screen');
    if (!screen || !document.body.classList.contains('is-auth-checking')) return;

    const text = screen.querySelector('span');
    const message = text?.textContent || '';
    if (!/could not be confirmed|not signed in|could not load/i.test(message)) return;

    clearSavedAuthStorage();
    if (text) {
      text.textContent = 'The saved login expired or could not be confirmed. The old browser session has been cleared. Please sign in again.';
    }
    screen.querySelector('a')?.setAttribute('href', loginHref());
  }

  window.setTimeout(recoverIfNeeded, 5600);
  window.addEventListener('pageshow', () => window.setTimeout(recoverIfNeeded, 300));
})();
