(() => {
  const styleId = 'won-stage-polish-styles';
  const panelId = 'won-job-kickoff-panel';
  const bidAcceptedTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\bid accepted - website style.oft';
  const bidAcceptedCommand = `Start-Process -FilePath '${bidAcceptedTemplatePath.replace(/'/g, "''")}'`;
  let attempts = 0;

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .won-job-kickoff-panel {
        display: grid;
        gap: 12px;
        margin: 16px 0 0;
        padding: 14px;
        border: 1px solid #afd5be;
        border-radius: 8px;
        background: #f2fbf5;
      }
      .won-job-kickoff-panel[hidden] {
        display: none !important;
      }
      .won-job-kickoff-panel h3 {
        margin: 0;
        color: var(--ink);
        line-height: 1.15;
      }
      .won-job-kickoff-panel p,
      .won-job-kickoff-message {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
        line-height: 1.45;
      }
      .won-job-kickoff-command {
        display: block;
        padding: 10px 12px;
        border: 1px solid #cfe2d4;
        border-radius: 7px;
        color: #142033;
        background: #ffffff;
        font-size: 0.84rem;
        font-weight: 800;
        white-space: normal;
        word-break: break-word;
      }
      .won-job-kickoff-actions {
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
    panel.className = 'won-job-kickoff-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <h3>Accepted bid email (.oft)</h3>
      <p>Use this after the customer accepts the estimate. Open the accepted-bid template, confirm the customer name, project address, scope, expectations, and next scheduling details before sending.</p>
      <code class="won-job-kickoff-command" id="won-job-kickoff-command"></code>
      <div class="won-job-kickoff-actions">
        <button class="button primary" type="button" id="copy-won-bid-accepted-command">Copy accepted-bid .oft command</button>
        <p class="won-job-kickoff-message" id="won-job-kickoff-message" aria-live="polite"></p>
      </div>
    `;
    anchor.insertAdjacentElement('afterend', panel);

    panel.querySelector('#copy-won-bid-accepted-command')?.addEventListener('click', async () => {
      const message = panel.querySelector('#won-job-kickoff-message');
      try {
        await navigator.clipboard.writeText(bidAcceptedCommand);
        if (message) message.textContent = 'Accepted-bid command copied.';
      } catch (_error) {
        if (message) message.textContent = 'Copy failed.';
      }
    });
    return panel;
  }

  function setWonVisibility() {
    const stage = currentStage();
    const isWon = stage === 'won';

    const protocol = document.querySelector('#dialog-stage-protocol');
    if (protocol) protocol.hidden = isWon;

    const folderCommand = document.querySelector('#folder-command-polish-panel');
    if (folderCommand) folderCommand.hidden = isWon;

    const originalFolderCommandButton = document.querySelector('#copy-folder-command');
    if (originalFolderCommandButton && isWon) originalFolderCommandButton.hidden = true;

    const oldNextStep = document.querySelector('#dialog-next-step-actions');
    if (oldNextStep && isWon) oldNextStep.hidden = true;

    const panel = ensurePanel();
    if (!panel) return;
    panel.hidden = !isWon;
    const code = panel.querySelector('#won-job-kickoff-command');
    const message = panel.querySelector('#won-job-kickoff-message');
    if (code) code.textContent = bidAcceptedCommand;
    if (message) message.textContent = '';
  }

  function hookShowLead() {
    let ready = false;
    try {
      if (typeof showLead === 'function') {
        ready = true;
        if (!showLead.__wonStagePolish) {
          const originalShowLead = showLead;
          showLead = function wonStagePolishedShowLead(...args) {
            const result = originalShowLead.apply(this, args);
            window.setTimeout(setWonVisibility, 180);
            window.setTimeout(setWonVisibility, 450);
            return result;
          };
          showLead.__wonStagePolish = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function boot() {
    const ready = hookShowLead();
    setWonVisibility();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  function delayedRefresh() {
    window.setTimeout(setWonVisibility, 180);
    window.setTimeout(setWonVisibility, 450);
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.lead-card-button, #mark-qualified-button, #move-next-button, #mark-spam-button')) delayedRefresh();
  });
  document.addEventListener('change', (event) => {
    if (event.target.matches('#dialog-status-select')) delayedRefresh();
  });
  window.addEventListener('breeze-private-leads', delayedRefresh);
  window.addEventListener('breeze-lead-stage-changed', delayedRefresh);
  window.addEventListener('load', () => window.setTimeout(boot, 0));
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else window.setTimeout(boot, 0);
})();
