(() => {
  function injectStyles() {
    if (document.querySelector('#admin-flow-polish-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-flow-polish-styles';
    style.textContent = `
      .focus-strip {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }
      .focus-card {
        display: grid;
        gap: 8px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fff;
        box-shadow: var(--shadow);
      }
      .focus-card strong {
        color: var(--ink);
        font-size: 1.05rem;
      }
      .focus-card span {
        color: var(--muted);
        font-weight: 800;
      }
      .focus-card button {
        width: 100%;
        justify-content: flex-start;
        min-height: 38px;
        padding: 0 10px;
        border: 1px solid #cbd8e8;
        border-radius: 6px;
        color: var(--blue-dark);
        background: #f4f8ff;
        font-weight: 900;
        cursor: pointer;
      }
      .focus-card button:hover { background: #e8f1ff; }
      .focus-empty {
        padding: 10px 0 0;
        color: var(--muted);
        font-weight: 800;
      }
      .dialog-action-panel {
        display: grid;
        gap: 10px;
        margin: 16px 0 0;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: #f8fbff;
      }
      .dialog-action-panel strong { color: var(--ink); }
      .dialog-action-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }
      .dialog-action-grid .button {
        min-height: 40px;
        padding: 0 10px;
      }
      .lead-card-button {
        min-height: 138px;
      }
      .lead-card-button .lead-name {
        font-size: 1rem;
      }
      .lead-card-button .lead-project {
        color: var(--ink);
        font-weight: 800;
      }
      .lead-card-button .lead-next {
        font-size: 0.84rem;
      }
      @media (max-width: 900px) {
        .focus-strip, .dialog-action-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.append(style);
  }

  function allLeads() {
    try { if (Array.isArray(leads)) return leads; } catch {}
    return window.BREEZE_PRIVATE_ADMIN_LEADS || [];
  }

  function active() {
    try { if (typeof activeLead !== 'undefined') return activeLead; } catch {}
    return null;
  }

  function parseDate(value) {
    if (!value || /proposal|stored|not/i.test(String(value))) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function daysSince(value) {
    const date = parseDate(value);
    if (!date) return null;
    return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  }

  function overdueEstimate(lead) {
    if (lead.stage !== 'estimate-sent') return false;
    const age = daysSince(lead.estimateDate || lead.createdAt);
    return age !== null && age >= 5;
  }

  function openLead(lead) {
    if (typeof showLead === 'function') showLead(lead);
  }

  function ensureFocusStrip() {
    const operations = document.querySelector('#operations-tab');
    const metrics = operations?.querySelector('.metrics');
    if (!operations || !metrics) return null;
    let strip = document.querySelector('#workflow-focus-strip');
    if (strip) return strip;
    strip = document.createElement('section');
    strip.id = 'workflow-focus-strip';
    strip.className = 'focus-strip';
    strip.setAttribute('aria-label', 'Today focus');
    metrics.insertAdjacentElement('afterend', strip);
    return strip;
  }

  function renderFocusList(title, detail, list) {
    const shown = list.slice(0, 3);
    return `
      <article class="focus-card">
        <strong>${title}</strong>
        <span>${detail}</span>
        ${shown.length ? shown.map((lead) => `<button type="button" data-focus-lead="${lead.id}">${lead.name}</button>`).join('') : '<div class="focus-empty">Nothing waiting here.</div>'}
      </article>
    `;
  }

  function renderFocusStrip() {
    const strip = ensureFocusStrip();
    if (!strip) return;
    const source = allLeads();
    const newLeads = source.filter((lead) => lead.stage === 'new');
    const scheduling = source.filter((lead) => lead.stage === 'qualified' || lead.stage === 'contacted');
    const followUps = source.filter(overdueEstimate);

    strip.innerHTML = [
      renderFocusList('Review new leads', 'Qualify real jobs and remove spam.', newLeads),
      renderFocusList('Book the next contact', 'Qualified/contacted leads need a call, text, or schedule email.', scheduling),
      renderFocusList('Estimate follow-ups', 'Proposals over five days old should get attention.', followUps)
    ].join('');

    strip.querySelectorAll('[data-focus-lead]').forEach((button) => {
      button.addEventListener('click', () => {
        const lead = source.find((item) => String(item.id) === String(button.dataset.focusLead));
        if (lead) openLead(lead);
      });
    });
  }

  function copy(text, button, label) {
    navigator.clipboard.writeText(text || '').then(() => {
      button.textContent = label;
    }).catch(() => {
      button.textContent = 'Copy failed';
    });
  }

  function cleanPhone(phone) {
    return String(phone || '').replace(/[^0-9+]/g, '');
  }

  function ensureDialogActions() {
    const details = document.querySelector('#lead-dialog .lead-details');
    if (!details) return null;
    let panel = document.querySelector('#dialog-action-panel');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'dialog-action-panel';
    panel.className = 'dialog-action-panel';
    panel.innerHTML = `
      <strong>Quick actions</strong>
      <div class="dialog-action-grid">
        <a class="button primary" id="dialog-call-action">Call</a>
        <a class="button secondary" id="dialog-email-action">Email</a>
        <button class="button secondary" id="dialog-copy-phone" type="button">Copy phone</button>
        <button class="button secondary" id="dialog-copy-email" type="button">Copy email</button>
      </div>
    `;
    details.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function renderDialogActions() {
    const lead = active();
    const panel = ensureDialogActions();
    if (!lead || !panel) return;

    const phone = cleanPhone(lead.phone);
    const email = String(lead.email || '').trim();
    const call = panel.querySelector('#dialog-call-action');
    const emailLink = panel.querySelector('#dialog-email-action');
    const copyPhone = panel.querySelector('#dialog-copy-phone');
    const copyEmail = panel.querySelector('#dialog-copy-email');

    if (call) {
      call.href = phone ? `tel:${phone}` : '#';
      call.textContent = phone ? 'Call' : 'No phone';
      call.classList.toggle('is-disabled', !phone);
    }
    if (emailLink) {
      emailLink.href = email && email !== 'Not set' ? `mailto:${email}` : '#';
      emailLink.textContent = email && email !== 'Not set' ? 'Email' : 'No email';
      emailLink.classList.toggle('is-disabled', !email || email === 'Not set');
    }
    if (copyPhone) {
      copyPhone.textContent = 'Copy phone';
      copyPhone.onclick = () => copy(lead.phone, copyPhone, 'Phone copied');
    }
    if (copyEmail) {
      copyEmail.textContent = 'Copy email';
      copyEmail.onclick = () => copy(lead.email, copyEmail, 'Email copied');
    }
  }

  function hookRenderAll() {
    if (typeof renderAll !== 'function') {
      window.setTimeout(hookRenderAll, 150);
      return;
    }
    if (renderAll.isFlowPolished) return;
    const original = renderAll;
    renderAll = function polishedRenderAll() {
      original();
      window.setTimeout(renderFocusStrip, 0);
    };
    renderAll.isFlowPolished = true;
  }

  function hookShowLead() {
    if (typeof showLead !== 'function') {
      window.setTimeout(hookShowLead, 150);
      return;
    }
    if (showLead.isFlowPolished) return;
    const original = showLead;
    showLead = function polishedShowLead(lead) {
      original(lead);
      window.setTimeout(renderDialogActions, 0);
    };
    showLead.isFlowPolished = true;
  }

  function renameMetrics() {
    const labels = [
      ['#metric-new', 'New leads'],
      ['#metric-qualified', 'Ready'],
      ['#metric-estimates', 'Estimates out'],
      ['#metric-spam', 'Spam']
    ];
    labels.forEach(([selector, label]) => {
      const card = document.querySelector(selector)?.closest('article');
      const span = card?.querySelector('span');
      if (span) span.textContent = label;
    });
  }

  function init() {
    injectStyles();
    hookRenderAll();
    hookShowLead();
    renameMetrics();
    renderFocusStrip();
    window.addEventListener('breeze-private-leads', () => window.setTimeout(() => { renameMetrics(); renderFocusStrip(); }, 0));
    document.addEventListener('click', (event) => {
      if (event.target.closest('.lead-card-button')) window.setTimeout(renderDialogActions, 0);
    });
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
