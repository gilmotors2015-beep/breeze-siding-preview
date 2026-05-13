(() => {
  const statusOptions = [
    ['new', 'Lead'],
    ['qualified', 'Qualified'],
    ['contacted', 'Contacted'],
    ['scheduled', 'Scheduled'],
    ['estimate-sent', 'Estimate sent'],
    ['won', 'Won'],
    ['review', 'Review follow-up'],
    ['lost', 'Lost'],
    ['spam', 'Spam']
  ];

  const projectTypeOptions = [
    ['', 'Select project type'],
    ['Siding replacement', 'Siding replacement'],
    ['Siding repair', 'Siding repair'],
    ['Window replacement', 'Window replacement'],
    ['Exterior painting', 'Exterior painting'],
    ['Deck building', 'Deck building'],
    ['Trim or fascia repair', 'Trim or fascia repair'],
    ['Multi-service exterior project', 'Multi-service exterior project'],
    ['Commercial project', 'Commercial project'],
    ['Other', 'Other']
  ];

  const privateStage = {
    new: 'needs_review',
    qualified: 'qualified',
    contacted: 'contacted',
    scheduled: 'scheduled',
    'estimate-sent': 'estimate_sent',
    won: 'won',
    review: 'review_follow_up',
    lost: 'lost',
    spam: 'spam'
  };

  const dashboardStage = {
    needs_review: 'new',
    qualified: 'qualified',
    contacted: 'contacted',
    scheduled: 'scheduled',
    estimate_sent: 'estimate-sent',
    won: 'won',
    review_follow_up: 'review',
    lost: 'lost',
    spam: 'spam'
  };

  const customerRoot = 'D:\\OneDrive\\Breeze Siding documents\\CUSTOMERS';
  const folderSections = [
    '01 Intake',
    '02 Photos',
    '03 Measurements',
    '04 Estimate',
    '05 Contract',
    '06 Job Docs',
    '07 Invoice',
    '08 Follow Up',
    '_Archive'
  ];

  const stageByLabel = Object.fromEntries(statusOptions.map(([value, label]) => [label.toLowerCase(), value]));

  const nextStep = {
    new: 'Review the lead, confirm it is real, then qualify or mark spam.',
    qualified: 'Set the appointment, send the schedule email, or call/text the customer.',
    contacted: 'Confirm the appointment or site visit details.',
    scheduled: 'Complete the site visit, measurements, photos, and estimate notes.',
    'estimate-sent': 'Follow up on the proposal and track the reply.',
    won: 'Prepare job expectations, start date planning, and contract details.',
    review: 'Request feedback, review, maintenance follow-up, or closeout notes.',
    lost: 'Record why the bid did not move forward.',
    spam: 'No action needed.'
  };

  const stageProtocols = {
    new: ['Lead intake protocol', 'No OFT yet', 'Review first, then call or text only if the request looks real.', ['Confirm name, phone/email, location, and project type.', 'Decide whether this is a real opportunity or spam.', 'If real, move to Qualified.']],
    qualified: ['Qualified lead protocol', 'schedule.oft', 'Call, text, or send the scheduling email.', ['Offer appointment windows or a quick phone call.', 'Create or confirm the customer folder.', 'Collect photos, address, and project notes if needed.']],
    contacted: ['Contacted protocol', 'schedule.oft', 'Follow up until the visit or call is confirmed.', ['Confirm date, time, and address.', 'Ask for photos if they help the estimate.', 'Move to Scheduled once the appointment is set.']],
    scheduled: ['Scheduled protocol', 'Estimate prep', 'Site visit, phone walkthrough, or photo review.', ['Take measurements and photos.', 'Capture scope, materials, access notes, and customer priorities.', 'Prepare estimate notes and move to Estimate sent after the proposal goes out.']],
    'estimate-sent': ['Estimate sent protocol', 'Estimate.oft', 'Email follow-up, phone call, or text check-in.', ['Track proposal date, total, and due date.', 'Follow up before the quote gets cold.', 'Move to Won, Lost, or Review follow-up based on response.']],
    won: ['Won job protocol', 'bid accepted.oft', 'Email job expectations and next steps.', ['Confirm agreement, deposit, start timing, and material plan.', 'Move customer folder into active job structure.', 'Schedule job prep and customer expectations email.']],
    review: ['Review and maintenance protocol', 'feedback.oft', 'Feedback form, review request, or maintenance check-in.', ['Ask for review or private feedback.', 'Record lessons learned.', 'Set future maintenance or checkup reminder if useful.']],
    lost: ['Lost bid protocol', 'feedback.oft', 'Short feedback request if appropriate.', ['Record why it did not move forward.', 'Ask for feedback if the relationship is warm.', 'Leave the door open for future exterior work.']],
    spam: ['Spam protocol', 'No template', 'Do not contact.', ['No folder needed.', 'No follow-up needed.', 'Keep it out of the working queue.']]
  };

  const qualifiedChecks = ['real-contact', 'service-area', 'real-project', 'not-spam'];
  let privateLeads = window.BREEZE_PRIVATE_ADMIN_LEADS || [];
  let folderPathTouched = false;

  function injectStatusStyles() {
    if (document.querySelector('#lead-status-editor-styles')) return;
    const style = document.createElement('style');
    style.id = 'lead-status-editor-styles';
    style.textContent = `
      .lead-status-editor,
      .manual-folder-helper {
        display: grid;
        gap: 8px;
        margin-top: 14px;
        padding: 12px 14px;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: #f8fbff;
      }
      .lead-status-editor label {
        display: grid;
        gap: 7px;
        font-weight: 900;
      }
      .lead-status-editor select { min-height: 42px; }
      .lead-status-editor span,
      .manual-folder-helper span {
        color: var(--muted);
        font-size: 0.9rem;
        font-weight: 800;
      }
      .manual-folder-helper strong {
        color: var(--ink);
        font-size: 0.98rem;
      }
      .manual-folder-helper code {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: #ffffff;
        color: #152235;
        font-size: 0.85rem;
      }
      .manual-folder-helper .button {
        width: fit-content;
      }
    `;
    document.head.append(style);
  }

  function selectedStage() {
    return document.querySelector('#manual-lead-stage')?.value || 'new';
  }

  function setStatusMessage(message) {
    const target = document.querySelector('#private-status-message');
    if (target) target.textContent = message;
  }

  function setManualMessage(message) {
    const target = document.querySelector('#manual-lead-message');
    if (target) target.textContent = message;
  }

  function safeFolderName(name) {
    return String(name || '')
      .replace(/[<>:"/\\|?*]+/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function folderPathForName(name) {
    const cleanName = safeFolderName(name) || 'Customer Name';
    return `${customerRoot}\\${cleanName}`;
  }

  function psQuote(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  function folderCommandForName(name) {
    const root = folderPathForName(name);
    const paths = [root, ...folderSections.map((section) => `${root}\\${section}`)];
    return `New-Item -ItemType Directory -Force -Path ${paths.map(psQuote).join(', ')}`;
  }

  function rowToLead(row) {
    return {
      id: row.id,
      name: row.customer_name || 'Unnamed lead',
      project: row.project_summary || row.project_type || 'Not set',
      stage: dashboardStage[row.stage] || 'new'
    };
  }

  async function loadEnhancementLeads() {
    const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
    if (!client) return privateLeads;

    const { data, error } = await client
      .from('leads')
      .select('id, customer_name, project_summary, project_type, stage')
      .order('updated_at', { ascending: false });

    if (!error) {
      privateLeads = (data || []).map(rowToLead);
      window.BREEZE_PRIVATE_ADMIN_LEADS = privateLeads;
    }
    return privateLeads;
  }

  function replaceProjectTypeInput() {
    const form = document.querySelector('#manual-lead-form');
    const input = form?.elements.project_type;
    if (!form || !input || input.tagName === 'SELECT') return;

    const select = document.createElement('select');
    select.name = input.name;
    select.required = input.required;
    select.id = input.id || 'manual-project-type';

    projectTypeOptions.forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.append(option);
    });

    input.replaceWith(select);
  }

  function insertStatusField() {
    const grid = document.querySelector('#manual-lead-form .manual-lead-grid');
    if (!grid || document.querySelector('#manual-lead-stage')) return;

    const label = document.createElement('label');
    label.textContent = 'Status';

    const select = document.createElement('select');
    select.id = 'manual-lead-stage';
    select.name = 'stage';

    statusOptions.forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.append(option);
    });

    label.append(select);
    const firstField = grid.querySelector('label');
    if (firstField?.nextSibling) {
      grid.insertBefore(label, firstField.nextSibling);
    } else {
      grid.append(label);
    }
  }

  function insertManualFolderHelper() {
    const grid = document.querySelector('#manual-lead-form .manual-lead-grid');
    const notesField = document.querySelector('#manual-lead-form textarea[name="notes"]')?.closest('label');
    if (!grid || !notesField || document.querySelector('#manual-folder-helper')) return;

    const helper = document.createElement('section');
    helper.id = 'manual-folder-helper';
    helper.className = 'manual-folder-helper wide';
    helper.innerHTML = `
      <strong>Customer folder command</strong>
      <span>This creates the matching folder inside CUSTOMERS with the standard sections.</span>
      <code id="manual-folder-path-preview"></code>
      <code id="manual-folder-command-preview"></code>
      <button class="button secondary" id="copy-manual-folder-command" type="button">Copy PowerShell command</button>
    `;

    grid.insertBefore(helper, notesField);

    helper.querySelector('#copy-manual-folder-command')?.addEventListener('click', async () => {
      const command = document.querySelector('#manual-folder-command-preview')?.textContent || '';
      try {
        await navigator.clipboard.writeText(command);
        helper.querySelector('#copy-manual-folder-command').textContent = 'Copied command';
      } catch {
        helper.querySelector('#copy-manual-folder-command').textContent = 'Copy failed';
      }
    });
  }

  function updateManualFolderHelper() {
    const form = document.querySelector('#manual-lead-form');
    if (!form) return;

    const customerName = form.elements.customer_name?.value || '';
    const folderPath = folderPathForName(customerName);
    const pathField = form.elements.folder_path;

    if (pathField && !folderPathTouched) pathField.value = folderPath;

    const pathPreview = document.querySelector('#manual-folder-path-preview');
    const commandPreview = document.querySelector('#manual-folder-command-preview');
    if (pathPreview) pathPreview.textContent = folderPath;
    if (commandPreview) commandPreview.textContent = folderCommandForName(customerName);
  }

  function hookManualFolderUpdates() {
    const form = document.querySelector('#manual-lead-form');
    if (!form || form.dataset.folderHelperReady) return;
    form.dataset.folderHelperReady = 'true';

    form.elements.customer_name?.addEventListener('input', () => {
      document.querySelector('#copy-manual-folder-command')?.replaceChildren('Copy PowerShell command');
      updateManualFolderHelper();
    });

    form.elements.folder_path?.addEventListener('input', () => {
      folderPathTouched = Boolean(form.elements.folder_path.value.trim());
    });

    document.querySelector('#add-lead-button')?.addEventListener('click', () => {
      folderPathTouched = false;
      window.setTimeout(updateManualFolderHelper, 0);
    });

    updateManualFolderHelper();
  }

  function enhanceLocalLeadBuilder() {
    if (typeof localLeadFromManualForm !== 'function' || localLeadFromManualForm.isStatusEnhanced) return;

    const original = localLeadFromManualForm;
    const enhanced = function enhancedLocalLeadFromManualForm() {
      updateManualFolderHelper();
      const lead = original();
      const stage = selectedStage();
      lead.stage = stage;
      lead.nextStep = nextStep[stage] || lead.nextStep;
      lead.qualityChecksDone = stage === 'new' || stage === 'spam' ? [] : qualifiedChecks;
      if (stage === 'spam') {
        lead.folderStatus = 'No folder - spam';
        lead.folderTasksDone = [];
      }
      return lead;
    };

    enhanced.isStatusEnhanced = true;
    localLeadFromManualForm = enhanced;
  }

  function enhancePrivateLeadBuilder() {
    if (typeof privateLeadFromManualForm !== 'function' || privateLeadFromManualForm.isStatusEnhanced) return;

    const original = privateLeadFromManualForm;
    const enhanced = function enhancedPrivateLeadFromManualForm() {
      updateManualFolderHelper();
      const row = original();
      const stage = selectedStage();
      row.stage = privateStage[stage] || 'needs_review';
      row.next_step = nextStep[stage] || row.next_step;
      row.is_spam = stage === 'spam';
      return row;
    };

    enhanced.isStatusEnhanced = true;
    privateLeadFromManualForm = enhanced;
  }

  function enhanceManualLeadSave() {
    const form = document.querySelector('#manual-lead-form');
    if (!form || form.dataset.statusSaveEnhanced) return;
    form.dataset.statusSaveEnhanced = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      updateManualFolderHelper();

      const lead = typeof localLeadFromManualForm === 'function' ? localLeadFromManualForm() : null;
      if (!lead?.name) {
        setManualMessage('Customer name is required.');
        return;
      }

      const saveButton = document.querySelector('#save-manual-lead-button');
      if (saveButton) saveButton.disabled = true;
      setManualMessage('Saving lead...');

      const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
      if (client && typeof privateLeadFromManualForm === 'function') {
        const { error } = await client.from('leads').insert(privateLeadFromManualForm());
        if (error) {
          if (saveButton) saveButton.disabled = false;
          setManualMessage(`Could not save lead: ${error.message}`);
          return;
        }
      }

      if (Array.isArray(leads)) leads = [lead, ...leads];
      if (typeof renderAll === 'function') renderAll();

      if (saveButton) saveButton.disabled = false;
      setManualMessage('Lead saved.');
      document.querySelector('#manual-lead-dialog')?.close();
      form.reset();
      folderPathTouched = false;
      updateManualFolderHelper();
      setStatusMessage(`Added ${lead.name} to the pipeline.`);
    }, true);
  }

  function mergePrivateLeadsWithStatic(incomingLeads) {
    if (!Array.isArray(incomingLeads) || !incomingLeads.length) return;
    if (!Array.isArray(customerRecords) || typeof renderAll !== 'function') return;

    const incomingIds = new Set(incomingLeads.map((lead) => lead.id));
    const staticLeads = customerRecords.filter((lead) => !incomingIds.has(lead.id));
    leads = [...incomingLeads, ...staticLeads];
    renderAll();
  }

  function currentDialogStage() {
    const label = document.querySelector('#dialog-stage')?.textContent?.trim().toLowerCase() || '';
    return stageByLabel[label] || 'new';
  }

  function currentDialogLead() {
    const name = document.querySelector('#dialog-name')?.textContent?.trim() || '';
    const project = document.querySelector('#dialog-project')?.textContent?.trim() || '';
    return privateLeads.find((lead) => lead.name === name && lead.project === project) || privateLeads.find((lead) => lead.name === name);
  }

  function setDialogStageText(stage) {
    const stageLabel = statusOptions.find(([value]) => value === stage)?.[1] || 'Lead';
    const dialogStage = document.querySelector('#dialog-stage');
    const dialogNext = document.querySelector('#dialog-next');
    const guidance = document.querySelector('#dialog-stage-guidance');
    const select = document.querySelector('#dialog-status-select');

    if (dialogStage) dialogStage.textContent = stageLabel;
    if (dialogNext) dialogNext.textContent = nextStep[stage] || '';
    if (guidance) guidance.textContent = nextStep[stage] || '';
    if (select) select.value = stage;
  }

  async function moveLeadToStage(lead, stage) {
    if (!lead || !stage || lead.stage === stage) return;

    const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
    const loadLeads = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.loadLeads;
    if (!client || !loadLeads) {
      setStatusMessage('Status changes need the private database connection.');
      return;
    }

    const label = statusOptions.find(([value]) => value === stage)?.[1] || 'new stage';
    setStatusMessage(`Updating ${lead.name} to ${label}...`);
    const { error } = await client
      .from('leads')
      .update({
        stage: privateStage[stage],
        next_step: nextStep[stage],
        is_spam: stage === 'spam'
      })
      .eq('id', lead.id);

    if (error) {
      setStatusMessage(`Could not update status: ${error.message}`);
      return;
    }

    lead.stage = stage;
    setDialogStageText(stage);
    renderDialogProtocol();
    await loadLeads();
    await loadEnhancementLeads();
  }

  function ensureStatusEditor() {
    const guidance = document.querySelector('#dialog-stage-guidance');
    if (!guidance) return null;

    let editor = document.querySelector('#dialog-status-editor');
    if (!editor) {
      editor = document.createElement('section');
      editor.id = 'dialog-status-editor';
      editor.className = 'lead-status-editor';
      editor.innerHTML = '<label>Status<select id="dialog-status-select"></select></label><span id="dialog-status-save-message">Change the status here when this customer moves to a new step.</span>';
      guidance.insertAdjacentElement('afterend', editor);

      const select = editor.querySelector('#dialog-status-select');
      statusOptions.forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        select.append(option);
      });

      select.addEventListener('change', async () => {
        const lead = currentDialogLead();
        const message = document.querySelector('#dialog-status-save-message');
        select.disabled = true;
        if (message) message.textContent = 'Saving status...';
        await moveLeadToStage(lead, select.value);
        select.disabled = false;
        if (message) message.textContent = 'Status saved. The board will show this lead in the updated column.';
      });
    }

    const select = editor.querySelector('#dialog-status-select');
    if (select) select.value = currentDialogStage();
    return editor;
  }

  function renderColumnProtocols() {
    document.querySelectorAll('.pipeline-column').forEach((column) => {
      if (column.querySelector('.stage-protocol-mini')) return;
      const raw = column.querySelector('h3')?.childNodes?.[0]?.textContent?.trim().toLowerCase() || '';
      const stage = stageByLabel[raw] || '';
      const protocol = stageProtocols[stage];
      if (!protocol) return;
      const note = document.createElement('p');
      note.className = 'stage-protocol-mini';
      note.textContent = `${protocol[1]}: ${protocol[2]}`;
      const heading = column.querySelector('h3');
      if (heading) heading.insertAdjacentElement('afterend', note);
    });
  }

  function ensureProtocolPanel() {
    let panel = document.querySelector('#dialog-stage-protocol');
    if (panel) return panel;

    const editor = ensureStatusEditor();
    if (!editor) return null;

    panel = document.createElement('section');
    panel.id = 'dialog-stage-protocol';
    panel.className = 'stage-protocol-panel';
    editor.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function renderDialogProtocol() {
    ensureStatusEditor();
    const panel = ensureProtocolPanel();
    if (!panel) return;

    const stage = currentDialogStage();
    const protocol = stageProtocols[stage] || stageProtocols.new;
    const [title, template, contact, actions] = protocol;

    panel.innerHTML = `
      <div class="stage-protocol-heading">
        <div><p class="eyebrow">Stage Protocol</p><h3>${title}</h3></div>
        <span>${template}</span>
      </div>
      <p>${contact}</p>
      <ul>${actions.map((action) => `<li>${action}</li>`).join('')}</ul>
    `;
  }

  function hookLeadCards() {
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.lead-card-button')) return;
      window.setTimeout(renderDialogProtocol, 0);
    });
  }

  function hookShowLead() {
    if (typeof showLead !== 'function' || showLead.isStatusEnhanced) return;
    const original = showLead;
    const enhanced = function enhancedShowLead(lead) {
      original(lead);
      window.setTimeout(renderDialogProtocol, 0);
    };
    enhanced.isStatusEnhanced = true;
    showLead = enhanced;
  }

  function init() {
    injectStatusStyles();
    replaceProjectTypeInput();
    insertStatusField();
    insertManualFolderHelper();
    hookManualFolderUpdates();
    enhanceLocalLeadBuilder();
    enhancePrivateLeadBuilder();
    enhanceManualLeadSave();
    hookShowLead();
    hookLeadCards();
    renderColumnProtocols();
    window.setTimeout(renderColumnProtocols, 600);
  }

  window.addEventListener('breeze-private-leads', (event) => {
    privateLeads = Array.isArray(event.detail?.leads) ? event.detail.leads : [];
    window.BREEZE_PRIVATE_ADMIN_LEADS = privateLeads;
    mergePrivateLeadsWithStatic(privateLeads);
    window.setTimeout(renderColumnProtocols, 0);
  });

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
