(() => {
  const hiddenKey = 'breezeHiddenLeadIds';
  let pendingDeleteId = null;
  let pendingResetTimer = null;

  function injectStyles() {
    if (document.querySelector('#admin-delete-lead-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-delete-lead-styles';
    style.textContent = `
      .delete-lead-panel { display: grid; gap: 10px; margin-top: 18px; padding: 14px; border: 1px solid #f0c5c0; border-radius: 7px; background: #fff7f6; }
      .delete-lead-panel strong { color: #8f1d15; }
      .delete-lead-panel span { color: #6f312c; font-weight: 800; line-height: 1.4; }
      .delete-lead-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
      .button.danger { color: #fff; background: #b42318; }
      .button.danger.is-confirming { background: #7f1d1d; }
      .button.danger:disabled { opacity: 0.58; cursor: not-allowed; }
      .button.cancel-delete { border-color: #d9b7b3; color: #7f1d1d; background: #fff; }
      .button.cancel-delete[hidden] { display: none; }
    `;
    document.head.append(style);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function currentLead() {
    try {
      if (typeof activeLead !== 'undefined' && activeLead) return activeLead;
    } catch (_error) {}

    const dialogName = document.querySelector('#dialog-name')?.textContent?.trim();
    if (!dialogName) return null;

    try {
      if (Array.isArray(leads)) {
        const match = leads.find((lead) => normalize(lead.name) === normalize(dialogName));
        if (match) return match;
      }
    } catch (_error) {}

    return (window.BREEZE_PRIVATE_ADMIN_LEADS || []).find((lead) => normalize(lead.name) === normalize(dialogName)) || null;
  }

  function client() {
    try {
      if (typeof bridgeClient === 'function') return bridgeClient();
    } catch (_error) {}
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client || null;
  }

  function reloadLeads() {
    try {
      if (typeof refreshPrivateLeads === 'function') return refreshPrivateLeads();
    } catch (_error) {}
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE?.loadLeads?.();
  }

  function isDatabaseLead(lead) {
    const id = String(lead?.id || '');
    return Boolean(id) && !id.startsWith('manual-') && !id.startsWith('lead-');
  }

  function hiddenLeadIds() {
    try {
      return new Set(JSON.parse(window.localStorage.getItem(hiddenKey) || '[]'));
    } catch (_error) {
      return new Set();
    }
  }

  function rememberHiddenLead(id) {
    if (!id) return;
    const ids = hiddenLeadIds();
    ids.add(String(id));
    window.localStorage.setItem(hiddenKey, JSON.stringify([...ids]));
    window.dispatchEvent(new CustomEvent('breeze-static-lead-hidden', { detail: { id } }));
  }

  function removeLocalLead(id) {
    const stringId = String(id || '');
    try {
      if (Array.isArray(leads)) {
        const index = leads.findIndex((lead) => String(lead.id) === stringId);
        if (index >= 0) leads.splice(index, 1);
      }
    } catch (_error) {}

    if (Array.isArray(window.BREEZE_PRIVATE_ADMIN_LEADS)) {
      window.BREEZE_PRIVATE_ADMIN_LEADS = window.BREEZE_PRIVATE_ADMIN_LEADS.filter((lead) => String(lead.id) !== stringId);
    }

    try {
      if (typeof renderAll === 'function') renderAll();
    } catch (_error) {}
  }

  function setStatus(message) {
    const target = document.querySelector('#private-status-message');
    if (target) target.textContent = message;
  }

  function resetDeleteConfirmation() {
    pendingDeleteId = null;
    if (pendingResetTimer) window.clearTimeout(pendingResetTimer);
    pendingResetTimer = null;
    const button = document.querySelector('#delete-active-lead-button');
    const cancel = document.querySelector('#cancel-delete-lead-button');
    const note = document.querySelector('#delete-lead-confirm-note');
    if (button) {
      button.disabled = false;
      button.classList.remove('is-confirming');
      button.textContent = 'Delete lead';
    }
    if (cancel) cancel.hidden = true;
    if (note) note.textContent = 'Use this only for test leads, spam, duplicate records, or leads you no longer want in this dashboard.';
  }

  function askForConfirmation(button, lead) {
    pendingDeleteId = String(lead.id);
    button.classList.add('is-confirming');
    button.textContent = 'Are you sure? Delete this lead';
    const cancel = document.querySelector('#cancel-delete-lead-button');
    const note = document.querySelector('#delete-lead-confirm-note');
    if (cancel) cancel.hidden = false;
    if (note) note.textContent = `Click the red button again to delete ${lead.name}.`;
    if (pendingResetTimer) window.clearTimeout(pendingResetTimer);
    pendingResetTimer = window.setTimeout(resetDeleteConfirmation, 12000);
  }

  function finishLocalDelete(lead, message) {
    rememberHiddenLead(lead.id);
    removeLocalLead(lead.id);
    document.querySelector('#lead-dialog')?.close();
    setStatus(message);
    resetDeleteConfirmation();
  }

  async function deleteLead(button) {
    const lead = currentLead();
    if (!lead) {
      setStatus('Open a lead first, then use Delete lead.');
      return;
    }

    if (pendingDeleteId !== String(lead.id)) {
      askForConfirmation(button, lead);
      return;
    }

    if (pendingResetTimer) window.clearTimeout(pendingResetTimer);
    pendingResetTimer = null;
    button.disabled = true;
    button.textContent = 'Deleting...';

    if (!isDatabaseLead(lead)) {
      finishLocalDelete(lead, `Deleted ${lead.name} from this dashboard.`);
      return;
    }

    const db = client();
    if (!db) {
      resetDeleteConfirmation();
      setStatus('Could not delete lead because the private database connection is not available.');
      return;
    }

    const { error } = await db.from('leads').delete().eq('id', lead.id);
    if (error) {
      resetDeleteConfirmation();
      setStatus(`Could not delete ${lead.name}: ${error.message}`);
      return;
    }

    removeLocalLead(lead.id);
    document.querySelector('#lead-dialog')?.close();
    setStatus(`Deleted ${lead.name}.`);
    resetDeleteConfirmation();
    await reloadLeads();
  }

  function addPanel() {
    const form = document.querySelector('#lead-dialog form');
    if (!form || document.querySelector('#delete-lead-panel')) return;
    const panel = document.createElement('section');
    panel.id = 'delete-lead-panel';
    panel.className = 'delete-lead-panel';

    const title = document.createElement('strong');
    title.textContent = 'Delete lead';
    const note = document.createElement('span');
    note.id = 'delete-lead-confirm-note';
    note.textContent = 'Use this only for test leads, spam, duplicate records, or leads you no longer want in this dashboard.';
    const actions = document.createElement('div');
    actions.className = 'delete-lead-actions';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'button danger';
    deleteButton.id = 'delete-active-lead-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete lead';
    const cancelButton = document.createElement('button');
    cancelButton.className = 'button cancel-delete';
    cancelButton.id = 'cancel-delete-lead-button';
    cancelButton.type = 'button';
    cancelButton.hidden = true;
    cancelButton.textContent = 'Cancel';

    actions.append(deleteButton, cancelButton);
    panel.append(title, note, actions);
    form.append(panel);

    deleteButton.addEventListener('click', (event) => deleteLead(event.currentTarget));
    cancelButton.addEventListener('click', resetDeleteConfirmation);
  }

  function refreshPanel() {
    addPanel();
    resetDeleteConfirmation();
  }

  function hookDialog() {
    if (typeof showLead !== 'function') {
      window.setTimeout(hookDialog, 150);
      return;
    }
    if (showLead.isDeleteLeadEnhanced) return;
    const original = showLead;
    showLead = function enhancedDeleteLeadShowLead(lead) {
      const result = original(lead);
      window.setTimeout(refreshPanel, 0);
      return result;
    };
    showLead.isDeleteLeadEnhanced = true;
  }

  function loadFolderCommandHelper() {
    if (document.querySelector('script[data-admin-folder-command-polish]')) return;
    const script = document.createElement('script');
    script.src = '/admin/admin-folder-command-polish.js?v=folder-command-1';
    script.defer = true;
    script.async = false;
    script.setAttribute('data-admin-folder-command-polish', 'true');
    document.body.append(script);
  }

  function init() {
    injectStyles();
    hookDialog();
    loadFolderCommandHelper();
    document.addEventListener('click', (event) => {
      if (event.target.closest('.lead-card-button')) window.setTimeout(refreshPanel, 120);
    });
    window.setTimeout(refreshPanel, 500);
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
