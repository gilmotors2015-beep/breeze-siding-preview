(() => {
  const styleId = 'lead-dialog-polish-styles';
  const notesPanelId = 'lead-notes-editor-panel';
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
      .lead-notes-editor {
        display: grid;
        gap: 12px;
        margin-top: 18px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fffdf8;
      }
      .lead-notes-editor h3 {
        margin: 0;
        line-height: 1.15;
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
      }
      .lead-notes-save-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .lead-notes-message {
        margin: 0;
        color: var(--muted);
        font-weight: 800;
      }
      @media (max-width: 760px) {
        .lead-details.is-compact,
        .lead-date-grid {
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

  function setDetailsCompact() {
    const details = document.querySelector('#lead-dialog .lead-details');
    if (!details) return;
    details.classList.add('is-compact');
    details.querySelectorAll('div').forEach((item) => {
      const label = item.querySelector('dt')?.textContent?.trim() || '';
      item.dataset.dialogDetailHidden = visibleDetailLabels.has(label) ? 'false' : 'true';
    });
  }

  function ensureNotesPanel() {
    let panel = document.getElementById(notesPanelId);
    if (panel) return panel;
    const details = document.querySelector('#lead-dialog .lead-details');
    if (!details) return null;

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
    details.insertAdjacentElement('afterend', panel);
    panel.querySelector('#save-lead-notes-button')?.addEventListener('click', saveNotes);
    return panel;
  }

  function hideCompletedLeadReview() {
    const panel = document.querySelector('.qualification-panel');
    if (!panel) return;
    panel.hidden = currentStage() !== 'new';
  }

  function renderNotesPanel() {
    const lead = getActiveLead();
    const panel = ensureNotesPanel();
    if (!lead || !panel) return;
    const notes = panel.querySelector('#lead-notes-editor');
    const first = panel.querySelector('#lead-initial-contact-date');
    const last = panel.querySelector('#lead-last-action-date');
    const message = panel.querySelector('#lead-notes-save-message');
    if (notes) notes.value = lead.notes || '';
    if (first) first.textContent = formatDate(lead.createdAt);
    if (last) last.textContent = formatDate(lead.updatedAt || lead.createdAt);
    if (message) message.textContent = 'Notes stay with this lead record.';
  }

  async function saveNotes() {
    const lead = getActiveLead();
    const textarea = document.querySelector('#lead-notes-editor');
    const message = document.querySelector('#lead-notes-save-message');
    const button = document.querySelector('#save-lead-notes-button');
    if (!lead || !textarea) return;
    const notes = textarea.value.trim();
    lead.notes = notes;
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
