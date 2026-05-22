(() => {
  const storageKey = 'breezeWebsitePerformanceSnapshot';
  const tableName = 'seo_snapshots';

  const fieldMap = {
    visitors: 'visitors_28d',
    visitorsPerDay: 'visitors_per_day',
    leads7: 'leads_7d',
    leads28: 'leads_28d',
    clicks: 'search_clicks_28d',
    impressions: 'search_impressions_28d',
    ctr: 'search_ctr',
    position: 'average_position',
    indexed: 'indexed_pages',
    notIndexed: 'not_indexed_pages'
  };

  const goalMeta = {
    'Leads per week': { key: 'leads7', target: 5 },
    'Visitors per day': { key: 'visitorsPerDay', target: 30 },
    'Search clicks, 28 days': { key: 'clicks', target: 80 },
    'Average position': { key: 'position', target: 10, inverse: true }
  };

  function cleanNumber(value, decimals = 0) {
    if (value === null || value === undefined || value === '') return '';
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    return decimals ? number.toFixed(decimals).replace(/\.0+$/, '') : Math.round(number).toLocaleString();
  }

  function dateLabel(value) {
    if (!value) return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function normalize(row) {
    const snapshot = {};
    Object.entries(fieldMap).forEach(([key, source]) => {
      if (key === 'ctr') snapshot[key] = row[source] === null || row[source] === undefined || row[source] === '' ? '' : `${cleanNumber(row[source], 2)}%`;
      else if (key === 'visitorsPerDay' || key === 'position') snapshot[key] = cleanNumber(row[source], 2);
      else snapshot[key] = cleanNumber(row[source]);
    });
    snapshot.lastChecked = dateLabel(row.checked_on || row.created_at);
    snapshot.notes = row.notes || 'Auto-loaded from the private daily SEO snapshot table.';
    snapshot.waActiveUsers = cleanNumber(row.wa_active_users_28d);
    snapshot.waSessions = cleanNumber(row.wa_sessions_28d);
    snapshot.waEngagedSessions = cleanNumber(row.wa_engaged_sessions_28d);
    snapshot.waEngagementRate = row.wa_engagement_rate === null || row.wa_engagement_rate === undefined ? '' : `${cleanNumber(row.wa_engagement_rate, 2)}%`;
    snapshot.waAverageSessionDuration = formatDuration(row.wa_average_session_duration);
    snapshot.organicSearchSessions = cleanNumber(row.organic_search_sessions_28d);
    snapshot.topCities = Array.isArray(row.top_cities) ? row.top_cities : [];
    snapshot.topPages = Array.isArray(row.top_pages) ? row.top_pages : [];
    snapshot.source = row.source || 'manual';
    snapshot.syncedAt = row.synced_at ? dateLabel(row.synced_at) : '';
    return snapshot;
  }

  function numberFrom(value) {
    const parsed = Number(String(value || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function percentOf(value, target, inverse = false) {
    const current = numberFrom(value);
    if (!current || !target) return 0;
    const percent = inverse ? (target / current) * 100 : (current / target) * 100;
    return Math.max(0, Math.min(100, Math.round(percent)));
  }

  function percentFor(meta, snapshot) {
    return percentOf(snapshot[meta.key], meta.target, meta.inverse);
  }

  function setInput(form, name, value) {
    const input = form?.elements?.[name];
    if (input) input.value = value || '';
  }

  function updateMetric(label, value) {
    document.querySelectorAll('.health-metric').forEach((metric) => {
      const metricLabel = metric.querySelector('span')?.textContent?.trim();
      if (metricLabel === label) {
        const target = metric.querySelector('strong');
        if (target) target.textContent = value || 'Pending';
      }
    });
  }

  function updateGoals(snapshot) {
    document.querySelectorAll('.goal-card').forEach((card) => {
      const label = card.querySelector('.goal-topline span:first-child')?.textContent?.trim();
      const meta = goalMeta[label];
      if (!meta) return;
      const percent = percentFor(meta, snapshot);
      const strong = card.querySelector('strong');
      const percentLabel = card.querySelector('.goal-topline span:last-child');
      const fill = card.querySelector('.goal-fill');
      if (strong) strong.textContent = `${snapshot[meta.key] || '0'} / ${meta.target}`;
      if (percentLabel) percentLabel.textContent = `${percent}%`;
      if (fill) fill.style.width = `${percent}%`;
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDuration(value) {
    const seconds = Math.round(Number(value) || 0);
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    if (!minutes) return `${remainder}s`;
    return `${minutes}m ${remainder.toString().padStart(2, '0')}s`;
  }

  function injectHeartbeatStyles() {
    if (document.getElementById('seo-heartbeat-styles')) return;
    const style = document.createElement('style');
    style.id = 'seo-heartbeat-styles';
    style.textContent = `
      .seo-heartbeat { display: grid; gap: 18px; }
      .heartbeat-top { display: grid; grid-template-columns: minmax(260px, .72fr) minmax(0, 1.28fr); gap: 18px; align-items: stretch; }
      .heartbeat-card { border: 1px solid var(--line); border-radius: 8px; background: var(--white); box-shadow: var(--shadow); overflow: hidden; }
      .heartbeat-card-inner { display: grid; gap: 14px; padding: 18px; }
      .heartbeat-card h3, .heartbeat-card h4 { margin: 0; line-height: 1.1; }
      .heartbeat-card p { margin: 0; color: var(--muted); font-weight: 750; }
      .heartbeat-score-card { color: var(--white); background: radial-gradient(circle at 20% 10%, rgba(73, 147, 255, .46), transparent 32%), linear-gradient(135deg, var(--ink), #0b3e91); }
      .heartbeat-score-card .eyebrow, .heartbeat-score-card p { color: #d7e7ff; }
      .heartbeat-score-wrap { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 18px; align-items: center; }
      .heartbeat-ring { width: 148px; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%; background: conic-gradient(#77b6ff calc(var(--score) * 1%), rgba(255,255,255,.18) 0); }
      .heartbeat-ring::before { content: ''; grid-area: 1 / 1; width: 112px; aspect-ratio: 1; border-radius: 50%; background: #102039; }
      .heartbeat-ring strong { grid-area: 1 / 1; z-index: 1; font-size: 2.1rem; line-height: 1; }
      .heartbeat-pill-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .heartbeat-pill { min-height: 32px; display: inline-flex; align-items: center; padding: 0 10px; border-radius: 999px; color: #d7e7ff; background: rgba(255,255,255,.12); font-weight: 900; }
      .heartbeat-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
      .heartbeat-kpi { display: grid; gap: 7px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #f8fbff; }
      .heartbeat-kpi span { color: var(--muted); font-size: .78rem; font-weight: 900; text-transform: uppercase; }
      .heartbeat-kpi strong { font-size: 1.55rem; line-height: 1; }
      .heartbeat-kpi small { color: var(--muted); font-weight: 800; }
      .heartbeat-chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
      .heartbeat-bars { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
      .heartbeat-bar-row { display: grid; gap: 7px; }
      .heartbeat-bar-label { display: flex; justify-content: space-between; gap: 12px; font-weight: 900; }
      .heartbeat-bar-label span:last-child { color: var(--muted); white-space: nowrap; }
      .heartbeat-track { height: 10px; border-radius: 999px; background: #dce8f8; overflow: hidden; }
      .heartbeat-fill { height: 100%; min-width: 2px; border-radius: inherit; background: linear-gradient(90deg, var(--blue), var(--blue-dark)); }
      .heartbeat-page-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .heartbeat-page-link { color: var(--blue-dark); font-size: .85rem; font-weight: 900; text-decoration: none; }
      .heartbeat-funnel { display: grid; gap: 10px; }
      .heartbeat-funnel-step { display: grid; grid-template-columns: 120px 1fr 70px; gap: 12px; align-items: center; }
      .heartbeat-funnel-step strong { color: var(--ink); }
      .heartbeat-funnel-step span { color: var(--muted); font-weight: 900; text-align: right; }
      .heartbeat-watch { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
      .heartbeat-watch article { display: grid; gap: 7px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: var(--soft); }
      .heartbeat-watch strong { color: var(--ink); }
      .heartbeat-watch span { color: var(--muted); font-weight: 750; }
      @media (max-width: 1120px) { .heartbeat-top, .heartbeat-chart-grid { grid-template-columns: 1fr; } .heartbeat-kpis, .heartbeat-watch { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 720px) { .heartbeat-score-wrap, .heartbeat-kpis, .heartbeat-watch, .heartbeat-funnel-step { grid-template-columns: 1fr; } .heartbeat-funnel-step span { text-align: left; } }
    `;
    document.head.append(style);
  }

  function heartbeatScore(snapshot) {
    const traffic = percentOf(snapshot.visitorsPerDay, 30);
    const leads = percentOf(snapshot.leads7, 5);
    const organic = percentOf(snapshot.organicSearchSessions || snapshot.clicks, 80);
    const engagement = percentOf(snapshot.waEngagementRate, 35);
    const score = Math.round((traffic * 0.3) + (leads * 0.35) + (organic * 0.2) + (engagement * 0.15));
    return Math.max(0, Math.min(100, score));
  }

  function kpi(label, value, detail) {
    return `<article class="heartbeat-kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || 'Pending')}</strong><small>${escapeHtml(detail || '')}</small></article>`;
  }

  function barRows(items, valueKey, labelKey, detailFactory) {
    const cleanItems = items.filter(Boolean).slice(0, 7);
    if (!cleanItems.length) return '<li class="heartbeat-bar-row"><strong>Waiting for data</strong><p>No synced rows yet.</p></li>';
    const max = Math.max(...cleanItems.map((item) => numberFrom(item[valueKey])), 1);
    return cleanItems.map((item) => {
      const value = numberFrom(item[valueKey]);
      const width = Math.max(4, Math.round((value / max) * 100));
      const label = item[labelKey] || 'Not set';
      const detail = detailFactory ? detailFactory(item) : `${cleanNumber(value)} sessions`;
      return `
        <li class="heartbeat-bar-row">
          <div class="heartbeat-bar-label"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(detail)}</span></div>
          <div class="heartbeat-track" aria-hidden="true"><div class="heartbeat-fill" style="width:${width}%"></div></div>
        </li>
      `;
    }).join('');
  }

  function pageRows(pages) {
    const cleanPages = pages.filter(Boolean).slice(0, 7);
    if (!cleanPages.length) return '<li class="heartbeat-bar-row"><strong>Waiting for data</strong><p>No landing page data synced yet.</p></li>';
    const max = Math.max(...cleanPages.map((page) => numberFrom(page.sessions)), 1);
    return cleanPages.map((page) => {
      const sessions = numberFrom(page.sessions);
      const width = Math.max(4, Math.round((sessions / max) * 100));
      const title = page.title || page.path || 'Untitled page';
      const path = page.path || '/';
      return `
        <li class="heartbeat-bar-row">
          <div class="heartbeat-bar-label"><strong class="heartbeat-page-title">${escapeHtml(title)}</strong><span>${escapeHtml(cleanNumber(sessions))} sessions</span></div>
          <a class="heartbeat-page-link" href="${escapeHtml(path)}" target="_blank" rel="noopener">${escapeHtml(path)}</a>
          <div class="heartbeat-track" aria-hidden="true"><div class="heartbeat-fill" style="width:${width}%"></div></div>
        </li>
      `;
    }).join('');
  }

  function funnelStep(label, value, max) {
    const width = Math.max(4, Math.round((numberFrom(value) / Math.max(max, 1)) * 100));
    return `
      <div class="heartbeat-funnel-step">
        <strong>${escapeHtml(label)}</strong>
        <div class="heartbeat-track" aria-hidden="true"><div class="heartbeat-fill" style="width:${width}%"></div></div>
        <span>${escapeHtml(value || '0')}</span>
      </div>
    `;
  }

  function watchCards(snapshot) {
    const cards = [];
    if (percentOf(snapshot.visitorsPerDay, 30) < 100) cards.push(['Traffic gap', 'Daily WA traffic is still below the 30 visitors/day goal. Keep building indexed local pages and internal links.']);
    if (percentOf(snapshot.leads7, 5) < 100) cards.push(['Lead pace', 'Lead flow is below the 5/week goal. Watch estimate-form starts, calls, and top landing pages.']);
    if (percentOf(snapshot.waEngagementRate, 35) < 100) cards.push(['Engagement', 'Engagement is under the healthy local-service target. Improve above-the-fold clarity and page-to-form paths.']);
    if (cards.length < 3) cards.push(['Next SEO move', 'Use Search Console to find pages with impressions but low clicks, then improve the title and meta description.']);
    return cards.slice(0, 3).map(([title, body]) => `<article><strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span></article>`).join('');
  }

  function renderWebsiteHeartbeat(snapshot) {
    const hero = document.querySelector('#performance-tab .performance-hero');
    if (!hero) return;
    injectHeartbeatStyles();

    document.querySelector('#seo-local-pulse')?.remove();
    let section = document.querySelector('#seo-website-heartbeat');
    if (!section) {
      section = document.createElement('section');
      section.id = 'seo-website-heartbeat';
      section.className = 'seo-heartbeat';
      hero.insertAdjacentElement('afterend', section);
    }

    const score = heartbeatScore(snapshot);
    const maxFunnel = Math.max(numberFrom(snapshot.waUsers), numberFrom(snapshot.waSessions), numberFrom(snapshot.waActiveUsers), numberFrom(snapshot.leads28), 1);
    const sourceLabel = snapshot.source === 'ga4-auto' ? 'GA4 daily sync' : 'Supabase snapshot';

    section.innerHTML = `
      <section class="heartbeat-top">
        <article class="heartbeat-card heartbeat-score-card">
          <div class="heartbeat-card-inner">
            <p class="eyebrow">Website Heartbeat</p>
            <div class="heartbeat-score-wrap">
              <div class="heartbeat-ring" style="--score:${score}"><strong>${score}</strong></div>
              <div>
                <h3>Local growth pulse</h3>
                <p>${escapeHtml(sourceLabel)} loaded ${escapeHtml(snapshot.syncedAt || snapshot.lastChecked)}. This score blends lead pace, visitor pace, organic search, and engagement.</p>
              </div>
            </div>
            <div class="heartbeat-pill-row">
              <span class="heartbeat-pill">Goal: 5 leads/week</span>
              <span class="heartbeat-pill">Goal: 30 visitors/day</span>
            </div>
          </div>
        </article>
        <article class="heartbeat-card">
          <div class="heartbeat-card-inner">
            <p class="eyebrow">Key Signals</p>
            <h3>What changed in the last 28 days</h3>
            <div class="heartbeat-kpis">
              ${kpi('WA users', snapshot.waActiveUsers || snapshot.visitors, 'Local users')}
              ${kpi('WA sessions', snapshot.waSessions, 'Local sessions')}
              ${kpi('Organic search', snapshot.organicSearchSessions || snapshot.clicks, 'Search-driven visits')}
              ${kpi('Engagement', snapshot.waEngagementRate, snapshot.waAverageSessionDuration ? `Avg. ${snapshot.waAverageSessionDuration}` : 'Local engagement')}
            </div>
          </div>
        </article>
      </section>

      <section class="heartbeat-chart-grid">
        <article class="heartbeat-card">
          <div class="heartbeat-card-inner">
            <p class="eyebrow">Local Demand</p>
            <h3>Top Washington cities</h3>
            <ul class="heartbeat-bars">${barRows(snapshot.topCities || [], 'activeUsers', 'city', (city) => `${cleanNumber(city.activeUsers)} users / ${cleanNumber(city.sessions)} sessions`)}</ul>
          </div>
        </article>
        <article class="heartbeat-card">
          <div class="heartbeat-card-inner">
            <p class="eyebrow">Landing Pages</p>
            <h3>Pages pulling traffic</h3>
            <ul class="heartbeat-bars">${pageRows(snapshot.topPages || [])}</ul>
          </div>
        </article>
      </section>

      <section class="heartbeat-chart-grid">
        <article class="heartbeat-card">
          <div class="heartbeat-card-inner">
            <p class="eyebrow">Conversion Path</p>
            <h3>Visitor-to-lead funnel</h3>
            <div class="heartbeat-funnel">
              ${funnelStep('WA users', snapshot.waActiveUsers || snapshot.visitors, maxFunnel)}
              ${funnelStep('WA sessions', snapshot.waSessions, maxFunnel)}
              ${funnelStep('Engaged', snapshot.waEngagedSessions, maxFunnel)}
              ${funnelStep('Leads, 28d', snapshot.leads28, maxFunnel)}
            </div>
          </div>
        </article>
        <article class="heartbeat-card">
          <div class="heartbeat-card-inner">
            <p class="eyebrow">Attention Needed</p>
            <h3>Next decisions</h3>
            <div class="heartbeat-watch">${watchCards(snapshot)}</div>
          </div>
        </article>
      </section>
    `;
  }

  function showStatus(snapshot) {
    const hero = document.querySelector('.seo-hero-card .performance-card-inner');
    if (!hero) return;
    let note = document.querySelector('#seo-auto-sync-status');
    if (!note) {
      note = document.createElement('p');
      note.id = 'seo-auto-sync-status';
      note.className = 'status-note';
      const heading = hero.querySelector('h2');
      heading?.insertAdjacentElement('afterend', note);
    }
    const sourceLabel = snapshot.source === 'ga4-auto' ? 'GA4 daily sync' : 'Supabase snapshot';
    note.textContent = `${sourceLabel} loaded for ${snapshot.lastChecked}.`;
  }

  function applySnapshot(snapshot) {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));

    const form = document.querySelector('#performance-snapshot-form');
    Object.keys(snapshot).forEach((key) => setInput(form, key, snapshot[key]));

    updateMetric('Visitors, 28 days', snapshot.visitors);
    updateMetric('Leads, 7 days', snapshot.leads7);
    updateMetric('Search clicks', snapshot.clicks);
    updateMetric('Avg. position', snapshot.position);
    updateMetric('Indexed', snapshot.indexed);
    updateMetric('Not indexed', snapshot.notIndexed);
    updateMetric('Last checked', snapshot.lastChecked);
    updateMetric('CTR', snapshot.ctr);
    updateGoals(snapshot);
    renderWebsiteHeartbeat(snapshot);
    showStatus(snapshot);
  }

  async function loadLatestSnapshot() {
    const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
    if (!client) return;

    const { data, error } = await client
      .from(tableName)
      .select('*')
      .order('checked_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return;
    applySnapshot(normalize(data));
  }

  function scheduleLoad() {
    window.setTimeout(loadLatestSnapshot, 500);
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', scheduleLoad, { once: true });
  else scheduleLoad();
  window.addEventListener('breeze-private-leads', scheduleLoad);
})();