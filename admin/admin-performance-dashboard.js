(() => {
  const storageKey = 'breezeWebsitePerformanceSnapshot';
  const baseline = {
    visitors: '441',
    visitorsPerDay: '15.75',
    leads7: '4',
    leads28: '8',
    clicks: '39',
    impressions: '31,807',
    ctr: '0.12%',
    position: '14.2',
    indexed: '35',
    notIndexed: '',
    lastChecked: 'May 17, 2026',
    notes: 'Baseline from GA4 and Search Console before the current SEO recovery and location-page expansion work.'
  };
  const defaultSnapshot = { ...baseline };

  const goals = [
    {
      label: 'Leads per week',
      currentKey: 'leads7',
      target: 5,
      suffix: '',
      detail: 'Primary business goal. Watch form leads, calls, and qualified estimate requests together.'
    },
    {
      label: 'Visitors per day',
      currentKey: 'visitorsPerDay',
      target: 30,
      suffix: '',
      detail: 'Traffic goal. GA4 baseline was about 15.75 active users per day over 28 days.'
    },
    {
      label: 'Search clicks, 28 days',
      currentKey: 'clicks',
      target: 80,
      suffix: '',
      detail: 'Near-term organic growth target from a 39-click baseline.'
    },
    {
      label: 'Average position',
      currentKey: 'position',
      target: 10,
      suffix: '',
      inverse: true,
      detail: 'Lower is better. Top 10 average position means more keywords are entering page-one territory.'
    }
  ];

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
      intent: 'City landing page',
      plan: 'Watch impressions after the rebuild. Improve CTR with the title/meta if impressions rise before clicks.'
    },
    {
      keyword: 'siding contractor tacoma',
      page: '/siding-replacement-tacoma.html',
      intent: 'City landing page',
      plan: 'Track Tacoma impressions and calls. Add more Tacoma proof if traffic appears but leads lag.'
    },
    {
      keyword: 'siding replacement puyallup',
      page: '/siding-replacement-puyallup.html',
      intent: 'Core service area',
      plan: 'Important local market. Keep internal links from homepage, service pages, and nearby city pages strong.'
    },
    {
      keyword: 'james hardie siding installer',
      page: '/siding-replacement.html',
      intent: 'Service authority',
      plan: 'Support with Hardie, fiber cement, rot, and materials resource articles.'
    },
    {
      keyword: 'hardie board siding cost',
      page: '/cost-of-james-hardie-siding-per-square-foot/',
      intent: 'Research / buyer education',
      plan: 'Use this as an entry point into estimate requests and service pages.'
    }
  ];

  const priorityPages = [
    ['Homepage', '/', 'Conversion hub', 'Keep hero, trust bar, and estimate form stable. Watch leads and engagement.'],
    ['Siding service', '/siding-replacement.html', 'Core money page', 'Use internal links from blog posts and location pages.'],
    ['Seattle', '/siding-replacement-seattle.html', 'Priority city', 'Watch indexed status, clicks, and CTR.'],
    ['Tacoma', '/siding-replacement-tacoma.html', 'Priority city', 'Watch impressions and call quality.'],
    ['Puyallup', '/siding-replacement-puyallup.html', 'Home market', 'Strengthen local trust and service-area relevance.'],
    ['Bellevue', '/siding-replacement-bellevue.html', 'High-value market', 'Use high-end imagery and premium material language.'],
    ['Clyde Hill', '/clyde-hill-siding-replacement-contractor/', 'High-end market', 'Keep luxury exterior language and project proof tight.'],
    ['Issaquah', '/siding-replacement-issaquah.html', 'New batch city', 'Watch whether Google discovers and indexes quickly.'],
    ['Cost resource', '/cost-of-james-hardie-siding-per-square-foot/', 'Research page', 'Route readers to estimate form and Hardie service page.'],
    ['Dry rot', '/cost-to-fix-dry-rot/', 'Problem-aware page', 'Connect rot concerns to siding replacement and repairs.']
  ];

  const checklist = [
    ['Daily', 'Check new leads, source quality, and any unusual traffic changes.'],
    ['Weekly', 'Update this snapshot from GA4 and Search Console.'],
    ['Weekly', 'Look for pages with rising impressions but weak clicks. Improve title/meta first.'],
    ['Biweekly', 'Pick one priority page and improve internal links, FAQ copy, project proof, or local details.'],
    ['Monthly', 'Review indexing, sitemap coverage, top queries, and conversion rate against the 5-leads/week goal.']
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

  function numberFrom(value) {
    const parsed = Number(String(value || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function percentFor(goal, snapshot) {
    const current = numberFrom(snapshot[goal.currentKey]);
    if (!current || !goal.target) return 0;
    if (goal.inverse) return Math.max(0, Math.min(100, Math.round((goal.target / current) * 100)));
    return Math.max(0, Math.min(100, Math.round((current / goal.target) * 100)));
  }

  function todayLabel() {
    return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function injectStyles() {
    if (document.getElementById('performance-dashboard-styles')) return;
    const style = document.createElement('style');
    style.id = 'performance-dashboard-styles';
    style.textContent = `
      .performance-dashboard { display: grid; gap: 18px; }
      .performance-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(300px, .9fr); gap: 18px; align-items: stretch; }
      .performance-card { border: 1px solid var(--line); border-radius: 8px; background: var(--white); box-shadow: var(--shadow); overflow: hidden; }
      .performance-card-inner { display: grid; gap: 14px; padding: 18px; }
      .performance-card h2, .performance-card h3 { margin: 0; line-height: 1.1; }
      .performance-card p { margin: 0; color: var(--muted); font-weight: 750; }
      .seo-hero-card { color: var(--white); background: linear-gradient(135deg, var(--ink), #0b3e91); }
      .seo-hero-card .eyebrow, .seo-hero-card p { color: #d7e7ff; }
      .seo-hero-card h2 { max-width: 740px; font-size: clamp(2rem, 4vw, 3.7rem); }
      .health-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
      .health-metric { display: grid; gap: 6px; padding: 14px; border: 1px solid var(--line); border-radius: 7px; background: var(--soft); }
      .seo-hero-card .health-metric { border-color: rgba(255,255,255,.18); background: rgba(255,255,255,.08); }
      .health-metric span { color: var(--muted); font-size: .78rem; font-weight: 900; text-transform: uppercase; }
      .seo-hero-card .health-metric span { color: #b7d3ff; }
      .health-metric strong { font-size: 1.65rem; line-height: 1; }
      .quick-link-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .quick-link-grid a { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 12px; border: 1px solid var(--line); border-radius: 6px; color: var(--ink); background: var(--white); font-weight: 900; text-decoration: none; }
      .quick-link-grid a:first-child { color: var(--white); background: var(--blue); border-color: var(--blue); }
      .goal-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
      .goal-card { display: grid; gap: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #f8fbff; }
      .goal-card strong { font-size: 1.4rem; line-height: 1; }
      .goal-topline { display: flex; justify-content: space-between; gap: 12px; color: var(--muted); font-size: .78rem; font-weight: 900; text-transform: uppercase; }
      .goal-track { height: 9px; border-radius: 999px; background: #dce8f8; overflow: hidden; }
      .goal-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--blue), var(--blue-dark)); }
      .snapshot-form { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
      .snapshot-form label { display: grid; gap: 6px; font-weight: 900; }
      .snapshot-form .wide { grid-column: 1 / -1; }
      .snapshot-save-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; grid-column: 1 / -1; }
      .snapshot-message { margin: 0; color: var(--green); font-weight: 900; }
      .keyword-dashboard-table { width: 100%; min-width: 900px; border-collapse: collapse; }
      .keyword-dashboard-table th, .keyword-dashboard-table td { padding: 14px 16px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
      .keyword-dashboard-table th { color: var(--muted); font-size: .78rem; text-transform: uppercase; }
      .keyword-dashboard-table td:first-child { font-weight: 900; }
      .page-pill { display: inline-flex; min-height: 30px; align-items: center; padding: 0 9px; border-radius: 999px; color: var(--blue-dark); background: #e8f1ff; font-weight: 900; text-decoration: none; }
      .performance-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, .8fr); gap: 18px; }
      .performance-list { display: grid; gap: 10px; padding: 0; margin: 0; list-style: none; }
      .performance-list li { display: grid; grid-template-columns: 92px 1fr; gap: 12px; padding: 12px; border: 1px solid var(--line); border-radius: 7px; background: var(--soft); }
      .performance-list strong { color: var(--blue-dark); }
      .status-note { border-left: 4px solid var(--blue); padding: 12px 14px; background: #f8fbff; border-radius: 6px; }
      @media (max-width: 1120px) { .performance-hero, .performance-split { grid-template-columns: 1fr; } .health-grid, .goal-grid, .snapshot-form { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 720px) { .health-grid, .goal-grid, .snapshot-form, .quick-link-grid, .performance-list li { grid-template-columns: 1fr; } }
    `;
    document.head.append(style);
  }

  function metric(label, value, fallback = 'Pending') {
    const clean = String(value || '').trim();
    return `<article class="health-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(clean || fallback)}</strong></article>`;
  }

  function goalCard(goal, snapshot) {
    const current = String(snapshot[goal.currentKey] || '').trim() || '0';
    const percent = percentFor(goal, snapshot);
    return `
      <article class="goal-card">
        <div class="goal-topline"><span>${escapeHtml(goal.label)}</span><span>${percent}%</span></div>
        <strong>${escapeHtml(current)} / ${escapeHtml(goal.target)}${escapeHtml(goal.suffix || '')}</strong>
        <div class="goal-track" aria-hidden="true"><div class="goal-fill" style="width:${percent}%"></div></div>
        <p>${escapeHtml(goal.detail)}</p>
      </article>
    `;
  }

  function render(snapshot = readSnapshot()) {
    const tab = document.querySelector('#performance-tab');
    if (!tab) return;

    injectStyles();
    tab.innerHTML = `
      <section class="performance-dashboard" aria-label="Website performance dashboard">
        <section class="performance-hero">
          <article class="performance-card seo-hero-card">
            <div class="performance-card-inner">
              <p class="eyebrow">SEO Tracker</p>
              <h2>Traffic, rankings, and lead goals in one place.</h2>
              <p>Use this as the working scorecard for the next phase: grow to 30+ daily visitors, 5+ leads per week, and stronger rankings for service-area pages.</p>
              <div class="health-grid">
                ${metric('Visitors, 28 days', snapshot.visitors)}
                ${metric('Leads, 7 days', snapshot.leads7)}
                ${metric('Search clicks', snapshot.clicks)}
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
              <p class="status-note">Latest baseline: ${escapeHtml(snapshot.clicks || baseline.clicks)} clicks from ${escapeHtml(snapshot.impressions || baseline.impressions)} impressions, ${escapeHtml(snapshot.ctr || baseline.ctr)} CTR, and ${escapeHtml(snapshot.leads7 || baseline.leads7)} leads in 7 days.</p>
            </div>
          </article>
        </section>

        <article class="performance-card">
          <div class="performance-card-inner">
            <p class="eyebrow">Goal Progress</p>
            <h3>What we are trying to move</h3>
            <div class="goal-grid">
              ${goals.map((goal) => goalCard(goal, snapshot)).join('')}
            </div>
          </div>
        </article>

        <article class="performance-card">
          <div class="performance-card-inner">
            <p class="eyebrow">Weekly Snapshot</p>
            <h3>Update from GA4 and Search Console</h3>
            <form class="snapshot-form" id="performance-snapshot-form">
              <label>Visitors, 28 days<input name="visitors" value="${escapeHtml(snapshot.visitors)}" inputmode="numeric" placeholder="GA visitors"></label>
              <label>Visitors per day<input name="visitorsPerDay" value="${escapeHtml(snapshot.visitorsPerDay)}" inputmode="decimal" placeholder="30 goal"></label>
              <label>Leads, 7 days<input name="leads7" value="${escapeHtml(snapshot.leads7)}" inputmode="numeric" placeholder="5 goal"></label>
              <label>Leads, 28 days<input name="leads28" value="${escapeHtml(snapshot.leads28)}" inputmode="numeric" placeholder="Monthly leads"></label>
              <label>Search clicks<input name="clicks" value="${escapeHtml(snapshot.clicks)}" inputmode="numeric" placeholder="GSC clicks"></label>
              <label>Impressions<input name="impressions" value="${escapeHtml(snapshot.impressions)}" inputmode="numeric" placeholder="GSC impressions"></label>
              <label>CTR<input name="ctr" value="${escapeHtml(snapshot.ctr)}" inputmode="decimal" placeholder="GSC CTR"></label>
              <label>Avg. position<input name="position" value="${escapeHtml(snapshot.position)}" inputmode="decimal" placeholder="GSC position"></label>
              <label>Indexed pages<input name="indexed" value="${escapeHtml(snapshot.indexed)}" inputmode="numeric" placeholder="Indexed"></label>
              <label>Not indexed<input name="notIndexed" value="${escapeHtml(snapshot.notIndexed)}" inputmode="numeric" placeholder="Not indexed"></label>
              <label>Last checked<input name="lastChecked" value="${escapeHtml(snapshot.lastChecked)}" placeholder="${todayLabel()}"></label>
              <label class="wide">Notes<textarea name="notes" rows="3" placeholder="Indexing issues, keyword movement, pages to improve next...">${escapeHtml(snapshot.notes)}</textarea></label>
              <div class="snapshot-save-row">
                <button class="button primary" type="submit">Save snapshot</button>
                <button class="button secondary" id="reset-baseline" type="button">Reset to baseline</button>
                <p class="snapshot-message" id="snapshot-message" aria-live="polite"></p>
              </div>
            </form>
          </div>
        </article>

        <article class="performance-card">
          <div class="performance-card-inner">
            <p class="eyebrow">Priority Pages</p>
            <h3>Pages to watch after sitemap submission</h3>
            <div class="table-wrap">
              <table class="keyword-dashboard-table">
                <thead><tr><th>Page</th><th>URL</th><th>Role</th><th>What to watch</th></tr></thead>
                <tbody>
                  ${priorityPages.map(([label, page, role, watch]) => `<tr><td>${escapeHtml(label)}</td><td><a class="page-pill" href="${escapeHtml(page)}" target="_blank" rel="noopener">${escapeHtml(page)}</a></td><td>${escapeHtml(role)}</td><td>${escapeHtml(watch)}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
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
                  ${keywordTargets.map((target) => `<tr><td>${escapeHtml(target.keyword)}</td><td><a class="page-pill" href="${escapeHtml(target.page)}" target="_blank" rel="noopener">${escapeHtml(target.page)}</a></td><td>${escapeHtml(target.intent)}</td><td>${escapeHtml(target.plan)}</td></tr>`).join('')}
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
                ${metric('Last checked', snapshot.lastChecked)}
                ${metric('CTR', snapshot.ctr)}
              </div>
              <p>Focus first on pages that can bring real customers: homepage, siding replacement, Tacoma, Seattle, Puyallup, Bellevue, Clyde Hill, Issaquah, and the strongest resource posts. Tag pages and old archive-style URLs are lower priority unless they are earning impressions.</p>
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
      render(updated);
      const message = document.querySelector('#snapshot-message');
      if (message) message.textContent = 'Snapshot saved on this device.';
    });

    document.querySelector('#reset-baseline')?.addEventListener('click', () => {
      saveSnapshot(baseline);
      render(baseline);
      const message = document.querySelector('#snapshot-message');
      if (message) message.textContent = 'Baseline restored.';
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
