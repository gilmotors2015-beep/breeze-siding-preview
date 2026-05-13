(() => {
  const followUpTemplatePath = 'D:\\OneDrive\\Breeze Siding documents\\Marketing\\emails\\Templates\\Website Style OFT\\Follow up - website style.oft';
  const followUpCommand = `Start-Process -FilePath '${followUpTemplatePath.replace(/'/g, "''")}'`;

  function todayDateString() {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  }

  function hasStoredEstimateDate(lead) {
    const value = String(lead?.estimateDate || '').trim();
    if (!value || /proposal|stored|not/i.test(value)) return false;
    return !Number.isNaN(new Date(value).getTime());
  }

  function currentStage() {
    const label = document.querySelector('#dialog-stage')?.textContent?.trim().toLowerCase() || '';
    return label === 'estimate sent' ? 'estimate-sent' : label;
  }

  function bridge() {
    return window.BREEZE_PRIVATE_ADMIN_BRIDGE || null;
  }

  async function saveEstimateDate(lead, estimateDate) {
    const client = bridge()?.client;
    if (!client || !lead?.id || String(lead.id).startsWith('manual-')) return;

    const { error } = await client
      .from('leads')
      .update({
        estimate_date: estimateDate,
        next_step: 'Follow up on the proposal. Light check-in at 2 days; full follow-up at 5 days.'
      })
      .eq('id', lead.id);

    if (!error) await bridge()?.loadLeads?.();
  }

  function addFollowUpTemplateButton() {
    if (currentStage() !== 'estimate-sent') return;

    const buttons = document.querySelector('#next-step-action-buttons');
    if (!buttons || buttons.querySelector('#copy-follow-up-template-command')) return;

    const button = document.createElement('button');
    button.className = 'button secondary';
    button.id = 'copy-follow-up-template-command';
    button.type = 'button';
    button.textContent = 'Copy follow-up email command';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(followUpCommand);
        button.textContent = 'Copied follow-up command';
      } catch {
        button.textContent = 'Copy failed';
      }
    });
    buttons.prepend(button);
  }

  function hookPersistStage() {
    if (typeof persistStage !== 'function') {
      window.setTimeout(hookPersistStage, 150);
      return;
    }
    if (persistStage.isEstimateDateEnhanced) return;

    const originalPersistStage = persistStage;
    const enhancedPersistStage = async function enhancedEstimateDatePersistStage(lead, stage) {
      let estimateDate = null;
      if (stage === 'estimate-sent' && lead && !hasStoredEstimateDate(lead)) {
        estimateDate = todayDateString();
        lead.estimateDate = estimateDate;
        lead.nextStep = 'Follow up on the proposal. Light check-in at 2 days; full follow-up at 5 days.';
      }

      const result = await originalPersistStage(lead, stage);
      if (estimateDate) await saveEstimateDate(lead, estimateDate);
      window.setTimeout(addFollowUpTemplateButton, 50);
      return result;
    };

    enhancedPersistStage.isEstimateDateEnhanced = true;
    persistStage = enhancedPersistStage;
  }

  function init() {
    hookPersistStage();
    document.addEventListener('click', (event) => {
      if (event.target.closest('.lead-card-button, #move-next-button, #mark-qualified-button')) {
        window.setTimeout(addFollowUpTemplateButton, 150);
      }
    });
    document.addEventListener('change', (event) => {
      if (event.target.matches('#stage-filter')) {
        window.setTimeout(addFollowUpTemplateButton, 150);
      }
    });
    window.setTimeout(addFollowUpTemplateButton, 700);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
