(() => {
  const styleId = 'schedule-action-polish-styles';
  const panelId = 'visible-schedule-action-panel';
  const scheduleTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\schedule - website style.oft';
  const scheduleCommand = `Start-Process -FilePath '${scheduleTemplatePath.replace(/'/g, "''")}'`;
  const addressQuestion = 'Before we confirm the appointment, what is the exact project address where you would like us to meet for the estimate?';
  let attempts = 0;

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .visible-schedule-action-panel {
        display: grid;
        gap: 12px;
        margin: 16px 0 0;
        padding: 14px;
        border: 1px solid #b7d2f5;
        border-radius: 8px;
        background: #f3f8ff;
      }
      .visible-schedule-action-panel[hidden] {
        display: none !important;
      }
      .visible-schedule-action-panel h3 {
        margin: 0;
        color: var(--ink);
        line-height: 1.15;
      }
      .visible-schedule-action-panel p {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
        line-height: 1.45;
      }
      .visible-schedule-command {
        display: block;
        padding: 10px 12px;
        border: 1px solid #c8d8ee;
        border-radius: 7px;
        color: #142033;
        background: #ffffff;
        font-size: 0.84rem;
        font-weight: 800;
        white-space: normal;
        word-break: break-word;
      }
      .visible-schedule-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .visible-schedule-message {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
      }
      #dialog-next-step-actions {
        display: none !important;
      }
    `;
    document.head.append(style);
  }

  function getStageSlug() {
    const label = document.querySelector('#dialog-stage')?.textContent?.trim().toLowerCase() || '';
    const map = {
      lead: 'new',
      qualified: 'qualified',
      contacted: 'contacted',
      scheduled: 'scheduled',
      'estimate sent': 'estimate-sent',
      won: 'won',
      lost: 'lost',
      spam: 'spam',
      'review follow-up': 'review'
    };
    return map[label] || 'new';
  }

  function getLeads() {
    try {
      if (Array.isArray(leads)) return leads;
    } catch (_error) {}
    return window.BREEZE_PRIVATE_ADMIN_LEADS || [];
  }

  function cleanValue(value) {
    if (!value || value === 'Not set' || value === 'Stored privately' || value === 'Stored in private customer record') return '';
    return String(value).trim();
  }

  function renderCardAddresses() {
    const sourceLeads = getLeads();
    if (!sourceLeads.length) return;
    document.querySelectorAll('.lead-card').forEach((card) => {
      const name = card.querySelector('.lead-name')?.textContent?.trim();
      const lead = sourceLeads.find((item) => item.name === name);
      const meta = card.querySelector('.lead-meta');
      if (!lead || !meta) return;
      const address = cleanValue(lead.address) || cleanValue(lead.city);
      const phone = cleanValue(lead.phone);
      meta.textContent = [address, phone].filter(Boolean).join(' - ') || 'Contact details pending';
    });
  }

  function ensurePanel() {
    let panel = document.getElementById(panelId);
    if (panel) return panel;

    const quickActions = document.querySelector('#flow-quick-actions');
    const stageGuidance = document.querySelector('#dialog-stage-guidance');
    const anchor = quickActions || stageGuidance;
    if (!anchor) return null;

    panel = document.createElement('section');
    panel.id = panelId;
    panel.className = 'visible-schedule-action-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <h3>Schedule appointment email</h3>
      <p id="visible-schedule-text">Open the schedule .oft email template, then confirm the exact job address before the appointment is set.</p>
      <code class="visible-schedule-command" id="visible-schedule-command"></code>
      <div class="visible-schedule-actions">
        <button class="button primary" type="button" id="copy-visible-schedule-command">Copy .oft PowerShell command</button>
        <button class="button secondary" type="button" id="copy-visible-address-question">Copy address question</button>
        <p class="visible-schedule-message" id="visible-schedule-message" aria-live="polite"></p>
      </div>
    `;
    anchor.insertAdjacentElement('afterend', panel);

    panel.querySelector('#copy-visible-schedule-command')?.addEventListener('click', () => copyText(scheduleCommand, 'Schedule command copied.'));
    panel.querySelector('#copy-visible-address-question')?.addEventListener('click', () => copyText(addressQuestion, 'Address question copied.'));
    return panel;
  }

  async function copyText(text, successMessage) {
    const message = document.querySelector('#visible-schedule-message');
    try {
      await navigator.clipboard.writeText(text);
      if (message) message.textContent = successMessage;
    } catch (_error) {
      if (message) message.textContent = 'Copy failed.';
    }
  }

  function renderPanel() {
    injectStyles();
    renderCardAddresses();
    const panel = ensurePanel();
    if (!panel) return;
    const stage = getStageSlug();
    const shouldShow = stage === 'qualified' || stage === 'contacted';
    panel.hidden = !shouldShow;
    const command = panel.querySelector('#visible-schedule-command');
    const text = panel.querySelector('#visible-schedule-text');
    const message = panel.querySelector('#visible-schedule-message');
    if (command) command.textContent = scheduleCommand;
    if (text) {
      text.textContent = stage === 'qualified'
        ? 'This lead is qualified. Open the schedule email template, then confirm the exact job address before booking the appointment.'
        : 'This customer has been contacted. Use this if the appointment still needs to be booked or confirmed.';
    }
    if (message) message.textContent = '';
  }

  function hookShowLead() {
    let ready = false;
    try {
      if (typeof showLead === 'function') {
        ready = true;
        if (!showLead.__scheduleActionPolished) {
          const originalShowLead = showLead;
          showLead = function scheduleActionPolishedShowLead(...args) {
            const result = originalShowLead.apply(this, args);
            window.setTimeout(renderPanel, 80);
            return result;
          };
          showLead.__scheduleActionPolished = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function hookRenderAll() {
    try {
      if (typeof renderAll === 'function' && !renderAll.__cardAddressPolished) {
        const originalRenderAll = renderAll;
        renderAll = function cardAddressPolishedRenderAll(...args) {
          const result = originalRenderAll.apply(this, args);
          window.setTimeout(renderCardAddresses, 0);
          return result;
        };
        renderAll.__cardAddressPolished = true;
      }
    } catch (_error) {}
  }

  function boot() {
    const ready = hookShowLead();
    hookRenderAll();
    renderPanel();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.lead-card-button, #mark-qualified-button, #move-next-button, #mark-spam-button, #save-lead-location-button')) {
      window.setTimeout(renderPanel, 180);
      window.setTimeout(renderCardAddresses, 250);
    }
  });
  window.addEventListener('breeze-private-leads', () => {
    window.setTimeout(renderPanel, 100);
    window.setTimeout(renderCardAddresses, 120);
  });
  window.addEventListener('load', () => window.setTimeout(boot, 0));
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else window.setTimeout(boot, 0);
})();
