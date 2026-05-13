(() => {
  let pendingDeleteId = null;
  let pendingResetTimer = null;

  function injectStyles() {
    if (document.querySelector('#admin-delete-lead-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-delete-lead-styles';
    style.textContent = `
      .delete-lead-panel { display: grid; gap: 10px; margin-top: 18px; padding: 14px; border: 1px solid #f0c5c0; border-radius: 7px; background: #fff7f6; }
      .delete-lead-panel strong { color: #8f1d15; }
      .delete-lead-panel span { color: #6f312c; font-weight: 800; }
      .delete-lead-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
      .button.danger { color: #fff; background: #b42318; }
      .button.danger.is-confirming { background: #7f1d1d; }
      .button.danger:disabled { opacity: 0.58; cursor: not-allowed; }
      .button.cancel-delete { border-color: #d9b7b3; color: #7f1d1d; background: #fff; }
      .button.cancel-delete[hidden] { display: none; }
    `;
    document.head.append(style);
  }

  function currentLead() {
    try { if (typeof activeLead !== 'undefined') return activeLead; } catch {}
    return null;
  }

  function client() {
    try { if (typeof bridgeClient === 'function') return bridgeClient(); } catch {}
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client || null;
  }

  function reloadLeads() {
    try { if (typeof refreshPrivateLeads === 'function') return refreshPrivateLeads(); } catch {}
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE?.loadLeads?.();
  }

  function removeLocalLead(id) {
    try {
      if (!Array.isArray(leads)) return;
      const index = leads.findIndex((lead) => String(lead.id) === String(id));
      if (index >= 0) leads.splice(index, 1);
      if (typeof renderAll === 'function') renderAll();
    } catch {}
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
    if (note) note.textContent = 'Use this only for test leads, spam, or records you no longer want in the dashboard.';
  }

  function askForConfirmation(button, lead) {
    pendingDeleteId = String(lead.id);
    button.classList.add('is-confirming');
    button.textContent = 'Are you sure? Delete permanently';
    const cancel = document.querySelector('#cancel-delete-lead-button');
    const note = document.querySelector('#delete-lead-confirm-note');
    if (cancel) cancel.hidden = false;
    if (note) note.textContent = `Click the red button again to permanently delete ${lead.name}.`;
    if (pendingResetTimer) window.clearTimeout(pendingResetTimer);
    pendingResetTimer = window.setTimeout(resetDeleteConfirmation, 10000);
  }

  async function deleteLead(button) {
    const lead = currentLead();
    if (!lead) return;

    if (pendingDeleteId !== String(lead.id)) {
      askForConfirmation(button, lead);
      return;
    }

    if (pendingResetTimer) window.clearTimeout(pendingResetTimer);
    pendingResetTimer = null;
    button.disabled = true;
    button.textContent = 'Deleting...';

    if (String(lead.id).startsWith('manual-')) {
      removeLocalLead(lead.id);
      document.querySelector('#lead-dialog')?.close();
      setStatus(`Deleted ${lead.name} from the local dashboard view.`);
      resetDeleteConfirmation();
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
    panel.innerHTML = '<strong>Delete lead</strong><span id="delete-lead-confirm-note">Use this only for test leads, spam, or records you no longer want in the dashboard.</span><div class="delete-lead-actions"><button class="button danger" id="delete-active-lead-button" type="button">Delete lead</button><button class="button cancel-delete" id="cancel-delete-lead-button" type="button" hidden>Cancel</button></div>';
    form.append(panel);
    panel.querySelector('#delete-active-lead-button')?.addEventListener('click', (event) => deleteLead(event.currentTarget));
    panel.querySelector('#cancel-delete-lead-button')?.addEventListener('click', resetDeleteConfirmation);
  }

  function refreshPanel() {
    addPanel();
    resetDeleteConfirmation();
  }

  function hookDialog() {
    if (typeof showLead !== 'function') { window.setTimeout(hookDialog, 150); return; }
    if (showLead.isDeleteLeadEnhanced) return;
    const original = showLead;
    showLead = function enhancedDeleteLeadShowLead(lead) {
      original(lead);
      window.setTimeout(refreshPanel, 0);
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
    window.setTimeout(refreshPanel, 500);
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
