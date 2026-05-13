(() => {
  const styleId = 'won-review-stage-polish-styles';
  const wonPanelId = 'won-job-kickoff-panel';
  const reviewPanelId = 'review-follow-up-panel';
  const bidAcceptedTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\bid accepted - website style.oft';
  const feedbackTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\feedback - website style.oft';
  const bidAcceptedCommand = `Start-Process -FilePath '${bidAcceptedTemplatePath.replace(/'/g, "''")}'`;
  const feedbackCommand = `Start-Process -FilePath '${feedbackTemplatePath.replace(/'/g, "''")}'`;
  const feedbackLink = 'https://breezesiding.com/feedback/';
  const rateUsLink = 'https://breezesiding.com/rate-us/';
  let attempts = 0;

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .won-job-kickoff-panel,
      .review-follow-up-panel {
        display: grid;
        gap: 12px;
        margin: 16px 0 0;
        padding: 14px;
        border-radius: 8px;
      }
      .won-job-kickoff-panel[hidden],
      .review-follow-up-panel[hidden] {
        display: none !important;
      }
      .won-job-kickoff-panel {
        border: 1px solid #afd5be;
        background: #f2fbf5;
      }
      .review-follow-up-panel {
        border: 1px solid #b7d2f5;
        background: #f4f8ff;
      }
      .won-job-kickoff-panel h3,
      .review-follow-up-panel h3 {
        margin: 0;
        color: var(--ink);
        line-height: 1.15;
      }
      .won-job-kickoff-panel p,
      .won-job-kickoff-message,
      .review-follow-up-panel p,
      .review-follow-up-message {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
        line-height: 1.45;
      }
      .won-job-kickoff-command,
      .review-follow-up-command {
        display: block;
        padding: 10px 12px;
        border-radius: 7px;
        color: #142033;
        background: #ffffff;
        font-size: 0.84rem;
        font-weight: 800;
        white-space: normal;
        word-break: break-word;
      }
      .won-job-kickoff-command {
        border: 1px solid #cfe2d4;
      }
      .review-follow-up-command {
        border: 1px solid #c8d8ee;
      }
      .won-job-kickoff-actions,
      .review-follow-up-actions {
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

  function insertAfterActionArea(panel) {
    const quickActions = document.querySelector('#flow-quick-actions');
    const stageGuidance = document.querySelector('#dialog-stage-guidance');
    const anchor = quickActions || stageGuidance;
    if (!anchor) return false;
    anchor.insertAdjacentElement('afterend', panel);
    return true;
  }

  function ensureWonPanel() {
    injectStyles();
    let panel = document.getElementById(wonPanelId);
    if (panel) return panel;

    panel = document.createElement('section');
    panel.id = wonPanelId;
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
    if (!insertAfterActionArea(panel)) return null;

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

  function ensureReviewPanel() {
    injectStyles();
    let panel = document.getElementById(reviewPanelId);
    if (panel) return panel;

    panel = document.createElement('section');
    panel.id = reviewPanelId;
    panel.className = 'review-follow-up-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <h3>Feedback and review follow-up (.oft)</h3>
      <p>Use this after closeout, final walkthrough, invoice, or a lost/no-response estimate. Send the feedback template, then guide happy customers toward the rate-us page.</p>
      <code class="review-follow-up-command" id="review-follow-up-command"></code>
      <div class="review-follow-up-actions">
        <button class="button primary" type="button" id="copy-review-feedback-command">Copy feedback .oft command</button>
        <button class="button secondary" type="button" id="copy-feedback-link">Copy feedback link</button>
        <button class="button secondary" type="button" id="copy-rate-us-link">Copy rate-us link</button>
        <p class="review-follow-up-message" id="review-follow-up-message" aria-live="polite"></p>
      </div>
    `;
    if (!insertAfterActionArea(panel)) return null;

    const message = () => panel.querySelector('#review-follow-up-message');
    panel.querySelector('#copy-review-feedback-command')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(feedbackCommand);
        const target = message();
        if (target) target.textContent = 'Feedback command copied.';
      } catch (_error) {
        const target = message();
        if (target) target.textContent = 'Copy failed.';
      }
    });
    panel.querySelector('#copy-feedback-link')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(feedbackLink);
        const target = message();
        if (target) target.textContent = 'Feedback link copied.';
      } catch (_error) {
        const target = message();
        if (target) target.textContent = 'Copy failed.';
      }
    });
    panel.querySelector('#copy-rate-us-link')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(rateUsLink);
        const target = message();
        if (target) target.textContent = 'Rate-us link copied.';
      } catch (_error) {
        const target = message();
        if (target) target.textContent = 'Copy failed.';
      }
    });
    return panel;
  }

  function hideSharedClutter(shouldHide) {
    const protocol = document.querySelector('#dialog-stage-protocol');
    if (protocol) protocol.hidden = shouldHide;

    const folderCommand = document.querySelector('#folder-command-polish-panel');
    if (folderCommand) folderCommand.hidden = shouldHide;

    const originalFolderCommandButton = document.querySelector('#copy-folder-command');
    if (originalFolderCommandButton && shouldHide) originalFolderCommandButton.hidden = true;

    const oldNextStep = document.querySelector('#dialog-next-step-actions');
    if (oldNextStep && shouldHide) oldNextStep.hidden = true;
  }

  function setStageVisibility() {
    const stage = currentStage();
    const isWon = stage === 'won';
    const isReview = stage === 'review';
    hideSharedClutter(isWon || isReview);

    const wonPanel = ensureWonPanel();
    if (wonPanel) {
      wonPanel.hidden = !isWon;
      const code = wonPanel.querySelector('#won-job-kickoff-command');
      const message = wonPanel.querySelector('#won-job-kickoff-message');
      if (code) code.textContent = bidAcceptedCommand;
      if (message) message.textContent = '';
    }

    const reviewPanel = ensureReviewPanel();
    if (reviewPanel) {
      reviewPanel.hidden = !isReview;
      const code = reviewPanel.querySelector('#review-follow-up-command');
      const message = reviewPanel.querySelector('#review-follow-up-message');
      if (code) code.textContent = feedbackCommand;
      if (message) message.textContent = '';
    }
  }

  function hookShowLead() {
    let ready = false;
    try {
      if (typeof showLead === 'function') {
        ready = true;
        if (!showLead.__wonReviewStagePolish) {
          const originalShowLead = showLead;
          showLead = function wonReviewStagePolishedShowLead(...args) {
            const result = originalShowLead.apply(this, args);
            window.setTimeout(setStageVisibility, 180);
            window.setTimeout(setStageVisibility, 450);
            return result;
          };
          showLead.__wonReviewStagePolish = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function boot() {
    const ready = hookShowLead();
    setStageVisibility();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  function delayedRefresh() {
    window.setTimeout(setStageVisibility, 180);
    window.setTimeout(setStageVisibility, 450);
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
