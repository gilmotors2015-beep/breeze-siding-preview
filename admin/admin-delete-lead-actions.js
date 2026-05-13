(() => {
  function injectStyles() {
    if (document.querySelector('#admin-delete-lead-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-delete-lead-styles';
    style.textContent = `
      .delete-lead-panel { display: grid; gap: 10px; margin-top: 18px; padding: 14px; border: 1px solid #f0c5c0; border-radius: 7px; background: #fff7f6; }
      .delete-lead-panel strong { color: #8f1d15; }
      .delete-lead-panel span { color: #6f312c; font-weight: 800; }
      .button.danger { color: #fff; background: #b42318; }
      .button.danger:disabled { opacity: 0.58; cursor: not-allowed; }
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

  async function deleteLead(button) {
    const lead = currentLead();
    if (!lead) return;
    const typed = window.prompt(`Type DELETE to permanently remove ${lead.name} from the dashboard.`);
    if (typed !== 'DELETE') return;

    button.disabled = true;
    button.textContent = 'Deleting...';

    if (String(lead.id).startsWith('manual-')) {
      removeLocalLead(lead.id);
      document.querySelector('#lead-dialog')?.close();
      setStatus(`Deleted ${lead.name} from the local dashboard view.`);
      return;
    }

    const db = client();
    if (!db) {
      button.disabled = false;
      button.textContent = 'Delete lead';
      setStatus('Could not delete lead because the private database connection is not available.');
      return;
    }

    const { error } = await db.from('leads').delete().eq('id', lead.id);
    if (error) {
      button.disabled = false;
      button.textContent = 'Delete lead';
      setStatus(`Could not delete ${lead.name}: ${error.message}`);
      return;
    }

    removeLocalLead(lead.id);
    document.querySelector('#lead-dialog')?.close();
    setStatus(`Deleted ${lead.name}.`);
    await reloadLeads();
  }

  function addPanel() {
    const form = document.querySelector('#lead-dialog form');
    if (!form || document.querySelector('#delete-lead-panel')) return;
    const panel = document.createElement('section');
    panel.id = 'delete-lead-panel';
    panel.className = 'delete-lead-panel';
    panel.innerHTML = '<strong>Delete lead</strong><span>Use this only for test leads, spam, or records you no longer want in the dashboard.</span><button class="button danger" id="delete-active-lead-button" type="button">Delete lead</button>';
    form.append(panel);
    panel.querySelector('#delete-active-lead-button')?.addEventListener('click', (event) => deleteLead(event.currentTarget));
  }

  function refreshPanel() {
    addPanel();
    const button = document.querySelector('#delete-active-lead-button');
    if (button) { button.disabled = false; button.textContent = 'Delete lead'; }
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

  function init() {
    injectStyles();
    hookDialog();
    window.setTimeout(refreshPanel, 500);
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
