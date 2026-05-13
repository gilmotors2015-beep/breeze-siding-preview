(() => {
  const styleId = 'status-controller-styles';
  const stageOptions = [
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
  const stageFlow = {
    new: 'qualified',
    qualified: 'contacted',
    contacted: 'scheduled',
    scheduled: 'estimate-sent',
    'estimate-sent': 'won',
    won: 'review'
  };
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
  const nextStepText = {
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
  const qualifiedChecks = ['real-contact', 'service-area', 'real-project', 'not-spam'];
  const labelByStage = Object.fromEntries(stageOptions);
  const stageByLabel = Object.fromEntries(stageOptions.map(([stage, label]) => [label.toLowerCase(), stage]));
  let attempts = 0;

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .status-controller-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin-top: 8px;
      }
      .status-controller-message {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
      }
      #dialog-status-editor select {
        width: 100%;
      }
    `;
    document.head.append(style);
  }

  function getActiveLead() {
    try {
      if (typeof activeLead !== 'undefined' && activeLead) return activeLead;
    } catch (_error) {}

    const name = document.querySelector('#dialog-name')?.textContent?.trim();
    if (!name) return null;

    try {
      if (Array.isArray(leads)) {
        return leads.find((lead) => lead.name === name) || null;
      }
    } catch (_error) {}

    return (window.BREEZE_PRIVATE_ADMIN_LEADS || []).find((lead) => lead.name === name) || null;
  }

  function currentStage() {
    const selectStage = document.querySelector('#dialog-status-select')?.value;
    if (selectStage) return selectStage;
    const label = document.querySelector('#dialog-stage')?.textContent?.trim().toLowerCase() || '';
    return stageByLabel[label] || getActiveLead()?.stage || 'new';
  }

  function isRealDatabaseId(lead) {
    const id = String(lead?.id || '');
    return id && !id.startsWith('manual-') && !id.startsWith('lead-');
  }

  function setMessage(message) {
    const messageTargets = [
      document.querySelector('#status-controller-message'),
      document.querySelector('#dialog-status-save-message'),
      document.querySelector('#private-status-message')
    ];
    messageTargets.forEach((target) => {
      if (target) target.textContent = message;
    });
  }

  function updateDialogText(lead, stage) {
    const stageLabel = labelByStage[stage] || 'Lead';
    const nextText = nextStepText[stage] || '';
    const stageNode = document.querySelector('#dialog-stage');
    const nextNode = document.querySelector('#dialog-next');
    const guidance = document.querySelector('#dialog-stage-guidance');
    const select = document.querySelector('#dialog-status-select');

    if (stageNode) stageNode.textContent = stageLabel;
    if (nextNode) nextNode.textContent = nextText;
    if (guidance) guidance.textContent = nextText;
    if (select) select.value = stage;
    if (lead) {
      lead.stage = stage;
      lead.nextStep = nextText;
      if (stage === 'qualified') lead.qualityChecksDone = qualifiedChecks;
      if (stage === 'spam') lead.qualityChecksDone = [];
    }
  }

  function rerenderBoard(lead) {
    try {
      if (typeof renderAll === 'function') renderAll();
      if (lead && typeof refreshLeadDetails === 'function') refreshLeadDetails(lead);
    } catch (_error) {}
    window.setTimeout(ensureStatusControls, 0);
  }

  async function saveStage(stage, source = 'dropdown') {
    const lead = getActiveLead();
    if (!lead || !stage) {
      setMessage('Open a lead first, then choose a status.');
      return;
    }

    const previousStage = lead.stage;
    updateDialogText(lead, stage);
    rerenderBoard(lead);
    setMessage(`Moving ${lead.name} to ${labelByStage[stage]}...`);

    const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
    const loadLeads = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.loadLeads;

    if (client && isRealDatabaseId(lead)) {
      const { error } = await client
        .from('leads')
        .update({
          stage: privateStage[stage],
          next_step: nextStepText[stage],
          is_spam: stage === 'spam'
        })
        .eq('id', lead.id);

      if (error) {
        updateDialogText(lead, previousStage);
        rerenderBoard(lead);
        setMessage(`Could not save status: ${error.message}`);
        return;
      }

      await loadLeads?.();
    }

    setMessage(`${lead.name} moved to ${labelByStage[stage]}.`);
    window.dispatchEvent(new CustomEvent('breeze-lead-stage-changed', { detail: { lead, stage, source } }));
    window.setTimeout(ensureStatusControls, 120);
  }

  function ensureStatusControls() {
    injectStyles();
    const editor = document.querySelector('#dialog-status-editor');
    const select = document.querySelector('#dialog-status-select');
    if (!editor || !select) return;

    if (!editor.querySelector('#status-controller-actions')) {
      const actions = document.createElement('div');
      actions.id = 'status-controller-actions';
      actions.className = 'status-controller-actions';
      actions.innerHTML = `
        <button class="button primary" type="button" id="status-next-step-button">Move to next step</button>
        <p class="status-controller-message" id="status-controller-message">Use the dropdown or the next-step button to move this lead.</p>
      `;
      editor.append(actions);
      actions.querySelector('#status-next-step-button')?.addEventListener('click', () => {
        const nextStage = stageFlow[currentStage()];
        if (nextStage) saveStage(nextStage, 'next-button');
      });
    }

    const stage = currentStage();
    select.value = stage;
    const nextButton = editor.querySelector('#status-next-step-button');
    const nextStage = stageFlow[stage];
    if (nextButton) {
      nextButton.hidden = !nextStage;
      nextButton.textContent = nextStage ? `Move to ${labelByStage[nextStage]}` : 'No next step';
    }
  }

  function attachStatusListener() {
    if (document.body.dataset.statusControllerReady) return;
    document.body.dataset.statusControllerReady = 'true';

    document.addEventListener('change', (event) => {
      if (!event.target.matches('#dialog-status-select')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      saveStage(event.target.value, 'dropdown');
    }, true);

    document.addEventListener('click', (event) => {
      if (event.target.closest('.lead-card-button, #mark-qualified-button, #move-next-button, #mark-spam-button')) {
        window.setTimeout(ensureStatusControls, 160);
      }
    });

    window.addEventListener('breeze-private-leads', () => window.setTimeout(ensureStatusControls, 100));
    window.addEventListener('breeze-lead-stage-changed', () => window.setTimeout(ensureStatusControls, 100));
  }

  function hookShowLead() {
    let ready = false;
    try {
      if (typeof showLead === 'function') {
        ready = true;
        if (!showLead.__statusController) {
          const originalShowLead = showLead;
          showLead = function statusControllerShowLead(...args) {
            const result = originalShowLead.apply(this, args);
            window.setTimeout(ensureStatusControls, 120);
            return result;
          };
          showLead.__statusController = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function boot() {
    attachStatusListener();
    const ready = hookShowLead();
    ensureStatusControls();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else window.setTimeout(boot, 0);
})();
