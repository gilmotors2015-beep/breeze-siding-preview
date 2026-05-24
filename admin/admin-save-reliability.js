(() => {
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

  const labelByStage = {
    new: 'Lead',
    qualified: 'Qualified',
    contacted: 'Contacted',
    scheduled: 'Scheduled',
    'estimate-sent': 'Estimate sent',
    won: 'Won',
    review: 'Review follow-up',
    lost: 'Lost',
    spam: 'Spam'
  };

  const stageByLabel = Object.fromEntries(Object.entries(labelByStage).map(([stage, label]) => [label.toLowerCase(), stage]));
  const qualifiedChecks = ['real-contact', 'service-area', 'real-project', 'not-spam'];
  let isSaving = false;

  function cleanValue(value) {
    const text = String(value || '').trim();
    if (!text || text === 'Not set' || /^stored privately/i.test(text) || /^stored in private/i.test(text)) return '';
    return text;
  }

  function getLeadArray() {
    try {
      if (Array.isArray(leads)) return leads;
    } catch (_error) {}
    return window.BREEZE_PRIVATE_ADMIN_LEADS || [];
  }

  function getActiveLead() {
    try {
      if (typeof activeLead !== 'undefined' && activeLead) return activeLead;
    } catch (_error) {}

    const name = document.querySelector('#dialog-name')?.textContent?.trim();
    const project = document.querySelector('#dialog-project')?.textContent?.trim();
    if (!name) return null;

    const source = getLeadArray();
    return source.find((lead) => lead.name === name && (!project || lead.project === project))
      || source.find((lead) => lead.name === name)
      || null;
  }

  function client() {
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client || null;
  }

  function loadLeads() {
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE?.loadLeads?.();
  }

  function isDatabaseLead(lead) {
    const id = String(lead?.id || '');
    return Boolean(id) && !id.startsWith('manual-') && !id.startsWith('lead-');
  }

  function setMessage(message) {
    [
      '#private-status-message',
      '#dialog-status-save-message',
      '#status-controller-message',
      '#lead-notes-save-message',
      '#lead-location-save-message'
    ].forEach((selector) => {
      const target = document.querySelector(selector);
      if (target) target.textContent = message;
    });
  }

  function setBusyState(isBusy) {
    ['#mark-qualified-button', '#move-next-button', '#mark-spam-button', '#dialog-status-select', '#status-next-step-button', '#save-lead-notes-button', '#save-lead-location-button']
      .forEach((selector) => {
        const target = document.querySelector(selector);
        if (target) target.disabled = isBusy;
      });
  }

  function parseAddress(lead) {
    const address = cleanValue(lead?.address);
    const cityLine = cleanValue(lead?.city);
    const addressParts = address.split(' - ');
    const location = addressParts.length > 1 ? addressParts[1] : cityLine;
    const cityParts = location.split(',').map((part) => part.trim());

    return {
      addressLine: cleanValue(lead?.addressLine) || (addressParts.length > 1 ? addressParts[0] : address),
      city: cleanValue(lead?.cityName) || cityParts[0] || '',
      state: cleanValue(lead?.state) || cityParts[1] || 'WA',
      zip: cleanValue(lead?.zip) || cityParts[2] || ''
    };
  }

  function rowFromLead(lead, updates = {}) {
    const parsed = parseAddress(lead);
    const project = cleanValue(lead?.project);
    const row = {
      source: String(lead?.id || '').startsWith('lead-') ? 'dashboard-seed' : 'dashboard',
      stage: privateStage[lead?.stage] || 'needs_review',
      customer_name: cleanValue(lead?.name) || 'Unnamed lead',
      contact_person: cleanValue(lead?.contactPerson) || cleanValue(lead?.name),
      phone: cleanValue(lead?.phone),
      email: cleanValue(lead?.email),
      address_line: parsed.addressLine,
      city: parsed.city,
      state: parsed.state || 'WA',
      zip: parsed.zip,
      project_type: project,
      project_summary: project,
      folder_path: cleanValue(lead?.folderPathOverride),
      folder_status: cleanValue(lead?.folderStatus),
      next_step: cleanValue(lead?.nextStep) || nextStepText[lead?.stage] || nextStepText.new,
      notes: cleanValue(lead?.notes),
      is_spam: lead?.stage === 'spam',
      ...updates
    };

    Object.keys(row).forEach((key) => {
      if (row[key] === '') delete row[key];
    });
    return row;
  }

  async function saveLeadRecord(lead, updates) {
    const db = client();
    if (!db) return { data: null, error: null, skipped: true };

    if (isDatabaseLead(lead)) {
      return db
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', lead.id)
        .select('*')
        .maybeSingle();
    }

    const result = await db
      .from('leads')
      .insert(rowFromLead(lead, updates))
      .select('*')
      .single();

    if (result.data?.id) lead.id = result.data.id;
    return result;
  }

  function updateLeadLocally(lead, changes) {
    Object.assign(lead, changes, { updatedAt: new Date().toISOString() });
    if (changes.stage) {
      lead.nextStep = changes.nextStep || nextStepText[changes.stage] || lead.nextStep;
      if (changes.stage === 'qualified') lead.qualityChecksDone = qualifiedChecks;
      if (changes.stage === 'spam') lead.qualityChecksDone = [];
    }
  }

  function updateDialogText(lead) {
    if (!lead) return;
    const stageNode = document.querySelector('#dialog-stage');
    const nextNode = document.querySelector('#dialog-next');
    const guidance = document.querySelector('#dialog-stage-guidance');
    const select = document.querySelector('#dialog-status-select');
    const notesNode = document.querySelector('#dialog-notes');
    const addressNode = document.querySelector('#dialog-address');
    const cityNode = document.querySelector('#dialog-city');

    if (stageNode) stageNode.textContent = labelByStage[lead.stage] || 'Lead';
    if (nextNode) nextNode.textContent = lead.nextStep || nextStepText[lead.stage] || '';
    if (guidance) guidance.textContent = lead.nextStep || nextStepText[lead.stage] || '';
    if (select) select.value = lead.stage || 'new';
    if (notesNode) notesNode.textContent = lead.notes || 'Not set';
    if (addressNode) addressNode.textContent = lead.address || 'Not set';
    if (cityNode) cityNode.textContent = lead.city || 'Not set';
  }

  function rerender(lead) {
    try {
      if (typeof renderAll === 'function') renderAll();
      if (lead && typeof refreshLeadDetails === 'function') refreshLeadDetails(lead);
    } catch (_error) {}
    updateDialogText(lead);
  }

  function currentStage() {
    const selectStage = document.querySelector('#dialog-status-select')?.value;
    if (selectStage) return selectStage;
    const label = document.querySelector('#dialog-stage')?.textContent?.trim().toLowerCase() || '';
    return stageByLabel[label] || getActiveLead()?.stage || 'new';
  }

  async function saveStage(stage, source = 'status') {
    if (isSaving) return;
    const lead = getActiveLead();
    if (!lead || !stage) {
      setMessage('Open a lead first, then choose a status.');
      return;
    }

    const previous = { ...lead };
    const nextStep = nextStepText[stage] || lead.nextStep;
    const updates = {
      stage: privateStage[stage] || 'needs_review',
      next_step: nextStep,
      is_spam: stage === 'spam'
    };

    isSaving = true;
    setBusyState(true);
    setMessage(`Saving ${lead.name} as ${labelByStage[stage] || stage}...`);

    const { error } = await saveLeadRecord(lead, updates);
    if (error) {
      Object.assign(lead, previous);
      rerender(lead);
      setBusyState(false);
      isSaving = false;
      setMessage(`Could not save status: ${error.message}`);
      return;
    }

    updateLeadLocally(lead, { stage, nextStep });
    rerender(lead);
    await loadLeads();
    setBusyState(false);
    isSaving = false;
    setMessage(`${lead.name} saved as ${labelByStage[stage] || stage}.`);
    window.dispatchEvent(new CustomEvent('breeze-lead-stage-changed', { detail: { lead, stage, source } }));
  }

  async function saveNotes() {
    if (isSaving) return;
    const lead = getActiveLead();
    const textarea = document.querySelector('#lead-notes-editor');
    if (!lead || !textarea) return;

    const notes = textarea.value.trim();
    isSaving = true;
    setBusyState(true);
    setMessage('Saving notes...');

    const { error } = await saveLeadRecord(lead, { notes });
    if (error) {
      setBusyState(false);
      isSaving = false;
      setMessage(`Could not save notes: ${error.message}`);
      return;
    }

    updateLeadLocally(lead, { notes });
    rerender(lead);
    await loadLeads();
    setBusyState(false);
    isSaving = false;
    setMessage('Notes saved.');
  }

  async function saveLocation() {
    if (isSaving) return;
    const lead = getActiveLead();
    if (!lead) return;

    const addressLine = document.querySelector('#lead-location-address')?.value.trim() || '';
    const city = document.querySelector('#lead-location-city')?.value.trim() || '';
    const state = document.querySelector('#lead-location-state')?.value.trim() || 'WA';
    const zip = document.querySelector('#lead-location-zip')?.value.trim() || '';
    const cityLine = [city, state, zip].filter(Boolean).join(', ');
    const address = [addressLine, cityLine].filter(Boolean).join(' - ') || 'Not set';

    isSaving = true;
    setBusyState(true);
    setMessage('Saving job address...');

    const { error } = await saveLeadRecord(lead, { address_line: addressLine, city, state, zip });
    if (error) {
      setBusyState(false);
      isSaving = false;
      setMessage(`Could not save address: ${error.message}`);
      return;
    }

    updateLeadLocally(lead, { addressLine, cityName: city, state, zip, city: cityLine || 'Not set', address });
    rerender(lead);
    await loadLeads();
    setBusyState(false);
    isSaving = false;
    setMessage('Job address saved.');
  }

  function dedupeSeedLeads() {
    try {
      if (!Array.isArray(leads)) return;
      const seen = new Set();
      const next = [];
      leads.forEach((lead) => {
        const key = String(lead.name || '').trim().toLowerCase();
        if (!key || !seen.has(key)) {
          seen.add(key);
          next.push(lead);
        }
      });
      if (next.length !== leads.length) {
        leads = next;
        if (typeof renderAll === 'function') renderAll();
      }
    } catch (_error) {}
  }

  function attachListeners() {
    if (document.body.dataset.reliableSaveReady) return;
    document.body.dataset.reliableSaveReady = 'true';

    document.addEventListener('click', (event) => {
      const target = event.target;
      let stage = '';

      if (target.closest('#mark-qualified-button')) stage = 'qualified';
      if (target.closest('#mark-spam-button')) stage = 'spam';
      if (target.closest('#move-next-button') || target.closest('#status-next-step-button')) stage = stageFlow[currentStage()] || '';
      if (target.closest('#save-lead-notes-button')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        saveNotes();
        return;
      }
      if (target.closest('#save-lead-location-button')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        saveLocation();
        return;
      }

      if (!stage) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      saveStage(stage, 'button');
    }, true);

    document.addEventListener('change', (event) => {
      if (!event.target.matches('#dialog-status-select')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      saveStage(event.target.value, 'dropdown');
    }, true);

    window.addEventListener('breeze-private-leads', () => window.setTimeout(dedupeSeedLeads, 80));
  }

  window.BREEZE_ADMIN_SAVE_RELIABILITY = {
    saveLeadRecord,
    saveStage,
    saveNotes,
    saveLocation
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', attachListeners, { once: true });
  } else {
    attachListeners();
  }
})();
