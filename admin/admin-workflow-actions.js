(() => {
  const scheduleTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\schedule - website style.oft';
  const scheduleCommand = `Start-Process -FilePath '${scheduleTemplatePath.replace(/'/g, "''")}'`;
  const customerRootPath = 'D:\\OneDrive\\Breeze Siding documents\\CUSTOMERS';
  const activeFolderStages = new Set(['qualified', 'contacted', 'scheduled', 'estimate-sent', 'won', 'review']);
  const followUpMessage = 'Hi, this is Ygil with Breeze Siding. I wanted to follow up on the estimate I sent over and see if you had any questions or wanted to review next steps. I am happy to clarify the scope, timeline, or materials.';

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
      .next-step-action-panel.is-urgent {
        border-color: #d87a12;
        background: #fff7ec;
      }
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
      .lead-age-flag {
        width: max-content;
        max-width: 100%;
        margin-top: 8px;
        padding: 4px 9px;
        border-radius: 999px;
        color: #8a3b00;
        background: #fff0dc;
        border: 1px solid #ffd09d;
        font-size: 0.76rem;
        font-weight: 900;
      }
      .lead-folder-path-button {
        width: 100%;
        min-height: 34px;
        margin-top: 7px;
        padding: 0 10px;
        border: 1px solid #c8d6e8;
        border-radius: 6px;
        color: var(--blue-dark);
        background: #eef6ff;
        font-size: 0.78rem;
        font-weight: 900;
        cursor: pointer;
      }
      .lead-folder-path-button:hover {
        border-color: #8fb4e8;
        background: #e4f0ff;
      }
      .folder-path-actions {
        display: grid;
        gap: 8px;
        margin: 10px 0 12px;
      }
      .folder-path-actions .folder-path-preview {
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 7px;
        color: var(--muted);
        background: #f8fbff;
        font-size: 0.84rem;
        font-weight: 800;
        word-break: break-word;
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

  function getActiveLead() {
    try {
      if (typeof activeLead !== 'undefined') return activeLead;
    } catch {
      return null;
    }
    return null;
  }

  function getAllLeads() {
    try {
      if (Array.isArray(leads)) return leads;
    } catch {
      return [];
    }
    return [];
  }

  function safeFolderName(name) {
    return String(name || 'Unnamed Customer').replace(/[<>:"/\\|?*]+/g, '-').replace(/\s+/g, ' ').trim() || 'Unnamed Customer';
  }

  function folderPathForLead(lead) {
    if (!lead) return customerRootPath;
    if (lead.folderPathOverride) return lead.folderPathOverride;
    return `${customerRootPath}\\${safeFolderName(lead.name)}`;
  }

  function parseLeadDate(value) {
    if (!value || /proposal|stored|not/i.test(String(value))) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  function estimateAgeDays(lead) {
    if (!lead) return null;
    const date = parseLeadDate(lead.estimateDate) || parseLeadDate(lead.createdAt);
    if (!date) return null;
    const diff = Date.now() - date.getTime();
    if (diff < 0) return 0;
    return Math.floor(diff / 86400000);
  }

  function isEstimateOverdue(lead) {
    return lead?.stage === 'estimate-sent' && Number(estimateAgeDays(lead)) >= 5;
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
      <strong id="next-step-action-title"></strong>
      <span id="next-step-action-text"></span>
      <div class="lead-actions" id="next-step-action-buttons"></div>
    `;

    wrapper.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function copyButton(label, copiedLabel, text) {
    const button = document.createElement('button');
    button.className = 'button primary';
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = copiedLabel;
      } catch {
        button.textContent = 'Copy failed';
      }
    });
    return button;
  }

  function renderNextStepActions() {
    const panel = ensureNextStepPanel();
    if (!panel) return;

    const stage = currentStage();
    const lead = getActiveLead();
    const title = panel.querySelector('#next-step-action-title');
    const text = panel.querySelector('#next-step-action-text');
    const buttons = panel.querySelector('#next-step-action-buttons');
    buttons.replaceChildren();
    panel.classList.remove('is-urgent');

    if (stage === 'contacted') {
      panel.hidden = false;
      title.textContent = 'Scheduling email';
      text.textContent = 'Use this when the customer is ready to book an estimate appointment.';
      buttons.append(copyButton('Copy schedule email command', 'Copied schedule command', scheduleCommand));
      return;
    }

    if (stage === 'estimate-sent') {
      const age = estimateAgeDays(lead);
      const overdue = Number(age) >= 5;
      panel.hidden = false;
      panel.classList.toggle('is-urgent', overdue);
      title.textContent = overdue ? 'Estimate follow-up due' : 'Estimate follow-up plan';
      text.textContent = overdue
        ? `This estimate has been out for ${age} days. Follow up today and log the response.`
        : age === null
          ? 'Estimate is sent. If the sent date is not stored, use a 5-day follow-up from memory or update the date in the lead record.'
          : `Estimate sent ${age} day${age === 1 ? '' : 's'} ago. Light check-in at 2 days; full follow-up at 5 days.`;
      buttons.append(copyButton('Copy follow-up message', 'Copied follow-up message', followUpMessage));
      return;
    }

    panel.hidden = true;
  }

  function ensureFolderPathActions(workspace) {
    let actions = workspace.querySelector('#dialog-folder-path-actions');
    if (actions) return actions;

    actions = document.createElement('div');
    actions.id = 'dialog-folder-path-actions';
    actions.className = 'folder-path-actions';
    actions.innerHTML = `
      <button class="button primary" id="copy-folder-path-button" type="button">Copy OneDrive folder path</button>
      <div class="folder-path-preview" id="dialog-folder-path-preview"></div>
    `;
    workspace.insertAdjacentElement('afterbegin', actions);

    actions.querySelector('#copy-folder-path-button')?.addEventListener('click', async () => {
      const lead = getActiveLead();
      const button = actions.querySelector('#copy-folder-path-button');
      try {
        await navigator.clipboard.writeText(folderPathForLead(lead));
        button.textContent = 'Copied folder path';
      } catch {
        button.textContent = 'Copy failed';
      }
    });

    return actions;
  }

  function renderFolderPathActions() {
    const workspace = document.querySelector('#dialog-folder-workspace');
    if (!workspace) return;
    const lead = getActiveLead();
    const actions = ensureFolderPathActions(workspace);
    const preview = actions.querySelector('#dialog-folder-path-preview');
    const button = actions.querySelector('#copy-folder-path-button');
    if (preview) preview.textContent = folderPathForLead(lead);
    if (button) button.textContent = 'Copy OneDrive folder path';
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

    workspace.hidden = false;
    workspace.classList.toggle('is-folder-done', activeFolderStages.has(stage));

    if (title) title.textContent = activeFolderStages.has(stage) ? 'Folder status' : 'Folder action';
    if (checklist) checklist.hidden = true;
    renderFolderPathActions();

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
      if (note) note.textContent = 'Qualify the lead first. You can still copy the planned OneDrive folder path from here.';
      if (button) {
        button.hidden = false;
        button.disabled = true;
        button.textContent = 'Qualify first';
      }
      return;
    }

    if (stage === 'spam' || stage === 'lost') {
      if (status) status.textContent = stage === 'spam' ? 'No folder needed' : 'Closed lead';
      if (note) note.textContent = 'The OneDrive path button is available for lookup, but no new folder action is needed unless you decide to reopen this lead.';
      if (button) {
        button.hidden = true;
        button.disabled = true;
      }
    }
  }

  function addEstimateFlags() {
    const sourceLeads = getAllLeads();
    if (!sourceLeads.length) return;

    document.querySelectorAll('.lead-card').forEach((card) => {
      card.querySelector('.lead-age-flag')?.remove();
      const name = card.querySelector('.lead-name')?.textContent?.trim();
      const lead = sourceLeads.find((item) => item.name === name);
      if (!isEstimateOverdue(lead)) return;

      const age = estimateAgeDays(lead);
      const flag = document.createElement('span');
      flag.className = 'lead-age-flag';
      flag.textContent = `${age}+ day follow-up`;
      card.querySelector('.lead-card-button')?.append(flag);
    });
  }

  function addFolderPathButtons() {
    const sourceLeads = getAllLeads();
    if (!sourceLeads.length) return;

    document.querySelectorAll('.lead-card').forEach((card) => {
      const name = card.querySelector('.lead-name')?.textContent?.trim();
      const lead = sourceLeads.find((item) => item.name === name);
      if (!lead) return;

      let button = card.querySelector('.lead-folder-path-button');
      if (!button) {
        button = document.createElement('button');
        button.className = 'lead-folder-path-button';
        button.type = 'button';
        button.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();
          try {
            await navigator.clipboard.writeText(folderPathForLead(lead));
            button.textContent = 'Copied OneDrive path';
          } catch {
            button.textContent = 'Copy failed';
          }
        });
        card.append(button);
      }
      button.textContent = 'Copy OneDrive path';
    });
  }

  function refreshWorkflowActions() {
    renderNextStepActions();
    simplifyFolderPanel();
    addEstimateFlags();
    addFolderPathButtons();
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

  function hookBoardRender() {
    if (typeof renderAll !== 'function') {
      window.setTimeout(hookBoardRender, 150);
      return;
    }
    if (renderAll.isEstimateFollowUpEnhanced) return;

    const originalRenderAll = renderAll;
    const enhancedRenderAll = function enhancedEstimateFollowUpRenderAll() {
      originalRenderAll();
      window.setTimeout(() => {
        addEstimateFlags();
        addFolderPathButtons();
      }, 0);
    };
    enhancedRenderAll.isEstimateFollowUpEnhanced = true;
    renderAll = enhancedRenderAll;
  }

  function init() {
    injectStyles();
    hookLeadDialog();
    hookBoardRender();
    document.addEventListener('click', (event) => {
      if (event.target.closest('.lead-card-button, #mark-qualified-button, #move-next-button, #mark-spam-button')) {
        window.setTimeout(refreshWorkflowActions, 100);
      }
    });
    document.addEventListener('change', (event) => {
      if (event.target.matches('#dialog-status-select, #stage-filter')) {
        window.setTimeout(refreshWorkflowActions, 150);
      }
    });
    window.addEventListener('breeze-private-leads', () => window.setTimeout(refreshWorkflowActions, 0));
    window.setTimeout(refreshWorkflowActions, 500);
    window.setTimeout(refreshWorkflowActions, 700);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
