(() => {
  const tableName = 'seo_snapshots';
  const chartId = 'seo-28-day-history';
  const controlsId = 'seo-dashboard-module-controls';
  const visibilityKey = 'breezePerformanceDashboardModules';
  const seriesKey = 'breezePerformanceChartSeries';

  const seriesConfig = [
    { key: 'localVisitors', label: 'Local WA visitors', color: '#1769d8', fallbackKey: 'wa_active_users_28d' },
    { key: 'organicSearch', label: 'Organic search', color: '#0f8f72', fallbackKey: 'organic_search_sessions_28d' },
    { key: 'localDemand', label: 'Local Demand', color: '#b56b00', fallbackKey: 'wa_engaged_sessions_28d' },
    { key: 'searchClicks', label: 'Search Console clicks', color: '#6544cc', fallbackKey: 'search_clicks_28d' }
  ];

  const moduleConfig = [
    { key: 'overview', label: 'Summary cards' },
    { key: 'history', label: '28-day history' },
    { key: 'cities', label: 'City demand' },
    { key: 'landing-pages', label: 'Landing pages' },
    { key: 'conversion', label: 'Conversion flow' },
    { key: 'next-moves', label: 'Next moves' }
  ];

  const visibleSeries = new Set(loadList(seriesKey, seriesConfig.map((item) => item.key)));
  const visibleModules = new Set(loadList(visibilityKey, moduleConfig.map((item) => item.key)));
  let latestSnapshot = null;
  let latestRows = [];

  function loadList(key, fallback) {
    try {
      const stored = JSON.parse(window.localStorage.getItem(key) || 'null');
      return Array.isArray(stored) && stored.length ? stored : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function saveList(key, values) {
    window.localStorage.setItem(key, JSON.stringify(Array.from(values)));
  }

  function numberFrom(value) {
    const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatNumber(value, decimals = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '0';
    return decimals ? number.toFixed(decimals).replace(/\.0+$/, '') : Math.round(number).toLocaleString();
  }

  function percentChange(values) {
    const clean = values.map(numberFrom).filter((value) => Number.isFinite(value));
    if (clean.length < 2) return 0;
    const first = clean[0] || 1;
    const last = clean[clean.length - 1] || 0;
    return Math.round(((last - first) / first) * 100);
  }

  function dateLabel(value) {
    if (!value) return '';
    const clean = String(value).includes('-') ? String(value) : `${String(value).slice(0, 4)}-${String(value).slice(4, 6)}-${String(value).slice(6, 8)}`;
    return new Date(`${clean}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function injectStyles() {
    if (document.getElementById('seo-trend-chart-styles')) return;
    const style = document.createElement('style');
    style.id = 'seo-trend-chart-styles';
    style.textContent = `
      #performance-snapshot-form { display: none !important; }
      .seo-snapshot-visual-note { display: grid; gap: 10px; padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(135deg, #f8fbff, #ffffff); }
      .seo-snapshot-visual-note p { margin: 0; color: var(--muted); font-weight: 800; }
      .seo-snapshot-visual-note strong { color: var(--ink); font-size: 1.05rem; }
      .seo-module-controls { margin: 18px 0; }
      .seo-module-controls .heartbeat-card-inner { gap: 14px; }
      .seo-toggle-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; }
      .seo-toggle { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 42px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; background: #f8fbff; cursor: pointer; }
      .seo-toggle span { color: var(--ink); font-size: .84rem; font-weight: 850; }
      .seo-toggle input { position: absolute; opacity: 0; pointer-events: none; }
      .seo-switch { position: relative; width: 40px; height: 22px; flex: 0 0 auto; border-radius: 999px; background: #b9c7d8; transition: background .18s ease; }
      .seo-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(16, 27, 46, .22); transition: transform .18s ease; }
      .seo-toggle input:checked + .seo-switch { background: var(--blue); }
      .seo-toggle input:checked + .seo-switch::after { transform: translateX(18px); }
      .seo-history-panel { display: grid; gap: 14px; margin: 18px 0; }
      .seo-history-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; }
      .seo-history-heading h3 { margin: 0; line-height: 1.1; }
      .seo-history-heading p { margin: 0; color: var(--muted); font-weight: 750; }
      .seo-series-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
      .seo-series-chip { position: relative; display: grid; gap: 6px; min-height: 78px; padding: 11px; border: 1px solid var(--line); border-radius: 8px; background: #f8fbff; cursor: pointer; }
      .seo-series-chip.is-off { opacity: .45; }
      .seo-series-chip input { position: absolute; opacity: 0; pointer-events: none; }
      .seo-series-chip span { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: .74rem; font-weight: 900; text-transform: uppercase; }
      .seo-series-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--series-color); }
      .seo-series-chip strong { color: var(--ink); font-size: 1.45rem; line-height: 1; }
      .seo-series-chip small { color: var(--muted); font-weight: 850; }
      .seo-series-chip .seo-positive { color: #0f8f72; }
      .seo-series-chip .seo-negative { color: #b42318; }
      .seo-chart-wrap { min-height: 390px; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(180deg, #f8fbff, #fff); overflow: hidden; }
      .seo-history-svg { display: block; width: 100%; height: 390px; }
      .seo-chart-grid-line { stroke: #dbe6f2; stroke-width: 1; }
      .seo-chart-axis-text { fill: #6a7688; font-size: 12px; font-weight: 800; }
      .seo-chart-line { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
      .seo-chart-area { opacity: .08; }
      .seo-history-empty { min-height: 220px; display: grid; place-items: center; padding: 24px; text-align: center; color: var(--muted); font-weight: 850; }
      @media (max-width: 1180px) { .seo-toggle-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .seo-series-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (max-width: 720px) { .seo-history-heading { display: grid; } .seo-toggle-grid, .seo-series-grid { grid-template-columns: 1fr; } .seo-chart-wrap { min-height: 300px; } .seo-history-svg { height: 300px; } }
    `;
    document.head.append(style);
  }

  function replaceManualSnapshot() {
    const form = document.querySelector('#performance-snapshot-form');
    if (!form || document.querySelector('#seo-snapshot-visual-note')) return;
    const note = document.createElement('div');
    note.id = 'seo-snapshot-visual-note';
    note.className = 'seo-snapshot-visual-note';
    note.innerHTML = '<strong>Numbers are now tracked automatically.</strong><p>The dashboard now emphasizes the heartbeat, 28-day history, and modular sections. The manual baseline grid is still preserved behind the scenes.</p>';
    form.insertAdjacentElement('beforebegin', note);
  }

  function normalizePoint(point) {
    return {
      date: point.date || point.checked_on || point.created_at,
      localVisitors: numberFrom(point.localVisitors ?? point.local_visitors ?? point.activeUsers ?? point.wa_active_users),
      organicSearch: numberFrom(point.organicSearch ?? point.organic_search ?? point.organicSessions ?? point.organic_search_sessions),
      localDemand: numberFrom(point.localDemand ?? point.local_demand ?? point.demand ?? point.engagedSessions),
      searchClicks: numberFrom(point.searchClicks ?? point.search_clicks ?? point.clicks)
    };
  }

  function dailySeriesFromSnapshot(snapshot) {
    const raw = snapshot?.daily_series || snapshot?.dailySeries || [];
    if (Array.isArray(raw) && raw.length) return raw.map(normalizePoint).filter((point) => point.date).slice(-28);
    return [];
  }

  function fallbackRows(rows) {
    return rows.map((row) => ({
      date: row.checked_on || row.created_at,
      localVisitors: numberFrom(row.wa_active_users_28d || row.visitors_28d),
      organicSearch: numberFrom(row.organic_search_sessions_28d || row.search_clicks_28d),
      localDemand: numberFrom(row.wa_engaged_sessions_28d || row.leads_28d),
      searchClicks: numberFrom(row.search_clicks_28d)
    })).reverse();
  }

  function seriesValues(rows, key) {
    return rows.map((row) => numberFrom(row[key]));
  }

  function metricHasData(rows, key) {
    return rows.some((row) => {
      const value = row[key];
      return value !== null && value !== undefined && value !== '' && numberFrom(value) > 0;
    });
  }

  function metricTotal(rows, key) {
    return rows.reduce((total, row) => total + numberFrom(row[key]), 0);
  }

  function firstHalfSecondHalfChange(values) {
    const clean = values.map(numberFrom);
    if (clean.length < 4 || clean.every((value) => value === 0)) return null;
    const midpoint = Math.max(1, Math.floor(clean.length / 2));
    const first = clean.slice(0, midpoint).reduce((total, value) => total + value, 0);
    const second = clean.slice(midpoint).reduce((total, value) => total + value, 0);
    if (!first && !second) return null;
    if (!first) return 100;
    return Math.round(((second - first) / first) * 100);
  }

  function latestSnapshotValue(item) {
    if (!latestSnapshot || !item.fallbackKey) return 0;
    return numberFrom(latestSnapshot[item.fallbackKey]);
  }

  function metricSummary(rows, item) {
    const values = seriesValues(rows, item.key);
    const total = metricTotal(rows, item.key);
    const fallback = latestSnapshotValue(item);
    const hasDailyData = metricHasData(rows, item.key);
    const hasFallbackData = fallback > 0;

    if (item.key === 'searchClicks' && !hasDailyData && !hasFallbackData) {
      return { value: 'Pending', note: 'Search Console not synced yet', tone: 'neutral' };
    }

    const value = hasDailyData ? total : fallback;
    const change = firstHalfSecondHalfChange(values);
    const note = change === null
      ? (hasDailyData ? '28-day total' : 'Latest synced value')
      : `${change >= 0 ? '+' : ''}${formatNumber(change)}% vs prior half`;
    const tone = change === null ? 'neutral' : change >= 0 ? 'positive' : 'negative';

    return { value: formatNumber(value), note, tone };
  }

  function pointPath(values, width, height, padding, maxValue) {
    if (values.length < 2) return '';
    return values.map((value, index) => {
      const x = padding.left + (index / (values.length - 1)) * (width - padding.left - padding.right);
      const y = height - padding.bottom - (value / maxValue) * (height - padding.top - padding.bottom);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  function renderSeriesControls(rows) {
    return seriesConfig.map((item) => {
      const summary = metricSummary(rows, item);
      const className = summary.tone === 'positive' ? 'seo-positive' : summary.tone === 'negative' ? 'seo-negative' : '';
      return `
        <label class="seo-series-chip ${visibleSeries.has(item.key) ? '' : 'is-off'}" style="--series-color:${item.color}">
          <input type="checkbox" data-seo-series="${escapeHtml(item.key)}" ${visibleSeries.has(item.key) ? 'checked' : ''}>
          <span><i class="seo-series-dot"></i>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(summary.value)}</strong>
          <small class="${className}">${escapeHtml(summary.note)}</small>
        </label>
      `;
    }).join('');
  }

  function renderMainChart(rows) {
    const active = seriesConfig.filter((item) => visibleSeries.has(item.key));
    if (rows.length < 2 || !active.length) {
      return '<div class="seo-history-empty">The full 28-day graph will populate after the next daily sync saves day-by-day history.</div>';
    }

    const width = 1120;
    const height = 390;
    const padding = { top: 32, right: 32, bottom: 46, left: 46 };
    const maxValue = Math.max(...active.flatMap((item) => seriesValues(rows, item.key)), 10);
    const grid = [0, .25, .5, .75, 1].map((ratio) => {
      const y = height - padding.bottom - ratio * (height - padding.top - padding.bottom);
      const label = Math.round(ratio * maxValue);
      return `<line class="seo-chart-grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line><text class="seo-chart-axis-text" x="12" y="${y + 4}">${label}</text>`;
    }).join('');

    const labelIndexes = rows.length <= 7
      ? rows.map((_row, index) => index)
      : [0, Math.floor(rows.length * .18), Math.floor(rows.length * .36), Math.floor(rows.length * .54), Math.floor(rows.length * .72), rows.length - 1];

    const dateLabels = labelIndexes.map((index) => {
      const x = padding.left + (index / (rows.length - 1)) * (width - padding.left - padding.right);
      return `<text class="seo-chart-axis-text" x="${x}" y="${height - 14}" text-anchor="middle">${escapeHtml(dateLabel(rows[index]?.date))}</text>`;
    }).join('');

    const paths = active.map((item) => {
      const points = pointPath(seriesValues(rows, item.key), width, height, padding, maxValue);
      const area = `${padding.left},${height - padding.bottom} ${points} ${width - padding.right},${height - padding.bottom}`;
      return `<polyline class="seo-chart-area" points="${area}" fill="${item.color}"></polyline><polyline class="seo-chart-line" points="${points}" stroke="${item.color}"></polyline>`;
    }).join('');

    return `<svg class="seo-history-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="28-day website performance chart">${grid}${dateLabels}${paths}</svg>`;
  }

  function renderModuleControls() {
    const heartbeat = document.querySelector('#seo-website-heartbeat');
    const chart = document.getElementById(chartId);
    const anchor = heartbeat || chart || document.querySelector('#performance-tab .performance-hero');
    if (!anchor) return;

    let controls = document.getElementById(controlsId);
    if (!controls) {
      controls = document.createElement('section');
      controls.id = controlsId;
      controls.className = 'heartbeat-card seo-module-controls';
      anchor.insertAdjacentElement('beforebegin', controls);
    }

    controls.innerHTML = `
      <div class="heartbeat-card-inner">
        <div class="seo-history-heading">
          <div>
            <p class="eyebrow">View Controls</p>
            <h3>Dashboard modules</h3>
          </div>
          <p>Hide the sections you do not need today.</p>
        </div>
        <div class="seo-toggle-grid">
          ${moduleConfig.map((item) => `
            <label class="seo-toggle">
              <span>${escapeHtml(item.label)}</span>
              <input type="checkbox" data-seo-module="${escapeHtml(item.key)}" ${visibleModules.has(item.key) ? 'checked' : ''}>
              <i class="seo-switch"></i>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  function applyModuleTargets() {
    const heartbeat = document.querySelector('#seo-website-heartbeat');
    if (heartbeat) {
      heartbeat.querySelector('.heartbeat-top')?.setAttribute('data-seo-module-target', 'overview');
      const grids = heartbeat.querySelectorAll('.heartbeat-chart-grid');
      grids[0]?.children?.[0]?.setAttribute('data-seo-module-target', 'cities');
      grids[0]?.children?.[1]?.setAttribute('data-seo-module-target', 'landing-pages');
      grids[1]?.children?.[0]?.setAttribute('data-seo-module-target', 'conversion');
      grids[1]?.children?.[1]?.setAttribute('data-seo-module-target', 'next-moves');
    }
    document.getElementById(chartId)?.setAttribute('data-seo-module-target', 'history');

    moduleConfig.forEach((item) => {
      document.querySelectorAll(`[data-seo-module-target="${item.key}"]`).forEach((element) => {
        element.hidden = !visibleModules.has(item.key);
      });
    });
  }

  function render(rows) {
    injectStyles();
    replaceManualSnapshot();
    const heartbeat = document.querySelector('#seo-website-heartbeat');
    const hero = document.querySelector('#performance-tab .performance-hero');
    const anchor = heartbeat || hero;
    if (!anchor) return;

    let section = document.getElementById(chartId);
    if (!section) {
      section = document.createElement('section');
      section.id = chartId;
      section.className = 'heartbeat-card seo-history-panel';
      const firstGrid = heartbeat?.querySelector('.heartbeat-chart-grid');
      if (firstGrid) firstGrid.insertAdjacentElement('beforebegin', section);
      else anchor.insertAdjacentElement('afterend', section);
    }

    const chartRows = rows.length ? rows : latestRows;
    section.innerHTML = `
      <div class="heartbeat-card-inner">
        <div class="seo-history-heading">
          <div>
            <p class="eyebrow">28-Day History</p>
            <h3>Local visibility and demand</h3>
          </div>
          <p>${chartRows.length > 1 ? 'Select each metric to show or hide its line.' : 'Daily history starts after the next successful sync.'}</p>
        </div>
        <div class="seo-series-grid">${renderSeriesControls(chartRows)}</div>
        <div class="seo-chart-wrap">${renderMainChart(chartRows)}</div>
      </div>
    `;

    renderModuleControls();
    applyModuleTargets();
  }

  async function loadTrendRows() {
    injectStyles();
    replaceManualSnapshot();
    const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
    if (!client) return;

    const { data, error } = await client
      .from(tableName)
      .select('*')
      .order('checked_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !Array.isArray(data) || !data.length) return;
    latestSnapshot = data[0];
    const dailyRows = dailySeriesFromSnapshot(latestSnapshot);
    latestRows = dailyRows.length ? dailyRows : fallbackRows(data);
    render(latestRows);
  }

  function scheduleLoad() {
    window.setTimeout(loadTrendRows, 900);
    window.setTimeout(loadTrendRows, 2200);
    window.setTimeout(loadTrendRows, 3600);
  }

  document.addEventListener('change', (event) => {
    const series = event.target?.dataset?.seoSeries;
    if (series) {
      if (event.target.checked) visibleSeries.add(series);
      else visibleSeries.delete(series);
      if (!visibleSeries.size) visibleSeries.add(series);
      saveList(seriesKey, visibleSeries);
      render(latestRows);
      return;
    }

    const module = event.target?.dataset?.seoModule;
    if (module) {
      if (event.target.checked) visibleModules.add(module);
      else visibleModules.delete(module);
      saveList(visibilityKey, visibleModules);
      applyModuleTargets();
    }
  });

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', scheduleLoad, { once: true });
  else scheduleLoad();
  window.addEventListener('breeze-private-leads', scheduleLoad);
})();