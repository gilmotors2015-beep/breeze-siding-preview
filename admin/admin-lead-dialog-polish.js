(() => {
  const styleId = 'lead-dialog-polish-styles';
  const notesPanelId = 'lead-notes-editor-panel';
  const locationPanelId = 'lead-location-editor-panel';
  const visibleDetailLabels = new Set(['Contact person', 'Contact', 'Address']);
  let attempts = 0;

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .lead-details.is-compact {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .lead-details.is-compact [data-dialog-detail-hidden='true'] {
        display: none;
      }
      .lead-location-editor,
      .lead-notes-editor {
        display: grid;
        gap: 12px;
        margin-top: 18px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fffdf8;
      }
      .lead-location-editor {
        background: #f8fbff;
      }
      .lead-location-editor h3,
      .lead-notes-editor h3 {
        margin: 0;
        line-height: 1.15;
      }
      .lead-location-help {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
        line-height: 1.45;
      }
      .lead-location-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 90px 110px;
        gap: 10px;
      }
      .lead-location-grid label,
      .lead-notes-editor label {
        display: grid;
        gap: 6px;
        color: var(--ink);
        font-weight: 900;
      }
      .lead-location-grid input,
      .lead-notes-editor textarea {
        width: 100%;
        border: 1px solid #bfd0e4;
        border-radius: 7px;
        color: var(--ink);
        background: var(--white);
        font: inherit;
        font-weight: 700;
      }
      .lead-location-grid input {
        min-height: 42px;
        padding: 0 10px;
      }
      .lead-date-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .lead-date-grid div {
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: #fff;
      }
      .lead-date-grid span {
        display: block;
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 900;
        text-transform: uppercase;
      }
      .lead-date-grid strong {
        display: block;
        margin-top: 3px;
        color: var(--ink);
      }
      .lead-notes-editor textarea {
        min-height: 120px;
        resize: vertical;
        padding: 11px 12px;
        line-height: 1.45;
      }
      .lead-notes-save-row,
      .lead-location-save-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .lead-notes-message,
      .lead-location-message {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
      }
      @media (max-width: 900px) {
        .lead-location-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 760px) {
        .lead-details.is-compact,
        .lead-date-grid,
        .lead-location-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.append(style);
  }

  function getActiveLead() {
    try { return activeLead || null; } catch (_error) { return null; }
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

  function formatDate(value) {
    if (!value) return 'Not recorded';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function isBlank(value) {
    return !value || value === 'Not set' || value === 'Stored privately' || value === 'Stored in private customer record';
  }

  function parseAddress(lead) {
    const address = isBlank(lead?.address) ? '' : String(lead.address);
    const city = isBlank(lead?.city) ? '' : String(lead.city);
    const parts = address.split(' - ');
    const street = lead?.addressLine || (parts.length > 1 ? parts[0] : address);
    const cityLine = lead?.cityName || lead?.city || (parts.length > 1 ? parts[1] : city);
    const cityParts = String(cityLine || '').split(',').map((item) => item.trim());
    return {
      addressLine: isBlank(street) ? '' : street,
      city: lead?.cityName || cityParts[0] || '',
      state: lead?.state || cityParts[1] || 'WA',
      zip: lead?.zip || cityParts[2] || ''
    };
  }

  function setDetailsCompact() {
    const details = document.querySelector('#lead-dialog .lead-details');
    if (!details) return;
    details.classList.add('is-compact');
    details.querySelectorAll('div').forEach((item) => {
      const label = item.querySelector('dt')?.textContent?.trim() || '';
      item.dataset.dialogDetailHidden = visibleDetailLabels.has(label) ? 'false' : 'true';
    });
  }

  function ensureLocationPanel() {
    let panel = document.getElementById(locationPanelId);
    if (panel) return panel;
    const details = document.querySelector('#lead-dialog .lead-details');
    if (!details) return null;

    panel = document.createElement('section');
    panel.id = locationPanelId;
    panel.className = 'lead-location-editor';
    panel.innerHTML = `
      <h3>Job location</h3>
      <p class="lead-location-help">During scheduling, confirm the exact project address and enter it here so the site visit, estimate, photos, and folder all point to the same location.</p>
      <div class="lead-location-grid">
        <label>Street address<input id="lead-location-address" autocomplete="street-address" placeholder="7306 Waller Rd E"></label>
        <label>City<input id="lead-location-city" autocomplete="address-level2" placeholder="Tacoma"></label>
        <label>State<input id="lead-location-state" autocomplete="address-level1" placeholder="WA"></label>
        <label>Zip<input id="lead-location-zip" autocomplete="postal-code" placeholder="98443"></label>
      </div>
      <div class="lead-location-save-row">
        <button class="button primary" type="button" id="save-lead-location-button">Save job address</button>
        <button class="button secondary" type="button" id="copy-location-question-button">Copy address question</button>
        <p class="lead-location-message" id="lead-location-save-message">Ask for this before confirming the appointment.</p>
      </div>
    `;
    details.insertAdjacentElement('afterend', panel);
    panel.querySelector('#save-lead-location-button')?.addEventListener('click', saveLocation);
    panel.querySelector('#copy-location-question-button')?.addEventListener('click', copyAddressQuestion);
    return panel;
  }

  function ensureNotesPanel() {
    let panel = document.getElementById(notesPanelId);
    if (panel) return panel;
    const locationPanel = ensureLocationPanel();
    if (!locationPanel) return null;

    panel = document.createElement('section');
    panel.id = notesPanelId;
    panel.className = 'lead-notes-editor';
    panel.innerHTML = `
      <h3>Working notes</h3>
      <div class="lead-date-grid">
        <div><span>Initial contact</span><strong id="lead-initial-contact-date">Not recorded</strong></div>
        <div><span>Last action</span><strong id="lead-last-action-date">Not recorded</strong></div>
      </div>
      <label>Notes<textarea id="lead-notes-editor" rows="5" placeholder="Initial call notes, appointment details, estimate status, customer preferences..."></textarea></label>
      <div class="lead-notes-save-row">
        <button class="button primary" type="button" id="save-lead-notes-button">Save notes</button>
        <p class="lead-notes-message" id="lead-notes-save-message">Notes stay with this lead record.</p>
      </div>
    `;
    locationPanel.insertAdjacentElement('afterend', panel);
    panel.querySelector('#save-lead-notes-button')?.addEventListener('click', saveNotes);
    return panel;
  }

  function hideCompletedLeadReview() {
    const panel = document.querySelector('.qualification-panel');
    if (!panel) return;
    panel.hidden = currentStage() !== 'new';
  }

  function renderLocationPanel() {
    const lead = getActiveLead();
    const panel = ensureLocationPanel();
    if (!lead || !panel) return;
    const parsed = parseAddress(lead);
    const fields = {
      '#lead-location-address': parsed.addressLine,
      '#lead-location-city': parsed.city,
      '#lead-location-state': parsed.state,
      '#lead-location-zip': parsed.zip
    };
    Object.entries(fields).forEach(([selector, value]) => {
      const input = panel.querySelector(selector);
      if (input && document.activeElement !== input) input.value = value || '';
    });
    const message = panel.querySelector('#lead-location-save-message');
    if (message) message.textContent = 'Ask for this before confirming the appointment.';
  }

  function renderNotesPanel() {
    const lead = getActiveLead();
    const panel = ensureNotesPanel();
    if (!lead || !panel) return;
    const notes = panel.querySelector('#lead-notes-editor');
    const first = panel.querySelector('#lead-initial-contact-date');
    const last = panel.querySelector('#lead-last-action-date');
    const message = panel.querySelector('#lead-notes-save-message');
    if (notes && document.activeElement !== notes) notes.value = lead.notes || '';
    if (first) first.textContent = formatDate(lead.createdAt);
    if (last) last.textContent = formatDate(lead.updatedAt || lead.createdAt);
    if (message) message.textContent = 'Notes stay with this lead record.';
  }

  async function copyAddressQuestion() {
    const message = document.querySelector('#lead-location-save-message');
    const text = 'Before we confirm the appointment, what is the exact project address where you would like us to meet for the estimate?';
    try {
      await navigator.clipboard.writeText(text);
      if (message) message.textContent = 'Address question copied.';
    } catch (_error) {
      if (message) message.textContent = 'Could not copy the address question.';
    }
  }

  async function saveLocation() {
    const lead = getActiveLead();
    const message = document.querySelector('#lead-location-save-message');
    const button = document.querySelector('#save-lead-location-button');
    if (!lead) return;

    const addressLine = document.querySelector('#lead-location-address')?.value.trim() || '';
    const city = document.querySelector('#lead-location-city')?.value.trim() || '';
    const state = document.querySelector('#lead-location-state')?.value.trim() || 'WA';
    const zip = document.querySelector('#lead-location-zip')?.value.trim() || '';
    const cityLine = [city, state, zip].filter(Boolean).join(', ');
    const fullAddress = [addressLine, cityLine].filter(Boolean).join(' - ');

    lead.addressLine = addressLine;
    lead.cityName = city;
    lead.state = state;
    lead.zip = zip;
    lead.city = cityLine || 'Not set';
    lead.address = fullAddress || 'Not set';
    lead.updatedAt = new Date().toISOString();

    const addressDisplay = document.querySelector('#dialog-address');
    const cityDisplay = document.querySelector('#dialog-city');
    if (addressDisplay) addressDisplay.textContent = lead.address;
    if (cityDisplay) cityDisplay.textContent = lead.city;

    const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
    if (!client || String(lead.id || '').startsWith('lead-') || String(lead.id || '').startsWith('manual-')) {
      if (message) message.textContent = 'Address updated on this screen.';
      return;
    }

    if (button) button.disabled = true;
    if (message) message.textContent = 'Saving job address...';
    const { error } = await client.from('leads').update({ address_line: addressLine, city, state, zip }).eq('id', lead.id);
    if (button) button.disabled = false;
    if (error) {
      if (message) message.textContent = `Could not save address: ${error.message}`;
      return;
    }
    if (message) message.textContent = 'Job address saved.';
    await window.BREEZE_PRIVATE_ADMIN_BRIDGE?.loadLeads?.();
  }

  async function saveNotes() {
    const lead = getActiveLead();
    const textarea = document.querySelector('#lead-notes-editor');
    const message = document.querySelector('#lead-notes-save-message');
    const button = document.querySelector('#save-lead-notes-button');
    if (!lead || !textarea) return;
    const notes = textarea.value.trim();
    lead.notes = notes;
    lead.updatedAt = new Date().toISOString();
    const noteDisplay = document.querySelector('#dialog-notes');
    if (noteDisplay) noteDisplay.textContent = notes || 'Not set';

    const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
    if (!client || String(lead.id || '').startsWith('lead-') || String(lead.id || '').startsWith('manual-')) {
      if (message) message.textContent = 'Notes updated on this screen.';
      return;
    }

    if (button) button.disabled = true;
    if (message) message.textContent = 'Saving notes...';
    const { error } = await client.from('leads').update({ notes }).eq('id', lead.id);
    if (button) button.disabled = false;
    if (error) {
      if (message) message.textContent = `Could not save notes: ${error.message}`;
      return;
    }
    if (message) message.textContent = 'Notes saved.';
    await window.BREEZE_PRIVATE_ADMIN_BRIDGE?.loadLeads?.();
  }

  function polishDialog() {
    injectStyles();
    setDetailsCompact();
    hideCompletedLeadReview();
    renderLocationPanel();
    renderNotesPanel();
  }

  function hookShowLead() {
    let ready = false;
    try {
      if (typeof showLead === 'function') {
        ready = true;
        if (!showLead.__dialogPolished) {
          const originalShowLead = showLead;
          showLead = function dialogPolishedShowLead(...args) {
            const result = originalShowLead.apply(this, args);
            window.setTimeout(polishDialog, 0);
            return result;
          };
          showLead.__dialogPolished = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function boot() {
    const ready = hookShowLead();
    polishDialog();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.lead-card-button, #mark-qualified-button, #move-next-button, #mark-spam-button')) {
      window.setTimeout(polishDialog, 120);
    }
  });
  document.addEventListener('change', (event) => {
    if (event.target.matches('#dialog-status-select')) window.setTimeout(polishDialog, 120);
  });
  window.addEventListener('breeze-private-leads', () => window.setTimeout(polishDialog, 0));
  window.addEventListener('load', () => window.setTimeout(boot, 0));
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else window.setTimeout(boot, 0);
})();
