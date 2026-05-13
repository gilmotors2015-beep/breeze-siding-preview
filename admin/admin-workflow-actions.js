(() => {
  const scheduleTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\schedule - website style.oft';
  const scheduleCommand = `Start-Process -FilePath '${scheduleTemplatePath.replace(/'/g, "''")}'`;
  const activeFolderStages = new Set(['qualified', 'contacted', 'scheduled', 'estimate-sent', 'won', 'review']);

  function injectStyles() {
    if (document.querySelector('#admin-workflow-action-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-workflow-action-styles';
    style.textContent = `
      .next-step-action-panel {
        display: grid;
        gap: 10px;
        margin: 10px 0 14px;
        padding: 12px 14px;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: #f8fbff;
      }
      .next-step-action-panel[hidden] { display: none; }
      .next-step-action-panel strong {
        color: var(--ink);
        font-size: 0.98rem;
      }
      .next-step-action-panel span {
        color: var(--muted);
        font-weight: 800;
        font-size: 0.9rem;
      }
      .next-step-action-panel .lead-actions {
        justify-content: flex-start;
      }
      #dialog-folder-workspace .folder-path-card,
      #dialog-folder-workspace .folder-checklist {
        display: none;
      }
      #dialog-folder-workspace.is-folder-done #copy-folder-command {
        display: none;
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

  function ensureNextStepPanel() {
    const nextStep = document.querySelector('#dialog-next');
    const wrapper = nextStep?.closest('div');
    if (!wrapper) return null;

    let panel = document.querySelector('#dialog-next-step-actions');
    if (panel) return panel;

    panel = document.createElement('section');
    panel.id = 'dialog-next-step-actions';
    panel.className = 'next-step-action-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <strong>Scheduling email</strong>
      <span>Use this once the customer has been contacted and is ready to schedule.</span>
      <div class="lead-actions">
        <button class="button primary" id="copy-schedule-template-command" type="button">Copy schedule email command</button>
      </div>
    `;

    wrapper.insertAdjacentElement('afterend', panel);
    panel.querySelector('#copy-schedule-template-command')?.addEventListener('click', async () => {
      const button = panel.querySelector('#copy-schedule-template-command');
      try {
        await navigator.clipboard.writeText(scheduleCommand);
        button.textContent = 'Copied schedule command';
      } catch {
        button.textContent = 'Copy failed';
      }
    });
    return panel;
  }

  function renderNextStepActions() {
    const panel = ensureNextStepPanel();
    if (!panel) return;

    const stage = currentStage();
    panel.hidden = stage !== 'contacted';
    const button = panel.querySelector('#copy-schedule-template-command');
    if (button && !panel.hidden) button.textContent = 'Copy schedule email command';
  }

  function simplifyFolderPanel() {
    const workspace = document.querySelector('#dialog-folder-workspace');
    if (!workspace) return;

    const stage = currentStage();
    const title = document.querySelector('#dialog-folder-title');
    const status = document.querySelector('#dialog-folder-status');
    const note = document.querySelector('#dialog-folder-lock-note');
    const button = document.querySelector('#copy-folder-command');
    const checklist = document.querySelector('#dialog-folder-checklist');

    workspace.hidden = stage === 'spam' || stage === 'lost';
    workspace.classList.toggle('is-folder-done', activeFolderStages.has(stage));

    if (title) title.textContent = activeFolderStages.has(stage) ? 'Folder status' : 'Folder action';
    if (checklist) checklist.hidden = true;

    if (activeFolderStages.has(stage)) {
      if (status) status.textContent = 'Folder handled';
      if (note) note.textContent = 'The customer folder is tracked for this lead. Keep photos, notes, estimates, and job documents in that customer folder as the job moves forward.';
      if (button) {
        button.hidden = true;
        button.disabled = true;
      }
      return;
    }

    if (stage === 'new') {
      if (status) status.textContent = 'Waiting for qualification';
      if (note) note.textContent = 'Qualify the lead first. After it is qualified, folder creation will be treated as handled and the dashboard will move on to customer contact steps.';
      if (button) {
        button.hidden = false;
        button.disabled = true;
        button.textContent = 'Qualify first';
      }
    }
  }

  function refreshWorkflowActions() {
    renderNextStepActions();
    simplifyFolderPanel();
  }

  function hookLeadDialog() {
    if (typeof showLead !== 'function') {
      window.setTimeout(hookLeadDialog, 150);
      return;
    }
    if (showLead.isWorkflowActionEnhanced) return;

    const originalShowLead = showLead;
    const enhancedShowLead = function enhancedWorkflowShowLead(lead) {
      originalShowLead(lead);
      window.setTimeout(refreshWorkflowActions, 0);
    };
    enhancedShowLead.isWorkflowActionEnhanced = true;
    showLead = enhancedShowLead;
  }

  function init() {
    injectStyles();
    hookLeadDialog();
    document.addEventListener('click', (event) => {
      if (event.target.closest('.lead-card-button, #mark-qualified-button, #move-next-button, #mark-spam-button')) {
        window.setTimeout(refreshWorkflowActions, 100);
      }
    });
    document.addEventListener('change', (event) => {
      if (event.target.matches('#dialog-status-select')) {
        window.setTimeout(refreshWorkflowActions, 150);
      }
    });
    window.setTimeout(refreshWorkflowActions, 500);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
