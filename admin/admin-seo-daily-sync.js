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

  function percentFor(meta, snapshot) {
    const current = numberFrom(snapshot[meta.key]);
    if (!current || !meta.target) return 0;
    const percent = meta.inverse ? (meta.target / current) * 100 : (current / meta.target) * 100;
    return Math.max(0, Math.min(100, Math.round(percent)));
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

  function miniMetric(label, value, detail) {
    return `<article class="health-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || 'Pending')}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ''}</article>`;
  }

  function cityRows(cities) {
    if (!cities.length) return '<li><strong>Waiting</strong><span>No city data synced yet.</span></li>';
    return cities.slice(0, 8).map((city) => {
      const label = city.city || 'Not set';
      const users = cleanNumber(city.activeUsers);
      const sessions = cleanNumber(city.sessions);
      const rate = city.engagementRate || city.engagementRate === 0 ? `${cleanNumber(city.engagementRate, 2)}%` : 'Pending';
      return `<li><strong>${escapeHtml(label)}</strong><span>${escapeHtml(users)} users, ${escapeHtml(sessions)} sessions, ${escapeHtml(rate)} engagement</span></li>`;
    }).join('');
  }

  function pageRows(pages) {
    if (!pages.length) return '<li><strong>Waiting</strong><span>No landing page data synced yet.</span></li>';
    return pages.slice(0, 8).map((page) => {
      const path = page.path || '/';
      const title = page.title || path;
      const users = cleanNumber(page.activeUsers);
      const sessions = cleanNumber(page.sessions);
      return `<li><strong>${escapeHtml(title)}</strong><span><a href="${escapeHtml(path)}" target="_blank" rel="noopener">${escapeHtml(path)}</a> - ${escapeHtml(users)} users, ${escapeHtml(sessions)} sessions</span></li>`;
    }).join('');
  }

  function renderLocalPulse(snapshot) {
    const hero = document.querySelector('#performance-tab .performance-hero');
    if (!hero) return;

    let card = document.querySelector('#seo-local-pulse');
    if (!card) {
      card = document.createElement('article');
      card.id = 'seo-local-pulse';
      card.className = 'performance-card';
      hero.insertAdjacentElement('afterend', card);
    }

    card.innerHTML = `
      <div class="performance-card-inner">
        <p class="eyebrow">Local Traffic Pulse</p>
        <h3>Washington visitors that matter most</h3>
        <div class="health-grid">
          ${miniMetric('WA users', snapshot.waActiveUsers || snapshot.visitors, 'Last 28 days')}
          ${miniMetric('WA sessions', snapshot.waSessions, 'Last 28 days')}
          ${miniMetric('Organic Search', snapshot.organicSearchSessions || snapshot.clicks, 'WA sessions')}
          ${miniMetric('Engagement', snapshot.waEngagementRate, snapshot.waAverageSessionDuration ? `Avg. ${snapshot.waAverageSessionDuration}` : '')}
        </div>
        <section class="performance-split">
          <div>
            <p class="eyebrow">Top WA Cities</p>
            <ul class="performance-list">${cityRows(snapshot.topCities || [])}</ul>
          </div>
          <div>
            <p class="eyebrow">Top WA Landing Pages</p>
            <ul class="performance-list">${pageRows(snapshot.topPages || [])}</ul>
          </div>
        </section>
      </div>
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
    renderLocalPulse(snapshot);
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