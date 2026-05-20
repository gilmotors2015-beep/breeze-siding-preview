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

  function showStatus(snapshot) {
    const hero = document.querySelector('.seo-hero-card .performance-card-inner');
    if (!hero || document.querySelector('#seo-auto-sync-status')) return;
    const note = document.createElement('p');
    note.id = 'seo-auto-sync-status';
    note.className = 'status-note';
    note.textContent = `Auto-updated from Supabase on ${snapshot.lastChecked}.`;
    const heading = hero.querySelector('h2');
    heading?.insertAdjacentElement('afterend', note);
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
    window.setTimeout(loadLatestSnapshot, 400);
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', scheduleLoad, { once: true });
  else scheduleLoad();
  window.addEventListener('breeze-private-leads', scheduleLoad);
})();
