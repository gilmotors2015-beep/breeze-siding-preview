(() => {
  const storageKey = 'breezeWebsitePerformanceSnapshot';
  const defaultSnapshot = {
    visitors: '',
    clicks: '',
    impressions: '',
    position: '',
    indexed: '',
    notIndexed: '',
    lastChecked: '',
    notes: ''
  };

  const quickLinks = [
    ['Live site', 'https://breezesiding.com/'],
    ['PageSpeed Insights', 'https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fbreezesiding.com%2F'],
    ['Search Console', 'https://search.google.com/search-console'],
    ['Google Analytics', 'https://analytics.google.com/'],
    ['Sitemap', 'https://breezesiding.com/sitemap.xml']
  ];

  const keywordTargets = [
    {
      keyword: 'siding replacement seattle',
      page: '/siding-replacement-seattle.html',
      intent: 'Location page',
      plan: 'Primary city ranking target. Watch impressions first, then improve copy/internal links if position stalls.'
    },
    {
      keyword: 'siding contractor tacoma',
      page: '/siding-replacement-tacoma.html',
      intent: 'Location page',
      plan: 'High-value local service target. Keep Tacoma signals strong in headings, FAQs, and service-area links.'
    },
    {
      keyword: 'james hardie siding installer',
      page: '/siding-replacement.html',
      intent: 'Service page',
      plan: 'Homepage/service authority target. Add proof, project examples, and supporting blog links over time.'
    }
  ];

  const checklist = [
    ['Weekly', 'Check Search Console sitemap and indexing status.'],
    ['Weekly', 'Review top queries, clicks, impressions, and average position.'],
    ['Weekly', 'Run PageSpeed mobile and desktop after any visual or form changes.'],
    ['Monthly', 'Pick one strong page and improve internal links, FAQ copy, or project proof.'],
    ['Monthly', 'Look for backlink opportunities from suppliers, directories, partners, and completed projects.']
  ];

  function readSnapshot() {
    try {
      return { ...defaultSnapshot, ...JSON.parse(window.localStorage.getItem(storageKey) || '{}') };
    } catch (_error) {
      return { ...defaultSnapshot };
    }
  }

  function saveSnapshot(snapshot) {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function injectStyles() {
    if (document.getElementById('performance-dashboard-styles')) return;
    const style = document.createElement('style');
    style.id = 'performance-dashboard-styles';
    style.textContent = `
      .performance-dashboard { display: grid; gap: 18px; }
      .performance-hero { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, .8fr); gap: 18px; align-items: stretch; }
      .performance-card { border: 1px solid var(--line); border-radius: 8px; background: var(--white); box-shadow: var(--shadow); overflow: hidden; }
      .performance-card-inner { display: grid; gap: 12px; padding: 18px; }
      .performance-card h2, .performance-card h3 { margin: 0; line-height: 1.1; }
      .performance-card p { margin: 0; color: var(--muted); font-weight: 750; }
      .health-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
      .health-metric { display: grid; gap: 6px; padding: 14px; border: 1px solid var(--line); border-radius: 7px; background: var(--soft); }
      .health-metric span { color: var(--muted); font-size: .78rem; font-weight: 900; text-transform: uppercase; }
      .health-metric strong { font-size: 1.65rem; line-height: 1; }
      .quick-link-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .quick-link-grid a { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 12px; border: 1px solid var(--line); border-radius: 6px; color: var(--ink); background: var(--white); font-weight: 900; text-decoration: none; }
      .quick-link-grid a:first-child { color: var(--white); background: var(--blue); border-color: var(--blue); }
      .snapshot-form { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
      .snapshot-form label { display: grid; gap: 6px; font-weight: 900; }
      .snapshot-form .wide { grid-column: 1 / -1; }
      .snapshot-save-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; grid-column: 1 / -1; }
      .snapshot-message { margin: 0; color: var(--green); font-weight: 900; }
      .keyword-dashboard-table { width: 100%; min-width: 820px; border-collapse: collapse; }
      .keyword-dashboard-table th, .keyword-dashboard-table td { padding: 14px 16px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
      .keyword-dashboard-table th { color: var(--muted); font-size: .78rem; text-transform: uppercase; }
      .keyword-dashboard-table td:first-child { font-weight: 900; }
      .page-pill { display: inline-flex; min-height: 30px; align-items: center; padding: 0 9px; border-radius: 999px; color: var(--blue-dark); background: #e8f1ff; font-weight: 900; }
      .performance-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, .8fr); gap: 18px; }
      .performance-list { display: grid; gap: 10px; padding: 0; margin: 0; list-style: none; }
      .performance-list li { display: grid; grid-template-columns: 92px 1fr; gap: 12px; padding: 12px; border: 1px solid var(--line); border-radius: 7px; background: var(--soft); }
      .performance-list strong { color: var(--blue-dark); }
      .status-note { border-left: 4px solid var(--blue); padding: 12px 14px; background: #f8fbff; border-radius: 6px; }
      @media (max-width: 1040px) { .performance-hero, .performance-split, .health-grid, .snapshot-form { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 720px) { .performance-hero, .performance-split, .health-grid, .snapshot-form, .quick-link-grid { grid-template-columns: 1fr; } }
    `;
    document.head.append(style);
  }

  function metric(label, value, fallback = 'Pending') {
    const clean = String(value || '').trim();
    return `<article class="health-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(clean || fallback)}</strong></article>`;
  }

  function render(snapshot = readSnapshot()) {
    const tab = document.querySelector('#performance-tab');
    if (!tab) return;

    injectStyles();
    tab.innerHTML = `
      <section class="performance-dashboard" aria-label="Website performance dashboard">
        <section class="performance-hero">
          <article class="performance-card">
            <div class="performance-card-inner">
              <p class="eyebrow">Website Performance</p>
              <h2>Search, traffic, and ranking command center</h2>
              <p>This dashboard keeps the website health workflow separate from the lead pipeline. Until the Google integrations are connected directly, use the fields below as a quick weekly snapshot from Search Console and Analytics.</p>
              <div class="health-grid">
                ${metric('Visitors', snapshot.visitors)}
                ${metric('Clicks', snapshot.clicks)}
                ${metric('Impressions', snapshot.impressions)}
                ${metric('Avg. position', snapshot.position)}
              </div>
            </div>
          </article>
          <article class="performance-card">
            <div class="performance-card-inner">
              <p class="eyebrow">Quick Links</p>
              <h3>Open the tools</h3>
              <div class="quick-link-grid">
                ${quickLinks.map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`).join('')}
              </div>
              <p class="status-note">Best daily signal: leads are being captured. Best weekly signal: clicks, impressions, and indexed pages are moving in the right direction.</p>
            </div>
          </article>
        </section>

        <article class="performance-card">
          <div class="performance-card-inner">
            <p class="eyebrow">Weekly Snapshot</p>
            <h3>Manual performance markers</h3>
            <form class="snapshot-form" id="performance-snapshot-form">
              <label>Visitors<input name="visitors" value="${escapeHtml(snapshot.visitors)}" inputmode="numeric" placeholder="GA visitors"></label>
              <label>Search clicks<input name="clicks" value="${escapeHtml(snapshot.clicks)}" inputmode="numeric" placeholder="GSC clicks"></label>
              <label>Impressions<input name="impressions" value="${escapeHtml(snapshot.impressions)}" inputmode="numeric" placeholder="GSC impressions"></label>
              <label>Avg. position<input name="position" value="${escapeHtml(snapshot.position)}" inputmode="decimal" placeholder="GSC position"></label>
              <label>Indexed pages<input name="indexed" value="${escapeHtml(snapshot.indexed)}" inputmode="numeric" placeholder="Indexed"></label>
              <label>Not indexed<input name="notIndexed" value="${escapeHtml(snapshot.notIndexed)}" inputmode="numeric" placeholder="Not indexed"></label>
              <label>Last checked<input name="lastChecked" value="${escapeHtml(snapshot.lastChecked)}" placeholder="May 13, 2026"></label>
              <label class="wide">Notes<textarea name="notes" rows="3" placeholder="Indexing issues, keyword movement, pages to improve next...">${escapeHtml(snapshot.notes)}</textarea></label>
              <div class="snapshot-save-row">
                <button class="button primary" type="submit">Save snapshot</button>
                <p class="snapshot-message" id="snapshot-message" aria-live="polite"></p>
              </div>
            </form>
          </div>
        </article>

        <article class="performance-card">
          <div class="performance-card-inner">
            <p class="eyebrow">Keyword Tracking</p>
            <h3>Primary ranking targets</h3>
            <div class="table-wrap">
              <table class="keyword-dashboard-table">
                <thead><tr><th>Keyword</th><th>Best page</th><th>Use</th><th>Plan</th></tr></thead>
                <tbody>
                  ${keywordTargets.map((target) => `<tr><td>${escapeHtml(target.keyword)}</td><td><span class="page-pill">${escapeHtml(target.page)}</span></td><td>${escapeHtml(target.intent)}</td><td>${escapeHtml(target.plan)}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <section class="performance-split">
          <article class="performance-card">
            <div class="performance-card-inner">
              <p class="eyebrow">Search Console</p>
              <h3>Indexing watch list</h3>
              <div class="health-grid">
                ${metric('Indexed', snapshot.indexed)}
                ${metric('Not indexed', snapshot.notIndexed)}
              </div>
              <p>Focus first on pages that are valuable for customers and search: homepage, siding replacement, Tacoma, Seattle, Bellevue, and the strongest blog posts. Tag pages and old WordPress leftovers are low priority unless they are getting impressions.</p>
            </div>
          </article>
          <article class="performance-card">
            <div class="performance-card-inner">
              <p class="eyebrow">Routine</p>
              <h3>Simple operating rhythm</h3>
              <ul class="performance-list">
                ${checklist.map(([cadence, item]) => `<li><strong>${escapeHtml(cadence)}</strong><span>${escapeHtml(item)}</span></li>`).join('')}
              </ul>
            </div>
          </article>
        </section>
      </section>
    `;

    const form = document.querySelector('#performance-snapshot-form');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const updated = { ...defaultSnapshot };
      Object.keys(updated).forEach((key) => { updated[key] = String(data.get(key) || '').trim(); });
      saveSnapshot(updated);
      const message = document.querySelector('#snapshot-message');
      if (message) message.textContent = 'Snapshot saved on this device.';
      render(updated);
    });
  }

  function boot() {
    render();
    window.addEventListener('storage', (event) => {
      if (event.key === storageKey) render();
    });
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
