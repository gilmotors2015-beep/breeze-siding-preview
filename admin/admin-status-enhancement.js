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
    new: {
      title: 'Lead intake protocol',
      template: 'No OFT yet',
      contact: 'Review first, then call or text only if the request looks real.',
      actions: ['Confirm name, phone/email, location, and project type.', 'Decide whether this is a real opportunity or spam.', 'If real, move to Qualified.']
    },
    qualified: {
      title: 'Qualified lead protocol',
      template: 'schedule.oft',
      contact: 'Call, text, or send the scheduling email.',
      actions: ['Offer appointment windows or a quick phone call.', 'Create or confirm the customer folder.', 'Collect photos, address, and project notes if needed.']
    },
    contacted: {
      title: 'Contacted protocol',
      template: 'schedule.oft',
      contact: 'Follow up until the visit or call is confirmed.',
      actions: ['Confirm date, time, and address.', 'Ask for photos if they help the estimate.', 'Move to Scheduled once the appointment is set.']
    },
    scheduled: {
      title: 'Scheduled protocol',
      template: 'Estimate prep',
      contact: 'Site visit, phone walkthrough, or photo review.',
      actions: ['Take measurements and photos.', 'Capture scope, materials, access notes, and customer priorities.', 'Prepare estimate notes and move to Estimate sent after the proposal goes out.']
    },
    'estimate-sent': {
      title: 'Estimate sent protocol',
      template: 'Estimate.oft',
      contact: 'Email follow-up, phone call, or text check-in.',
      actions: ['Track proposal date, total, and due date.', 'Follow up before the quote gets cold.', 'Move to Won, Lost, or Review follow-up based on response.']
    },
    won: {
      title: 'Won job protocol',
      template: 'bid accepted.oft',
      contact: 'Email job expectations and next steps.',
      actions: ['Confirm agreement, deposit, start timing, and material plan.', 'Move customer folder into active job structure.', 'Schedule job prep and customer expectations email.']
    },
    review: {
      title: 'Review and maintenance protocol',
      template: 'feedback.oft',
      contact: 'Feedback form, review request, or maintenance check-in.',
      actions: ['Ask for review or private feedback.', 'Record lessons learned.', 'Set future maintenance or checkup reminder if useful.']
    },
    lost: {
      title: 'Lost bid protocol',
      template: 'feedback.oft',
      contact: 'Short feedback request if appropriate.',
      actions: ['Record why it did not move forward.', 'Ask for feedback if the relationship is warm.', 'Leave the door open for future exterior work.']
    },
    spam: {
      title: 'Spam protocol',
      template: 'No template',
      contact: 'Do not contact.',
      actions: ['No folder needed.', 'No follow-up needed.', 'Keep it out of the working queue.']
    }
  };

  const qualifiedChecks = ['real-contact', 'service-area', 'real-project', 'not-spam'];
  let privateLeads = window.BREEZE_PRIVATE_ADMIN_LEADS || [];
  let draggedLeadId = '';
  let boardObserver = null;
  let dialogObserver = null;
  let loadingLeads = false;

  function selectedStage() {
    return document.querySelector('#manual-lead-stage')?.value || 'new';
  }

  function setStatusMessage(message) {
    const target = document.querySelector('#private-status-message');
    if (target) target.textContent = message;
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
    if (!client || loadingLeads) return privateLeads;

    loadingLeads = true;
    const { data, error } = await client
      .from('leads')
      .select('id, customer_name, project_summary, project_type, stage')
      .order('updated_at', { ascending: false });
    loadingLeads = false;

    if (!error) {
      privateLeads = (data || []).map(rowToLead);
      window.BREEZE_PRIVATE_ADMIN_LEADS = privateLeads;
    }
    return privateLeads;
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

  function enhanceLocalLeadBuilder() {
    if (typeof localLeadFromManualForm !== 'function' || localLeadFromManualForm.isStatusEnhanced) return;

    const original = localLeadFromManualForm;
    const enhanced = function enhancedLocalLeadFromManualForm() {
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

  function cardText(card, selector) {
    return card.querySelector(selector)?.textContent?.trim() || '';
  }

  function findLeadForCard(card) {
    const name = cardText(card, '.lead-name');
    const project = cardText(card, '.lead-project');
    return privateLeads.find((lead) => lead.name === name && lead.project === project) || privateLeads.find((lead) => lead.name === name);
  }

  function stageFromColumn(column) {
    const raw = column.querySelector('h3')?.childNodes?.[0]?.textContent?.trim().toLowerCase() || '';
    return stageByLabel[raw] || '';
  }

  async function moveLeadToStage(leadId, stage) {
    if (!leadId || !stage) return;
    const lead = privateLeads.find((item) => `${item.id}` === `${leadId}`);
    if (!lead || lead.stage === stage) return;

    const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
    const loadLeads = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.loadLeads;
    if (!client || !loadLeads) {
      setStatusMessage('Drag move needs the private database connection.');
      return;
    }

    setStatusMessage(`Moving ${lead.name} to ${statusOptions.find(([value]) => value === stage)?.[1] || 'new stage'}...`);
    const { error } = await client
      .from('leads')
      .update({
        stage: privateStage[stage],
        next_step: nextStep[stage],
        is_spam: stage === 'spam'
      })
      .eq('id', lead.id);

    if (error) {
      setStatusMessage(`Could not move lead: ${error.message}`);
      return;
    }

    await loadLeads();
    await loadEnhancementLeads();
    enhanceBoard();
  }

  function enhanceCard(card) {
    const lead = findLeadForCard(card);
    if (!lead) return;

    card.dataset.dragEnhanced = 'true';
    card.dataset.leadId = lead.id;
    card.setAttribute('draggable', 'true');
    card.title = 'Drag this lead to another stage, or click to open details.';

    const button = card.querySelector('.lead-card-button');
    if (button) {
      button.setAttribute('draggable', 'true');
      button.dataset.leadId = lead.id;
    }

    if (card.dataset.dragListeners === 'true') return;
    card.dataset.dragListeners = 'true';

    const startDrag = (event) => {
      draggedLeadId = card.dataset.leadId;
      card.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggedLeadId);
    };

    const endDrag = () => {
      card.classList.remove('is-dragging');
      document.querySelectorAll('.pipeline-column.is-drag-over').forEach((column) => column.classList.remove('is-drag-over'));
      draggedLeadId = '';
    };

    card.addEventListener('dragstart', startDrag);
    card.addEventListener('dragend', endDrag);
    button?.addEventListener('dragstart', startDrag);
    button?.addEventListener('dragend', endDrag);
  }

  function enhanceColumn(column) {
    if (column.dataset.dropEnhanced === 'true') return;
    column.dataset.dropEnhanced = 'true';

    column.addEventListener('dragover', (event) => {
      if (!draggedLeadId) return;
      event.preventDefault();
      column.classList.add('is-drag-over');
      event.dataTransfer.dropEffect = 'move';
    });

    column.addEventListener('dragleave', (event) => {
      if (!column.contains(event.relatedTarget)) column.classList.remove('is-drag-over');
    });

    column.addEventListener('drop', async (event) => {
      event.preventDefault();
      column.classList.remove('is-drag-over');
      const leadId = event.dataTransfer.getData('text/plain') || draggedLeadId;
      await moveLeadToStage(leadId, stageFromColumn(column));
    });
  }

  async function enhanceBoard() {
    if (!privateLeads.length) await loadEnhancementLeads();
    document.querySelectorAll('.pipeline-column').forEach(enhanceColumn);
    document.querySelectorAll('.lead-card').forEach(enhanceCard);
    renderColumnProtocols();
  }

  function renderColumnProtocols() {
    document.querySelectorAll('.pipeline-column').forEach((column) => {
      if (column.querySelector('.stage-protocol-mini')) return;
      const stage = stageFromColumn(column);
      const protocol = stageProtocols[stage];
      if (!protocol) return;
      const note = document.createElement('p');
      note.className = 'stage-protocol-mini';
      note.textContent = `${protocol.template}: ${protocol.contact}`;
      const heading = column.querySelector('h3');
      if (heading) heading.insertAdjacentElement('afterend', note);
    });
  }

  function ensureProtocolPanel() {
    let panel = document.querySelector('#dialog-stage-protocol');
    if (panel) return panel;

    const guidance = document.querySelector('#dialog-stage-guidance');
    if (!guidance) return null;

    panel = document.createElement('section');
    panel.id = 'dialog-stage-protocol';
    panel.className = 'stage-protocol-panel';
    guidance.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function renderDialogProtocol() {
    const panel = ensureProtocolPanel();
    if (!panel) return;

    const stageLabel = document.querySelector('#dialog-stage')?.textContent?.trim().toLowerCase() || '';
    const stage = stageByLabel[stageLabel] || 'new';
    const protocol = stageProtocols[stage] || stageProtocols.new;

    panel.innerHTML = `
      <div class="stage-protocol-heading">
        <div><p class="eyebrow">Stage Protocol</p><h3>${protocol.title}</h3></div>
        <span>${protocol.template}</span>
      </div>
      <p>${protocol.contact}</p>
      <ul>${protocol.actions.map((action) => `<li>${action}</li>`).join('')}</ul>
    `;
  }

  function observeBoard() {
    const board = document.querySelector('#pipeline-board');
    if (!board || boardObserver) return;
    boardObserver = new MutationObserver(() => enhanceBoard());
    boardObserver.observe(board, { childList: true, subtree: true });
    enhanceBoard();
  }

  function observeDialog() {
    const dialog = document.querySelector('#lead-dialog');
    if (!dialog || dialogObserver) return;
    dialogObserver = new MutationObserver(() => renderDialogProtocol());
    dialogObserver.observe(dialog, { childList: true, subtree: true, characterData: true });
    renderDialogProtocol();
  }

  function init() {
    insertStatusField();
    enhanceLocalLeadBuilder();
    enhancePrivateLeadBuilder();
    observeBoard();
    observeDialog();
    window.setTimeout(enhanceBoard, 600);
    window.setTimeout(enhanceBoard, 1600);
  }

  window.addEventListener('breeze-private-leads', (event) => {
    privateLeads = Array.isArray(event.detail?.leads) ? event.detail.leads : [];
    window.BREEZE_PRIVATE_ADMIN_LEADS = privateLeads;
    window.setTimeout(enhanceBoard, 0);
  });

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
