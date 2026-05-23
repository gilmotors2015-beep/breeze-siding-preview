(() => {
  function injectStyles() {
    if (document.getElementById('seo-visual-cleanup-styles')) return;
    const style = document.createElement('style');
    style.id = 'seo-visual-cleanup-styles';
    style.textContent = `
      #performance-snapshot-form { display: none !important; }
      .seo-snapshot-visual-note { display: grid; gap: 10px; padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(135deg, #f8fbff, #ffffff); }
      .seo-snapshot-visual-note p { margin: 0; color: var(--muted); font-weight: 800; }
      .seo-snapshot-visual-note strong { color: var(--ink); font-size: 1.05rem; }
      .seo-trend-value { display: none !important; }
      .seo-trend-top { justify-content: start !important; }
      .seo-trend-card-inner { gap: 14px; }
    `;
    document.head.append(style);
  }

  function replaceManualSnapshot() {
    injectStyles();
    const form = document.querySelector('#performance-snapshot-form');
    if (!form) return;
    if (document.querySelector('#seo-snapshot-visual-note')) return;

    const note = document.createElement('div');
    note.id = 'seo-snapshot-visual-note';
    note.className = 'seo-snapshot-visual-note';
    note.innerHTML = '<strong>Numbers are now tracked automatically.</strong><p>The snapshot data below is shown as graph trends instead of manual input fields. Daily syncs will make the charts more useful over time.</p>';
    form.insertAdjacentElement('beforebegin', note);
  }

  function scheduleCleanup() {
    window.setTimeout(replaceManualSnapshot, 400);
    window.setTimeout(replaceManualSnapshot, 1200);
    window.setTimeout(replaceManualSnapshot, 2600);
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', scheduleCleanup, { once: true });
  else scheduleCleanup();
  window.addEventListener('breeze-private-leads', scheduleCleanup);
})();