(() => {
  const styleId = 'estimate-sent-polish-styles';
  const panelId = 'estimate-sent-follow-up-panel';
  const followUpTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\Follow up - website style.oft';
  const followUpCommand = `Start-Process -FilePath '${followUpTemplatePath.replace(/'/g, "''")}'`;
  let attempts = 0;

  function todayDateString() {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  }

  function hasStoredEstimateDate(lead) {
    const value = String(lead?.estimateDate || '').trim();
    if (!value || /proposal|stored|not/i.test(value)) return false;
    return !Number.isNaN(new Date(value).getTime());
  }

  function currentStage() {
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

  function bridge() {
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE || null;
  }

  function getActiveLead() {
    try {
      if (typeof activeLead !== 'undefined' && activeLead) return activeLead;
    } catch (_error) {}

    const name = document.querySelector('#dialog-name')?.textContent?.trim();
    if (!name) return null;

    try {
      if (Array.isArray(leads)) return leads.find((lead) => lead.name === name) || null;
    } catch (_error) {}

    return (window.BREEZE_PRIVATE_ADMIN_LEADS || []).find((lead) => lead.name === name) || null;
  }

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .estimate-sent-follow-up-panel {
        display: grid;
        gap: 12px;
        margin: 16px 0 0;
        padding: 14px;
        border: 1px solid #f0cf9a;
        border-radius: 8px;
        background: #fff8ed;
      }
      .estimate-sent-follow-up-panel[hidden] {
        display: none !important;
      }
      .estimate-sent-follow-up-panel h3 {
        margin: 0;
        color: var(--ink);
        line-height: 1.15;
      }
      .estimate-sent-follow-up-panel p,
      .estimate-sent-message {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
        line-height: 1.45;
      }
      .estimate-sent-command {
        display: block;
        padding: 10px 12px;
        border: 1px solid #f0d7b5;
        border-radius: 7px;
        color: #142033;
        background: #ffffff;
        font-size: 0.84rem;
        font-weight: 800;
        white-space: normal;
        word-break: break-word;
      }
      .estimate-sent-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
    `;
    document.head.append(style);
  }

  async function saveEstimateDate(lead, estimateDate) {
    const client = bridge()?.client;
    if (!client || !lead?.id || String(lead.id).startsWith('manual-')) return;

    const { error } = await client
      .from('leads')
      .update({
        estimate_date: estimateDate,
        next_step: 'Follow up on the proposal. Light check-in at 2 days; full follow-up at 5 days.'
      })
      .eq('id', lead.id);

    if (!error) await bridge()?.loadLeads?.();
  }

  function ensurePanel() {
    injectStyles();
    let panel = document.getElementById(panelId);
    if (panel) return panel;

    const quickActions = document.querySelector('#flow-quick-actions');
    const stageGuidance = document.querySelector('#dialog-stage-guidance');
    const anchor = quickActions || stageGuidance;
    if (!anchor) return null;

    panel = document.createElement('section');
    panel.id = panelId;
    panel.className = 'estimate-sent-follow-up-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <h3>Follow-up email (.oft)</h3>
      <p>Use this after the estimate has been sent and the customer has not responded yet. Open the follow-up email template, adjust any wording, and log the response in working notes.</p>
      <code class="estimate-sent-command" id="estimate-sent-follow-up-command"></code>
      <div class="estimate-sent-actions">
        <button class="button primary" type="button" id="copy-estimate-follow-up-command">Copy follow-up .oft command</button>
        <p class="estimate-sent-message" id="estimate-sent-message" aria-live="polite"></p>
      </div>
    `;
    anchor.insertAdjacentElement('afterend', panel);

    panel.querySelector('#copy-estimate-follow-up-command')?.addEventListener('click', async () => {
      const message = panel.querySelector('#estimate-sent-message');
      try {
        await navigator.clipboard.writeText(followUpCommand);
        if (message) message.textContent = 'Follow-up command copied.';
      } catch (_error) {
        if (message) message.textContent = 'Copy failed.';
      }
    });
    return panel;
  }

  function setEstimateSentVisibility() {
    const stage = currentStage();
    const isEstimateSent = stage === 'estimate-sent';

    const protocol = document.querySelector('#dialog-stage-protocol');
    if (protocol) protocol.hidden = isEstimateSent;

    const folderCommand = document.querySelector('#folder-command-polish-panel');
    if (folderCommand) folderCommand.hidden = isEstimateSent;

    const originalFolderCommandButton = document.querySelector('#copy-folder-command');
    if (originalFolderCommandButton && isEstimateSent) originalFolderCommandButton.hidden = true;

    const oldNextStep = document.querySelector('#dialog-next-step-actions');
    if (oldNextStep && isEstimateSent) oldNextStep.hidden = true;

    const panel = ensurePanel();
    if (!panel) return;
    panel.hidden = !isEstimateSent;
    const code = panel.querySelector('#estimate-sent-follow-up-command');
    const message = panel.querySelector('#estimate-sent-message');
    if (code) code.textContent = followUpCommand;
    if (message) message.textContent = '';
  }

  function hookPersistStage() {
    if (typeof persistStage !== 'function') {
      window.setTimeout(hookPersistStage, 150);
      return;
    }
    if (persistStage.isEstimateDateEnhanced) return;

    const originalPersistStage = persistStage;
    const enhancedPersistStage = async function enhancedEstimateDatePersistStage(lead, stage) {
      let estimateDate = null;
      if (stage === 'estimate-sent' && lead && !hasStoredEstimateDate(lead)) {
        estimateDate = todayDateString();
        lead.estimateDate = estimateDate;
        lead.nextStep = 'Follow up on the proposal. Light check-in at 2 days; full follow-up at 5 days.';
      }

      const result = await originalPersistStage(lead, stage);
      if (estimateDate) await saveEstimateDate(lead, estimateDate);
      window.setTimeout(setEstimateSentVisibility, 100);
      return result;
    };

    enhancedPersistStage.isEstimateDateEnhanced = true;
    persistStage = enhancedPersistStage;
  }

  function hookShowLead() {
    let ready = false;
    try {
      if (typeof showLead === 'function') {
        ready = true;
        if (!showLead.__estimateSentPolished) {
          const originalShowLead = showLead;
          showLead = function estimateSentPolishedShowLead(...args) {
            const result = originalShowLead.apply(this, args);
            window.setTimeout(setEstimateSentVisibility, 180);
            window.setTimeout(setEstimateSentVisibility, 450);
            return result;
          };
          showLead.__estimateSentPolished = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function boot() {
    hookPersistStage();
    const ready = hookShowLead();
    setEstimateSentVisibility();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  function delayedRefresh() {
    window.setTimeout(setEstimateSentVisibility, 180);
    window.setTimeout(setEstimateSentVisibility, 450);
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.lead-card-button, #move-next-button, #mark-qualified-button, #mark-spam-button')) delayedRefresh();
  });
  document.addEventListener('change', (event) => {
    if (event.target.matches('#dialog-status-select, #stage-filter')) delayedRefresh();
  });
  window.addEventListener('breeze-private-leads', delayedRefresh);
  window.addEventListener('breeze-lead-stage-changed', delayedRefresh);
  window.addEventListener('load', () => window.setTimeout(boot, 0));
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else window.setTimeout(boot, 0);
})();
