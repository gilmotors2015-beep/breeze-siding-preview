(() => {
  const tableName = 'seo_snapshots';
  const chartId = 'seo-trend-charts';

  const charts = [
    {
      key: 'localUsers',
      title: 'Local WA Visitors',
      label: '28-day local users',
      color: '#1769d8',
      target: 840
    },
    {
      key: 'leadPace',
      title: 'Lead Pace',
      label: '7-day leads',
      color: '#0f8f72',
      target: 5
    },
    {
      key: 'organicSearch',
      title: 'Organic Search',
      label: '28-day organic sessions',
      color: '#b56b00',
      target: 80
    }
  ];

  function numberFrom(value) {
    const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatNumber(value, decimals = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '0';
    return decimals ? number.toFixed(decimals).replace(/\.0+$/, '') : Math.round(number).toLocaleString();
  }

  function dateLabel(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(row) {
    const localUsers = numberFrom(row.wa_active_users_28d || row.visitors_28d);
    return {
      date: row.checked_on || row.created_at,
      localUsers,
      leadPace: numberFrom(row.leads_7d),
      organicSearch: numberFrom(row.organic_search_sessions_28d || row.search_clicks_28d),
      visitorsPerDay: numberFrom(row.visitors_per_day),
      engagementRate: numberFrom(row.wa_engagement_rate)
    };
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
      .seo-trend-panel { display: grid; gap: 14px; margin: 18px 0; }
      .seo-trend-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; }
      .seo-trend-heading h3 { margin: 0; line-height: 1.1; }
      .seo-trend-heading p { margin: 0; color: var(--muted); font-weight: 750; }
      .seo-trend-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .seo-trend-card { border: 1px solid var(--line); border-radius: 8px; background: var(--white); box-shadow: var(--shadow); overflow: hidden; }
      .seo-trend-card-inner { display: grid; gap: 14px; padding: 16px; }
      .seo-trend-top { display: flex; align-items: start; justify-content: start; gap: 12px; }
      .seo-trend-title { display: grid; gap: 5px; }
      .seo-trend-title h4 { margin: 0; line-height: 1.1; }
      .seo-trend-title span { color: var(--muted); font-size: .78rem; font-weight: 900; text-transform: uppercase; }
      .seo-trend-value { display: none; }
      .seo-trend-current { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 7px; background: #f8fbff; }
      .seo-trend-current span { color: var(--muted); font-size: .74rem; font-weight: 900; text-transform: uppercase; }
      .seo-trend-current strong { color: var(--ink); font-size: 1.05rem; line-height: 1; }
      .seo-trend-current small { font-size: .78rem; font-weight: 850; text-align: right; }
      .seo-trend-svg { width: 100%; height: 150px; border-radius: 8px; background: linear-gradient(180deg, #f8fbff, #ffffff); }
      .seo-trend-meta { display: flex; justify-content: space-between; gap: 12px; color: var(--muted); font-size: .82rem; font-weight: 850; }
      .seo-trend-positive { color: #0f8f72; }
      .seo-trend-negative { color: #b42318; }
      .seo-trend-flat { color: var(--muted); }
      .seo-trend-empty { min-height: 150px; display: grid; place-items: center; border: 1px dashed var(--line); border-radius: 8px; color: var(--muted); text-align: center; font-weight: 850; padding: 20px; }
      @media (max-width: 1120px) { .seo-trend-grid { grid-template-columns: 1fr; } }
      @media (max-width: 720px) { .seo-trend-heading, .seo-trend-top, .seo-trend-meta, .seo-trend-current { display: grid; } .seo-trend-current small { text-align: left; } }
    `;
    document.head.append(style);
  }

  function replaceManualSnapshot() {
    const form = document.querySelector('#performance-snapshot-form');
    if (!form || document.querySelector('#seo-snapshot-visual-note')) return;
    const note = document.createElement('div');
    note.id = 'seo-snapshot-visual-note';
    note.className = 'seo-snapshot-visual-note';
    note.innerHTML = '<strong>Numbers are now tracked automatically.</strong><p>The snapshot is shown as graph trends instead of manual input fields. Daily syncs will make the charts more useful over time.</p>';
    form.insertAdjacentElement('beforebegin', note);
  }

  function buildSparkline(points, color, target) {
    if (points.length < 2) {
      return '<div class="seo-trend-empty">Trend starts after a few daily syncs.</div>';
    }

    const width = 420;
    const height = 150;
    const paddingX = 18;
    const paddingY = 18;
    const values = points.map((point) => point.value);
    const max = Math.max(...values, target || 0, 1);
    const min = Math.min(...values, 0);
    const range = Math.max(max - min, 1);
    const targetY = height - paddingY - (((target || 0) - min) / range) * (height - paddingY * 2);

    const coords = points.map((point, index) => {
      const x = paddingX + (index / Math.max(points.length - 1, 1)) * (width - paddingX * 2);
      const y = height - paddingY - ((point.value - min) / range) * (height - paddingY * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const area = `${paddingX},${height - paddingY} ${coords.join(' ')} ${width - paddingX},${height - paddingY}`;
    const last = coords[coords.length - 1].split(',').map(Number);

    return `
      <svg class="seo-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend chart">
        <line x1="${paddingX}" y1="${targetY.toFixed(1)}" x2="${width - paddingX}" y2="${targetY.toFixed(1)}" stroke="#c9d8ea" stroke-width="2" stroke-dasharray="5 6" />
        <polyline points="${area}" fill="${color}22" stroke="none" />
        <polyline points="${coords.join(' ')}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="5" fill="${color}" />
      </svg>
    `;
  }

  function deltaLabel(current, previous) {
    const delta = current - previous;
    if (!delta) return { text: 'No change yet', className: 'seo-trend-flat' };
    const sign = delta > 0 ? '+' : '';
    return {
      text: `${sign}${formatNumber(delta)} since first snapshot`,
      className: delta > 0 ? 'seo-trend-positive' : 'seo-trend-negative'
    };
  }

  function renderChart(rows, chart) {
    const points = rows.map((row) => ({ date: row.date, value: numberFrom(row[chart.key]) }));
    const current = points.length ? points[points.length - 1].value : 0;
    const first = points.length ? points[0].value : 0;
    const delta = deltaLabel(current, first);
    const firstDate = points.length ? dateLabel(points[0].date) : '';
    const lastDate = points.length ? dateLabel(points[points.length - 1].date) : '';

    return `
      <article class="seo-trend-card">
        <div class="seo-trend-card-inner">
          <div class="seo-trend-top">
            <div class="seo-trend-title">
              <span>${escapeHtml(chart.label)}</span>
              <h4>${escapeHtml(chart.title)}</h4>
            </div>
            <div class="seo-trend-value">
              <strong>${escapeHtml(formatNumber(current))}</strong>
              <span class="${delta.className}">${escapeHtml(delta.text)}</span>
            </div>
          </div>
          ${buildSparkline(points, chart.color, chart.target)}
          <div class="seo-trend-current">
            <span>Current snapshot</span>
            <strong>${escapeHtml(formatNumber(current))}</strong>
            <small class="${delta.className}">${escapeHtml(delta.text)}</small>
          </div>
          <div class="seo-trend-meta"><span>${escapeHtml(firstDate || 'Waiting')}</span><span>Goal marker</span><span>${escapeHtml(lastDate || 'More data soon')}</span></div>
        </div>
      </article>
    `;
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
      section.className = 'heartbeat-card seo-trend-panel';
      const firstGrid = heartbeat?.querySelector('.heartbeat-chart-grid');
      if (firstGrid) firstGrid.insertAdjacentElement('beforebegin', section);
      else anchor.insertAdjacentElement('afterend', section);
    }

    section.innerHTML = `
      <div class="heartbeat-card-inner">
        <div class="seo-trend-heading">
          <div>
            <p class="eyebrow">Daily Trend Charts</p>
            <h3>Are the right numbers moving?</h3>
          </div>
          <p>${rows.length > 1 ? `${rows.length} daily snapshots loaded` : 'The charts will sharpen as daily snapshots build up.'}</p>
        </div>
        <div class="seo-trend-grid">
          ${charts.map((chart) => renderChart(rows, chart)).join('')}
        </div>
      </div>
    `;
  }

  async function loadTrendRows() {
    injectStyles();
    replaceManualSnapshot();
    const client = window.BREEZE_PRIVATE_ADMIN_BRIDGE?.client;
    if (!client) return;

    const { data, error } = await client
      .from(tableName)
      .select('checked_on,created_at,visitors_28d,visitors_per_day,leads_7d,leads_28d,search_clicks_28d,organic_search_sessions_28d,wa_active_users_28d,wa_sessions_28d,wa_engagement_rate')
      .order('checked_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !Array.isArray(data) || !data.length) return;
    render(data.map(normalize).reverse());
  }

  function scheduleLoad() {
    window.setTimeout(loadTrendRows, 900);
    window.setTimeout(loadTrendRows, 2200);
    window.setTimeout(loadTrendRows, 3600);
  }

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', scheduleLoad, { once: true });
  else scheduleLoad();
  window.addEventListener('breeze-private-leads', scheduleLoad);
})();