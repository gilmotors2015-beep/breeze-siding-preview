(() => {
  const styleId = 'spam-review-lane-style';
  const cleanupPanelId = 'spam-cleanup-panel';
  let pendingCleanup = false;
  let pendingCleanupTimer = null;

  function injectStyle() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .pipeline-column.stage-spam-review {
        border-color: rgba(180, 35, 24, 0.32);
        background: #fff7f6;
      }

      .pipeline-column.stage-spam-review h3 span {
        background: var(--danger, #b42318);
      }

      .pipeline-column.stage-spam-review .lead-card-button {
        border-color: rgba(180, 35, 24, 0.22);
      }

      .pipeline-column.stage-spam-review .pipeline-empty {
        border-color: rgba(180, 35, 24, 0.24);
        background: rgba(255, 255, 255, 0.76);
      }

      .spam-cleanup-panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 16px 18px;
        border: 1px solid rgba(180, 35, 24, 0.28);
        border-radius: 8px;
        background: #fff7f6;
        box-shadow: var(--shadow);
      }

      .spam-cleanup-panel strong {
        display: block;
        color: #7f1d1d;
        font-size: 1rem;
      }

      .spam-cleanup-panel span {
        display: block;
        color: #6f312c;
        font-weight: 800;
      }

      .spam-cleanup-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      .button.danger {
        color: #fff;
        background: var(--danger, #b42318);
      }

      .button.danger.is-confirming {
        background: #7f1d1d;
      }

      .button.danger:disabled {
        opacity: 0.58;
        cursor: not-allowed;
      }

      @media (max-width: 780px) {
        .spam-cleanup-panel {
          align-items: stretch;
          flex-direction: column;
        }

        .spam-cleanup-actions {
          justify-content: stretch;
        }

        .spam-cleanup-actions .button {
          width: 100%;
        }
      }
    `;
    document.head.append(style);
  }

  function labelMetric() {
    const spamMetric = document.querySelector('#metric-spam')?.closest('article')?.querySelector('span');
    if (spamMetric && spamMetric.textContent.trim() !== 'Spam review') {
      spamMetric.textContent = 'Spam review';
    }
  }

  function labelFilter() {
    const option = document.querySelector('#stage-filter option[value="spam"]');
    if (option && option.textContent.trim() !== 'Spam Review') {
      option.textContent = 'Spam Review';
    }
  }

  function labelPipeline() {
    document.querySelectorAll('.pipeline-column').forEach((column) => {
      const heading = column.querySelector('h3');
      if (!heading) return;
      const count = heading.querySelector('span');
      const labelText = heading.textContent.replace(count?.textContent || '', '').trim();
      if (labelText !== 'Spam' && labelText !== 'Spam Review') return;

      column.classList.add('stage-spam-review');
      const labelNode = Array.from(heading.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (labelNode) {
        labelNode.textContent = 'Spam Review';
      } else {
        heading.insertBefore(document.createTextNode('Spam Review'), count || null);
      }

      const empty = column.querySelector('.pipeline-empty');
      if (empty && /No spam/i.test(empty.textContent)) {
        empty.textContent = 'Suspicious submissions will collect here for a quick check.';
      }
    });
  }

  function client() {
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client || null;
  }

  function reloadLeads() {
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE?.loadLeads?.();
  }

  function setStatus(message) {
    const target = document.querySelector('#private-status-message');
    if (target) target.textContent = message;
  }

  function getLeads() {
    try {
      if (Array.isArray(leads)) return leads;
    } catch (_error) {}
    return Array.isArray(window.BREEZE_PRIVATE_ADMIN_LEADS) ? window.BREEZE_PRIVATE_ADMIN_LEADS : [];
  }

  function isDatabaseLead(lead) {
    const id = String(lead?.id || '');
    return Boolean(id) && !id.startsWith('manual-') && !id.startsWith('lead-');
  }

  function compactText(value) {
    return String(value || '').replace(/[^a-z0-9]/gi, '');
  }

  function looksRandomToken(value) {
    const text = compactText(value);
    if (text.length < 10) return false;
    const hasLower = /[a-z]/.test(text);
    const hasUpper = /[A-Z]/.test(text);
    const hasNumber = /\d/.test(text);
    const hasAwkwardCase = /[a-z][A-Z][a-z]|[A-Z][a-z][A-Z]/.test(text);
    return (hasLower && hasUpper && hasAwkwardCase) || (hasLower && hasUpper && hasNumber);
  }

  function looksAutomatedLead(lead) {
    let score = 0;
    const name = lead?.name || lead?.contactPerson || '';
    const city = lead?.cityName || lead?.city || '';
    const address = lead?.address || '';
    const email = lead?.email || '';

    if (looksRandomToken(name)) score += 2;
    if (looksRandomToken(city)) score += 2;
    if (looksRandomToken(address)) score += 1;
    if (/\d{8,}/.test(String(city)) || /\d{8,}/.test(String(address))) score += 1;
    if (/international\.inquiry|chameleongroup|7-11\.com/i.test(email)) score += 1;
    if (!String(name).trim().includes(' ') && compactText(name).length >= 12) score += 1;

    return score >= 2;
  }

  function isRecentLead(lead) {
    const stamp = Date.parse(lead?.createdAt || lead?.updatedAt || '');
    if (!Number.isFinite(stamp)) return false;
    const ageHours = (Date.now() - stamp) / 36e5;
    return ageHours <= 96;
  }

  function cleanupCandidates() {
    return getLeads().filter((lead) => {
      if (!isDatabaseLead(lead)) return false;
      if (lead.stage === 'spam') return true;
      return lead.stage === 'new' && isRecentLead(lead) && looksAutomatedLead(lead);
    });
  }

  function removeDeletedLeadIds(ids) {
    const idSet = new Set(ids.map(String));
    try {
      if (Array.isArray(leads)) {
        for (let index = leads.length - 1; index >= 0; index -= 1) {
          if (idSet.has(String(leads[index].id))) leads.splice(index, 1);
        }
      }
    } catch (_error) {}

    if (Array.isArray(window.BREEZE_PRIVATE_ADMIN_LEADS)) {
      window.BREEZE_PRIVATE_ADMIN_LEADS = window.BREEZE_PRIVATE_ADMIN_LEADS.filter((lead) => !idSet.has(String(lead.id)));
    }

    try {
      if (typeof renderAll === 'function') renderAll();
    } catch (_error) {}
  }

  function resetCleanupConfirmation() {
    pendingCleanup = false;
    if (pendingCleanupTimer) window.clearTimeout(pendingCleanupTimer);
    pendingCleanupTimer = null;
    const button = document.querySelector('#delete-spam-batch-button');
    if (button) {
      button.classList.remove('is-confirming');
      updateCleanupPanel();
    }
  }

  async function deleteCleanupCandidates(button) {
    const candidates = cleanupCandidates();
    if (!candidates.length) {
      setStatus('No spam-review records are ready for cleanup.');
      updateCleanupPanel();
      return;
    }

    if (!pendingCleanup) {
      pendingCleanup = true;
      button.classList.add('is-confirming');
      button.textContent = `Confirm delete ${candidates.length} spam lead${candidates.length === 1 ? '' : 's'}`;
      setStatus(`Click the red cleanup button again to permanently delete ${candidates.length} spam-review lead${candidates.length === 1 ? '' : 's'}.`);
      pendingCleanupTimer = window.setTimeout(resetCleanupConfirmation, 12000);
      return;
    }

    const db = client();
    if (!db) {
      setStatus('Secure database connection is not ready. Refresh the dashboard and sign in again.');
      resetCleanupConfirmation();
      return;
    }

    if (pendingCleanupTimer) window.clearTimeout(pendingCleanupTimer);
    pendingCleanupTimer = null;
    button.disabled = true;
    button.textContent = 'Deleting spam leads...';

    const ids = candidates.map((lead) => lead.id);
    for (let index = 0; index < ids.length; index += 50) {
      const batch = ids.slice(index, index + 50);
      const { error } = await db.from('leads').delete().in('id', batch);
      if (error) {
        button.disabled = false;
        setStatus(`Spam cleanup could not finish: ${error.message}`);
        resetCleanupConfirmation();
        return;
      }
    }

    removeDeletedLeadIds(ids);
    setStatus(`Deleted ${ids.length} spam-review lead${ids.length === 1 ? '' : 's'} from the dashboard.`);
    pendingCleanup = false;
    await reloadLeads();
    updateCleanupPanel();
  }

  function addCleanupPanel() {
    const operations = document.querySelector('#operations-tab');
    const metrics = operations?.querySelector('.metrics');
    if (!operations || !metrics || document.getElementById(cleanupPanelId)) return;

    const panel = document.createElement('section');
    panel.id = cleanupPanelId;
    panel.className = 'spam-cleanup-panel';
    panel.innerHTML = `
      <div>
        <strong>Spam cleanup</strong>
        <span id="spam-cleanup-count">Checking suspicious lead records...</span>
      </div>
      <div class="spam-cleanup-actions">
        <button class="button danger" id="delete-spam-batch-button" type="button">Delete spam-review leads</button>
      </div>
    `;

    metrics.insertAdjacentElement('afterend', panel);
    panel.querySelector('#delete-spam-batch-button')?.addEventListener('click', (event) => deleteCleanupCandidates(event.currentTarget));
  }

  function updateCleanupPanel() {
    addCleanupPanel();
    const count = cleanupCandidates().length;
    const countLabel = document.querySelector('#spam-cleanup-count');
    const button = document.querySelector('#delete-spam-batch-button');
    if (countLabel) {
      countLabel.textContent = count
        ? `${count} recent bot-looking or spam-review lead${count === 1 ? '' : 's'} ready to remove.`
        : 'No bot-looking spam-review leads found right now.';
    }
    if (button && !pendingCleanup) {
      button.disabled = count === 0;
      button.textContent = count ? `Delete ${count} spam lead${count === 1 ? '' : 's'}` : 'No spam to delete';
    }
  }

  function polish() {
    injectStyle();
    labelMetric();
    labelFilter();
    labelPipeline();
    updateCleanupPanel();
  }

  polish();
  window.addEventListener('breeze-private-leads', () => window.setTimeout(polish, 0));
  window.addEventListener('breeze-private-logout', () => window.setTimeout(polish, 0));

  const board = document.querySelector('#pipeline-board');
  if (board) {
    new MutationObserver(polish).observe(board, { childList: true, subtree: true });
  }
})();
