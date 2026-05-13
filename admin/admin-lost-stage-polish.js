(() => {
  const styleId = 'lost-stage-polish-styles';
  const panelId = 'lost-feedback-panel';
  const feedbackTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\feedback - website style.oft';
  const feedbackCommand = `Start-Process -FilePath '${feedbackTemplatePath.replace(/'/g, "''")}'`;
  const feedbackLink = 'https://breezesiding.com/feedback/';
  const lostFeedbackText = 'Hi, this is Ygil with Breeze Siding. I wanted to thank you for considering us for your project. If you decided not to move forward, would you mind sharing quick feedback? It helps me understand whether it was price, timing, scope, communication, or something else. Here is the feedback link: https://breezesiding.com/feedback/';
  let attempts = 0;

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .lost-feedback-panel {
        display: grid;
        gap: 12px;
        margin: 16px 0 0;
        padding: 14px;
        border: 1px solid #d8c4ad;
        border-radius: 8px;
        background: #fff8f1;
      }
      .lost-feedback-panel[hidden] {
        display: none !important;
      }
      .lost-feedback-panel h3 {
        margin: 0;
        color: var(--ink);
        line-height: 1.15;
      }
      .lost-feedback-panel p,
      .lost-feedback-message {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
        line-height: 1.45;
      }
      .lost-feedback-command {
        display: block;
        padding: 10px 12px;
        border: 1px solid #e6d5c3;
        border-radius: 7px;
        color: #142033;
        background: #ffffff;
        font-size: 0.84rem;
        font-weight: 800;
        white-space: normal;
        word-break: break-word;
      }
      .lost-feedback-actions {
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
    panel.className = 'lost-feedback-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <h3>Lost lead feedback protocol</h3>
      <p>Use this when the customer declined, chose someone else, went quiet, or the project no longer makes sense. The goal is to learn why, record the reason in notes, and leave the door open professionally.</p>
      <code class="lost-feedback-command" id="lost-feedback-command"></code>
      <div class="lost-feedback-actions">
        <button class="button primary" type="button" id="copy-lost-feedback-command">Copy feedback .oft command</button>
        <button class="button secondary" type="button" id="copy-lost-feedback-link">Copy feedback link</button>
        <button class="button secondary" type="button" id="copy-lost-feedback-text">Copy quick text</button>
        <p class="lost-feedback-message" id="lost-feedback-message" aria-live="polite"></p>
      </div>
    `;
    anchor.insertAdjacentElement('afterend', panel);

    const message = () => panel.querySelector('#lost-feedback-message');
    async function copyText(text, success) {
      try {
        await navigator.clipboard.writeText(text);
        const target = message();
        if (target) target.textContent = success;
      } catch (_error) {
        const target = message();
        if (target) target.textContent = 'Copy failed.';
      }
    }

    panel.querySelector('#copy-lost-feedback-command')?.addEventListener('click', () => copyText(feedbackCommand, 'Feedback command copied.'));
    panel.querySelector('#copy-lost-feedback-link')?.addEventListener('click', () => copyText(feedbackLink, 'Feedback link copied.'));
    panel.querySelector('#copy-lost-feedback-text')?.addEventListener('click', () => copyText(lostFeedbackText, 'Quick text copied.'));
    return panel;
  }

  function setLostVisibility() {
    const isLost = currentStage() === 'lost';

    const protocol = document.querySelector('#dialog-stage-protocol');
    if (protocol) protocol.hidden = isLost;

    const folderCommand = document.querySelector('#folder-command-polish-panel');
    if (folderCommand) folderCommand.hidden = isLost;

    const originalFolderCommandButton = document.querySelector('#copy-folder-command');
    if (originalFolderCommandButton && isLost) originalFolderCommandButton.hidden = true;

    const oldNextStep = document.querySelector('#dialog-next-step-actions');
    if (oldNextStep && isLost) oldNextStep.hidden = true;

    const panel = ensurePanel();
    if (!panel) return;
    panel.hidden = !isLost;
    const code = panel.querySelector('#lost-feedback-command');
    const message = panel.querySelector('#lost-feedback-message');
    if (code) code.textContent = feedbackCommand;
    if (message) message.textContent = '';
  }

  function hookShowLead() {
    let ready = false;
    try {
      if (typeof showLead === 'function') {
        ready = true;
        if (!showLead.__lostStagePolish) {
          const originalShowLead = showLead;
          showLead = function lostStagePolishedShowLead(...args) {
            const result = originalShowLead.apply(this, args);
            window.setTimeout(setLostVisibility, 180);
            window.setTimeout(setLostVisibility, 450);
            return result;
          };
          showLead.__lostStagePolish = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function boot() {
    const ready = hookShowLead();
    setLostVisibility();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  function delayedRefresh() {
    window.setTimeout(setLostVisibility, 180);
    window.setTimeout(setLostVisibility, 450);
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
