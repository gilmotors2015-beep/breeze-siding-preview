(() => {
  const hiddenKey = 'breezeHiddenLeadIds';

  function hiddenLeadIds() {
    try {
      return new Set(JSON.parse(window.localStorage.getItem(hiddenKey) || '[]'));
    } catch (_error) {
      return new Set();
    }
  }

  function canAccessDashboardState() {
    try {
      return Array.isArray(leads) && Array.isArray(customerRecords) && typeof renderAll === 'function';
    } catch (_error) {
      return false;
    }
  }

  function normalizedName(value) {
    return String(value || '').trim().toLowerCase();
  }

  function mergeCurrentCustomerRecords() {
    if (!canAccessDashboardState()) return false;

    const hiddenIds = hiddenLeadIds();
    const seenIds = new Set(leads.map((lead) => String(lead.id || '')));
    const seenNames = new Set(leads.map((lead) => normalizedName(lead.name)));
    const missingCurrentRecords = customerRecords.filter((lead) => {
      const id = String(lead.id || '');
      const name = normalizedName(lead.name);
      return !hiddenIds.has(id) && !seenIds.has(id) && !seenNames.has(name);
    });

    if (!missingCurrentRecords.length) return true;
    leads = [...leads, ...missingCurrentRecords];
    renderAll();
    return true;
  }

  function retryMerge(attempt = 0) {
    const complete = mergeCurrentCustomerRecords();
    if (!complete && attempt < 25) {
      window.setTimeout(() => retryMerge(attempt + 1), 160);
    }
  }

  window.addEventListener('breeze-private-leads', () => window.setTimeout(retryMerge, 0));
  window.addEventListener('breeze-static-lead-hidden', () => window.setTimeout(retryMerge, 0));
  window.addEventListener('load', () => retryMerge());
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => retryMerge(), { once: true });
  } else {
    retryMerge();
  }
})();
