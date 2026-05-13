(() => {
  const styleId = 'scheduled-stage-polish-styles';
  const panelId = 'scheduled-estimate-action-panel';
  const estimateTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\Estimate - website style.oft';
  const estimateCommand = `Start-Process -FilePath '${estimateTemplatePath.replace(/'/g, "''")}'`;
  let attempts = 0;

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .scheduled-estimate-action-panel {
        display: grid;
        gap: 12px;
        margin: 16px 0 0;
        padding: 14px;
        border: 1px solid #b7d2f5;
        border-radius: 8px;
        background: #f3f8ff;
      }
      .scheduled-estimate-action-panel[hidden] {
        display: none !important;
      }
      .scheduled-estimate-action-panel h3 {
        margin: 0;
        color: var(--ink);
        line-height: 1.15;
      }
      .scheduled-estimate-action-panel p,
      .scheduled-estimate-message {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
        line-height: 1.45;
      }
      .scheduled-estimate-command {
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
      .scheduled-estimate-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
    `;
    document.head.append(style);
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
    panel.className = 'scheduled-estimate-action-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <h3>Estimate email (.oft)</h3>
      <p>Open the estimate email template after the proposal is ready. Attach the estimate PDF, then adjust the customer name, address, project details, and any placeholders before sending.</p>
      <code class="scheduled-estimate-command" id="scheduled-estimate-command"></code>
      <div class="scheduled-estimate-actions">
        <button class="button primary" type="button" id="copy-scheduled-estimate-command">Copy .oft PowerShell command</button>
        <p class="scheduled-estimate-message" id="scheduled-estimate-message" aria-live="polite"></p>
      </div>
    `;
    anchor.insertAdjacentElement('afterend', panel);

    panel.querySelector('#copy-scheduled-estimate-command')?.addEventListener('click', async () => {
      const message = panel.querySelector('#scheduled-estimate-message');
      try {
        await navigator.clipboard.writeText(estimateCommand);
        if (message) message.textContent = 'Estimate command copied.';
      } catch (_error) {
        if (message) message.textContent = 'Copy failed.';
      }
    });
    return panel;
  }

  function setScheduledVisibility() {
    const stage = currentStage();
    const isScheduled = stage === 'scheduled';

    const protocol = document.querySelector('#dialog-stage-protocol');
    if (protocol) protocol.hidden = isScheduled;

    const folderWorkspace = document.querySelector('#dialog-folder-workspace');
    if (folderWorkspace) folderWorkspace.hidden = isScheduled;

    const folderCommand = document.querySelector('#folder-command-polish-panel');
    if (folderCommand) folderCommand.hidden = isScheduled;

    const oldNextStep = document.querySelector('#dialog-next-step-actions');
    if (oldNextStep && isScheduled) oldNextStep.hidden = true;

    const panel = ensurePanel();
    if (!panel) return;
    panel.hidden = !isScheduled;
    const code = panel.querySelector('#scheduled-estimate-command');
    const message = panel.querySelector('#scheduled-estimate-message');
    if (code) code.textContent = estimateCommand;
    if (message) message.textContent = '';
  }

  function hookShowLead() {
    let ready = false;
    try {
      if (typeof showLead === 'function') {
        ready = true;
        if (!showLead.__scheduledStagePolish) {
          const originalShowLead = showLead;
          showLead = function scheduledStagePolishedShowLead(...args) {
            const result = originalShowLead.apply(this, args);
            window.setTimeout(setScheduledVisibility, 180);
            window.setTimeout(setScheduledVisibility, 450);
            return result;
          };
          showLead.__scheduledStagePolish = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function boot() {
    const ready = hookShowLead();
    setScheduledVisibility();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.lead-card-button, #mark-qualified-button, #move-next-button, #mark-spam-button')) {
      window.setTimeout(setScheduledVisibility, 180);
      window.setTimeout(setScheduledVisibility, 450);
    }
  });
  document.addEventListener('change', (event) => {
    if (event.target.matches('#dialog-status-select')) {
      window.setTimeout(setScheduledVisibility, 180);
      window.setTimeout(setScheduledVisibility, 450);
    }
  });
  window.addEventListener('breeze-private-leads', () => window.setTimeout(setScheduledVisibility, 200));
  window.addEventListener('breeze-lead-stage-changed', () => window.setTimeout(setScheduledVisibility, 200));
  window.addEventListener('load', () => window.setTimeout(boot, 0));
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else window.setTimeout(boot, 0);
})();
