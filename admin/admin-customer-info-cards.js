(() => {
  const styleId = 'customer-info-card-styles';
  let attempts = 0;

  function injectStyles() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .lead-card-full-info {
        display: grid;
        gap: 6px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba(20, 32, 51, 0.12);
      }
      .lead-info-row {
        display: grid;
        grid-template-columns: 70px 1fr;
        gap: 8px;
        align-items: start;
        color: #142033;
        font-size: 0.78rem;
        line-height: 1.35;
      }
      .lead-info-row strong {
        color: #526173;
        font-size: 0.72rem;
        font-weight: 900;
        text-transform: uppercase;
      }
      .lead-info-row span {
        min-width: 0;
        overflow-wrap: anywhere;
        color: #142033;
        font-weight: 850;
      }
      .lead-info-row.is-muted span {
        color: #697789;
      }
      .lead-card-button .lead-meta,
      .lead-card-button .lead-project,
      .lead-card-button .lead-next {
        overflow-wrap: anywhere;
      }
      @media (max-width: 720px) {
        .lead-info-row {
          grid-template-columns: 1fr;
          gap: 2px;
        }
      }
    `;
    document.head.append(style);
  }

  function getLeads() {
    try {
      if (Array.isArray(leads)) return leads;
    } catch (_error) {}
    return window.BREEZE_PRIVATE_ADMIN_LEADS || [];
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function displayValue(value) {
    const text = String(value || '').trim();
    if (!text) return 'Not entered';
    return text;
  }

  function row(label, value) {
    const clean = displayValue(value);
    const muted = clean === 'Not entered' || /^stored privately/i.test(clean) || /^stored in private/i.test(clean);
    return `
      <div class="lead-info-row${muted ? ' is-muted' : ''}">
        <strong>${label}</strong>
        <span>${clean}</span>
      </div>
    `;
  }

  function enrichCards() {
    injectStyles();
    const allLeads = getLeads();
    if (!allLeads.length) return false;

    document.querySelectorAll('.lead-card').forEach((card) => {
      const name = card.querySelector('.lead-name')?.textContent?.trim();
      if (!name) return;
      const lead = allLeads.find((item) => normalize(item.name) === normalize(name));
      if (!lead) return;

      const button = card.querySelector('.lead-card-button');
      if (!button) return;

      let info = button.querySelector('.lead-card-full-info');
      if (!info) {
        info = document.createElement('div');
        info.className = 'lead-card-full-info';
        button.append(info);
      }

      const contact = [lead.phone, lead.email].filter(Boolean).join(' / ');
      const address = lead.address || [lead.addressLine, lead.city].filter(Boolean).join(' - ');
      info.innerHTML = [
        row('Contact', contact),
        row('Address', address),
        row('Person', lead.contactPerson),
        row('Next', lead.nextStep)
      ].join('');
    });
    return true;
  }

  function hookRender() {
    let ready = false;
    try {
      if (typeof renderAll === 'function') {
        ready = true;
        if (!renderAll.__customerInfoCards) {
          const originalRenderAll = renderAll;
          renderAll = function customerInfoCardsRenderAll(...args) {
            const result = originalRenderAll.apply(this, args);
            window.setTimeout(enrichCards, 0);
            window.setTimeout(enrichCards, 120);
            return result;
          };
          renderAll.__customerInfoCards = true;
        }
      }
    } catch (_error) {}
    return ready;
  }

  function boot() {
    const ready = hookRender();
    enrichCards();
    if (!ready && attempts < 30) {
      attempts += 1;
      window.setTimeout(boot, 200);
    }
  }

  document.addEventListener('input', (event) => {
    if (event.target.matches('#lead-search')) window.setTimeout(enrichCards, 0);
  });
  document.addEventListener('change', (event) => {
    if (event.target.matches('#stage-filter, #dialog-status-select')) window.setTimeout(enrichCards, 0);
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('#mark-qualified-button, #move-next-button, #mark-spam-button')) {
      window.setTimeout(enrichCards, 160);
    }
  });
  window.addEventListener('breeze-private-leads', () => window.setTimeout(enrichCards, 0));
  window.addEventListener('breeze-lead-stage-changed', () => window.setTimeout(enrichCards, 0));
  window.addEventListener('load', () => window.setTimeout(boot, 0));
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else window.setTimeout(boot, 0);
})();
