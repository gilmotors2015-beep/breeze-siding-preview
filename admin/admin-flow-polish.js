(() => {
  const focusPanelId = 'flow-focus-panel';
  const quickActionsId = 'flow-quick-actions';
  const styleId = 'flow-polish-styles';

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .flow-focus-panel { overflow: visible; }
      .flow-focus-grid { display: grid; grid-template-columns: repeat(4, minmax(180px, 1fr)); gap: 12px; padding: 16px; }
      .flow-focus-card { display: grid; gap: 10px; align-content: start; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #f8fbff; }
      .flow-focus-card strong { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .flow-count { min-width: 30px; min-height: 30px; display: inline-grid; place-items: center; border-radius: 999px; color: var(--white); background: var(--blue-dark); font-size: 0.82rem; font-weight: 900; }
      .flow-focus-note { margin: 0; color: var(--muted); font-size: 0.9rem; font-weight: 800; }
      .flow-focus-list { display: grid; gap: 8px; }
      .flow-focus-item { width: 100%; display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; padding: 10px; border: 1px solid var(--line); border-radius: 7px; color: var(--ink); background: var(--white); text-align: left; cursor: pointer; }
      .flow-focus-item:hover { border-color: #96b8e8; box-shadow: 0 8px 18px rgba(20, 32, 51, 0.08); }
      .flow-focus-item span { display: block; color: var(--muted); font-size: 0.84rem; font-weight: 700; }
      .flow-open-label { color: var(--blue-dark); font-weight: 900; }
      .flow-empty { margin: 0; padding: 10px; border: 1px dashed #b8c6d8; border-radius: 7px; color: var(--muted); background: rgba(255, 255, 255, 0.7); font-weight: 800; }
      .flow-card-alert { border-color: #f0cf9a; background: #fff8ed; }
      .flow-quick-actions { display: grid; gap: 12px; margin-top: 18px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #f8fbff; }
      .flow-quick-actions h3 { margin: 0; line-height: 1.15; }
      .flow-action-grid { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 8px; }
      .flow-action-grid .button { min-height: 42px; width: 100%; padding: 0 12px; }
      .flow-action-message { margin: 0; color: var(--muted); font-weight: 800; }
      a[aria-disabled='true'] { opacity: 0.55; pointer-events: auto; }
      @media (max-width: 1020px) { .flow-focus-grid { grid-template-columns: repeat(2, minmax(180px, 1fr)); } }
      @media (max-width: 640px) { .flow-focus-grid, .flow-action-grid { grid-template-columns: 1fr; } }
    `;
    document.head.append(style);
  }

  function getLeads() {
    try { return Array.isArray(leads) ? leads : []; } catch (_error) { return []; }
  }

  function getActiveLead() {
    try { return activeLead || null; } catch (_error) { return null; }
  }

  function cleanValue(value) {
    if (!value || value === 'Not set' || value === 'Stored privately') return '';
    return String(value).trim();
  }

  function digitsOnly(value) { return cleanValue(value).replace(/\D/g, ''); }
  function canCall(value) { return digitsOnly(value).length >= 10; }
  function canEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue(value)); }

  function leadDate(lead) {
    const candidates = [lead.estimateDate, lead.createdAt, lead.dueDate].filter(Boolean);
    for (const candidate of candidates) {
      const date = new Date(candidate);
      if (!Number.isNaN(date.getTime())) return date;
    }
    return null;
  }

  function daysSince(lead) {
    const date = leadDate(lead);
    if (!date) return null;
    return Math.floor((Date.now() - date.getTime()) / 86400000);
  }

  function sortNewestFirst(a, b) {
    const aDate = leadDate(a)?.getTime() || 0;
    const bDate = leadDate(b)?.getTime() || 0;
    return bDate - aDate;
  }

  function openLead(lead) {
    try { if (typeof showLead === 'function') showLead(lead); } catch (_error) {}
  }

  function ensureFocusPanel() {
    injectStyles();
    let panel = document.getElementById(focusPanelId);
    if (panel) return panel;
    const metrics = document.querySelector('#operations-tab .metrics');
    if (!metrics) return null;
    panel = document.createElement('section');
    panel.id = focusPanelId;
    panel.className = 'panel flow-focus-panel';
    panel.innerHTML = `
      <div class="panel-heading">
        <div><p class="eyebrow">Working queue</p><h2>Today's focus</h2></div>
        <span class="mode-pill">Lead flow</span>
      </div>
      <div class="flow-focus-grid" id="flow-focus-grid"></div>
    `;
    metrics.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function renderFocusCard(bucket) {
    const alertClass = bucket.alert ? ' flow-card-alert' : '';
    const items = bucket.items.slice(0, 3);
    const list = items.length ? items.map((lead) => {
      const meta = [lead.city, lead.project].filter(Boolean).join(' - ');
      return `
        <button class="flow-focus-item" type="button" data-lead-id="${lead.id}">
          <span><b>${lead.name || 'Unnamed lead'}</b><span>${meta || bucket.empty}</span></span>
          <span class="flow-open-label">Open</span>
        </button>
      `;
    }).join('') : `<p class="flow-empty">${bucket.empty}</p>`;
    return `
      <article class="flow-focus-card${alertClass}" data-flow-bucket="${bucket.id}">
        <strong>${bucket.title}<span class="flow-count">${bucket.items.length}</span></strong>
        <p class="flow-focus-note">${bucket.note}</p>
        <div class="flow-focus-list">${list}</div>
      </article>
    `;
  }

  function renderFocusPanel() {
    const panel = ensureFocusPanel();
    const grid = panel?.querySelector('#flow-focus-grid');
    if (!grid) return;
    const all = getLeads();
    const fresh = all.filter((lead) => lead.stage === 'new').sort(sortNewestFirst);
    const schedule = all.filter((lead) => ['qualified', 'contacted'].includes(lead.stage)).sort(sortNewestFirst);
    const estimates = all.filter((lead) => lead.stage === 'estimate-sent').sort((a, b) => (daysSince(b) || 0) - (daysSince(a) || 0));
    const active = all.filter((lead) => ['scheduled', 'won'].includes(lead.stage)).sort(sortNewestFirst);
    const staleEstimateCount = estimates.filter((lead) => (daysSince(lead) || 0) >= 5).length;
    const buckets = [
      { id: 'fresh', title: 'New leads', note: 'Review and qualify first.', empty: 'No new leads waiting.', items: fresh },
      { id: 'schedule', title: 'Ready to schedule', note: 'Call, email, or send schedule link.', empty: 'No qualified leads waiting.', items: schedule },
      { id: 'followup', title: 'Estimate follow-up', note: staleEstimateCount ? `${staleEstimateCount} estimate${staleEstimateCount === 1 ? '' : 's'} may need a follow-up.` : 'Watch sent estimates.', empty: 'No sent estimates waiting.', items: estimates, alert: staleEstimateCount > 0 },
      { id: 'active', title: 'Active work', note: 'Keep materials, scheduling, and closeout moving.', empty: 'No active jobs on the board.', items: active }
    ];
    grid.innerHTML = buckets.map(renderFocusCard).join('');
    grid.querySelectorAll('[data-lead-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const lead = all.find((item) => String(item.id) === button.dataset.leadId);
        if (lead) openLead(lead);
      });
    });
  }

  function copyText(value, messageTarget, label) {
    const text = cleanValue(value);
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => { if (messageTarget) messageTarget.textContent = `${label} copied.`; })
      .catch(() => { if (messageTarget) messageTarget.textContent = `Could not copy ${label.toLowerCase()}.`; });
  }

  function ensureQuickActions() {
    injectStyles();
    let panel = document.getElementById(quickActionsId);
    if (panel) return panel;
    const details = document.querySelector('#lead-dialog .lead-details');
    if (!details) return null;
    panel = document.createElement('section');
    panel.id = quickActionsId;
    panel.className = 'flow-quick-actions';
    panel.innerHTML = `
      <h3>Quick actions</h3>
      <div class="flow-action-grid" id="flow-action-grid"></div>
      <p class="flow-action-message" id="flow-action-message">Open the lead, then use the fastest next contact step.</p>
    `;
    details.insertAdjacentElement('beforebegin', panel);
    return panel;
  }

  function renderQuickActions() {
    const panel = ensureQuickActions();
    const grid = panel?.querySelector('#flow-action-grid');
    const message = panel?.querySelector('#flow-action-message');
    const lead = getActiveLead();
    if (!grid || !lead) return;
    const phone = cleanValue(lead.phone);
    const email = cleanValue(lead.email);
    const telHref = canCall(phone) ? `tel:${digitsOnly(phone)}` : '';
    const mailHref = canEmail(email) ? `mailto:${email}?subject=${encodeURIComponent(`Breeze Siding - ${lead.name || 'Project follow-up'}`)}` : '';
    grid.innerHTML = `
      <a class="button primary" href="${telHref || '#'}" ${telHref ? '' : 'aria-disabled="true"'}>Call</a>
      <a class="button secondary" href="${mailHref || '#'}" ${mailHref ? '' : 'aria-disabled="true"'}>Email</a>
      <button class="button secondary" type="button" data-copy-phone ${phone ? '' : 'disabled'}>Copy phone</button>
      <button class="button secondary" type="button" data-copy-email ${email ? '' : 'disabled'}>Copy email</button>
    `;
    grid.querySelector('[data-copy-phone]')?.addEventListener('click', () => copyText(phone, message, 'Phone'));
    grid.querySelector('[data-copy-email]')?.addEventListener('click', () => copyText(email, message, 'Email'));
    grid.querySelectorAll('a[aria-disabled="true"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (message) message.textContent = 'That contact option is not available for this lead yet.';
      });
    });
  }

  function hookDashboardRender() {
    try {
      if (typeof renderAll === 'function' && !renderAll.__flowPolished) {
        const originalRenderAll = renderAll;
        renderAll = function flowPolishedRenderAll(...args) {
          const result = originalRenderAll.apply(this, args);
          window.setTimeout(renderFocusPanel, 0);
          return result;
        };
        renderAll.__flowPolished = true;
      }
    } catch (_error) {}
    try {
      if (typeof showLead === 'function' && !showLead.__flowPolished) {
        const originalShowLead = showLead;
        showLead = function flowPolishedShowLead(...args) {
          const result = originalShowLead.apply(this, args);
          window.setTimeout(renderQuickActions, 0);
          return result;
        };
        showLead.__flowPolished = true;
      }
    } catch (_error) {}
  }

  function boot() {
    hookDashboardRender();
    renderFocusPanel();
    renderQuickActions();
  }

  window.addEventListener('breeze-private-leads', () => window.setTimeout(boot, 0));
  window.addEventListener('breeze-private-logout', () => window.setTimeout(boot, 0));
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else window.setTimeout(boot, 0);
})();
