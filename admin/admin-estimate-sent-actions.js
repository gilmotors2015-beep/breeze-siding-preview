(() => {
  function todayDateString() {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  }

  function hasStoredEstimateDate(lead) {
    const value = String(lead?.estimateDate || '').trim();
    if (!value || /proposal|stored|not/i.test(value)) return false;
    return !Number.isNaN(new Date(value).getTime());
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
      return result;
    };

    enhancedPersistStage.isEstimateDateEnhanced = true;
    persistStage = enhancedPersistStage;
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', hookPersistStage, { once: true });
  } else {
    hookPersistStage();
  }
})();
