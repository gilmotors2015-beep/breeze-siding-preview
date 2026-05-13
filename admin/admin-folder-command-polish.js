(() => {
  const styleId = 'folder-command-polish-styles';
  const panelId = 'folder-command-polish-panel';
  const customerRootPath = 'D:\\OneDrive\\Breeze Siding documents\\CUSTOMERS';
  const builderScriptPath = 'C:\\Users\\gilmo.DESKTOP-S16VIV1\\Documents\\Codex\\2026-05-04\\can-you-leave-off-from-our\\new-customer-folder-builder.ps1';
  let attempts = 0;

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .folder-command-polish {
        display: grid;
        gap: 10px;
        margin: 12px 0;
        padding: 12px 14px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #f8fbff;
      }
      .folder-command-polish strong {
        color: var(--ink);
        font-size: 0.98rem;
      }
      .folder-command-polish span,
      .folder-command-polish-message {
        color: var(--muted);
        font-size: 0.9rem;
        font-weight: 800;
        line-height: 1.45;
      }
      .folder-command-polish code {
        display: block;
        padding: 10px 12px;
        border: 1px solid #c8d6e8;
        border-radius: 7px;
        color: var(--ink);
        background: #fff;
        font-size: 0.82rem;
        font-weight: 800;
        white-space: normal;
        word-break: break-word;
      }
      .folder-command-polish .lead-actions {
        justify-content: flex-start;
      }
      .folder-command-polish-message {
        margin: 0;
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
      if (Array.isArray(leads)) return leads.find((lead) => lead.name === name) || null;
    } catch (_error) {}

    return (window.BREEZE_PRIVATE_ADMIN_LEADS || []).find((lead) => lead.name === name) || null;
  }

  function safeFolderName(name) {
    return String(name || 'Unnamed Customer')
      .replace(/[<>:"/\\|?*]+/g, '-')
      .replace(/\s+/g, ' ')
      .trim() || 'Unnamed Customer';
  }

  function folderPathForLead(lead) {
    if (lead?.folderPathOverride) return lead.folderPathOverride;
    return `${customerRootPath}\\${safeFolderName(lead?.name)}`;
  }

  function commandForLead(lead) {
    const customerName = safeFolderName(lead?.name);
    const escapedName = customerName.replace(/"/g, '`"');
    return `powershell -NoProfile -ExecutionPolicy Bypass -File "${builderScriptPath}" -CustomerName "${escapedName}"`;
  }

  function ensurePanel() {
    injectStyles();
    const workspace = document.querySelector('#dialog-folder-workspace');
    if (!workspace) return null;

    let panel = document.getElementById(panelId);
    if (panel) return panel;

    panel = document.createElement('section');
    panel.id = panelId;
    panel.className = 'folder-command-polish';
    panel.innerHTML = `
      <strong>Create customer folder</strong>
      <span>This is the PowerShell command for creating the standard folder setup under CUSTOMERS using the current lead name.</span>
      <code id="folder-command-polish-code"></code>
      <div class="lead-actions">
        <button class="button primary" type="button" id="copy-folder-create-command-button">Copy folder creation command</button>
        <button class="button secondary" type="button" id="copy-folder-create-path-button">Copy folder path</button>
      </div>
      <p class="folder-command-polish-message" id="folder-command-polish-message">Copy the command, paste it into PowerShell, and run it only after you decide this is a real customer folder.</p>
    `;

    const heading = workspace.querySelector('.folder-heading');
    if (heading) heading.insertAdjacentElement('afterend', panel);
    else workspace.prepend(panel);

    panel.querySelector('#copy-folder-create-command-button')?.addEventListener('click', () => copyValue(commandForLead(getActiveLead()), 'Command copied.'));
    panel.querySelector('#copy-folder-create-path-button')?.addEventListener('click', () => copyValue(folderPathForLead(getActiveLead()), 'Folder path copied.'));
    return panel;
  }

  async function copyValue(value, successMessage) {
    const message = document.querySelector('#folder-command-polish-message');
    try {
      await navigator.clipboard.writeText(value);
      if (message) message.textContent = successMessage;
    } catch (_error) {
      if (message) message.textContent = 'Copy failed. Select the text and copy it manually.';
    }
  }

  function renderPanel() {
    const lead = getActiveLead();
    const panel = ensurePanel();
    if (!panel || !lead) return;

    const code = panel.querySelector('#folder-command-polish-code');
    const message = panel.querySelector('#folder-command-polish-message');
    if (code) code.textContent = commandForLead(lead);
    if (message) message.textContent = `Planned folder: ${folderPathForLead(lead)}`;
  }

  function hookShowLead() {
    let ready = false;
    try {
      if (typeof showLead === 'function') {
        ready = true;
        if (!showLead.__folderCommandPolished) {
          const originalShowLead = showLead;
          showLead = function folderCommandShowLead(...args) {
            const result = originalShowLead.apply(this, args);
            window.setTimeout(renderPanel, 120);
            return result;
          };
          showLead.__folderCommandPolished = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function boot() {
    const ready = hookShowLead();
    renderPanel();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.lead-card-button, #mark-qualified-button, #move-next-button, #mark-spam-button')) {
      window.setTimeout(renderPanel, 160);
    }
  });
  window.addEventListener('breeze-private-leads', () => window.setTimeout(renderPanel, 0));
  window.addEventListener('breeze-lead-stage-changed', () => window.setTimeout(renderPanel, 120));
  window.addEventListener('load', () => window.setTimeout(boot, 0));
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else window.setTimeout(boot, 0);
})();
