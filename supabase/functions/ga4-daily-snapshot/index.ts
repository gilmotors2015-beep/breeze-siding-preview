import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

type MetricRow = Record<string, number | string>;

type SnapshotRow = {
  search_clicks_28d?: number | null;
  search_impressions_28d?: number | null;
  search_ctr?: number | null;
  average_position?: number | null;
  indexed_pages?: number | null;
  not_indexed_pages?: number | null;
};

type SearchConsoleMetrics = {
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  note?: string;
};

const jsonHeaders = { 'content-type': 'application/json' };
const googleScopes = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly'
].join(' ');
const tokenUrl = 'https://oauth2.googleapis.com/token';
const analyticsApi = 'https://analyticsdata.googleapis.com/v1beta';
const searchConsoleApi = 'https://searchconsole.googleapis.com/webmasters/v3';

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Use POST for the GA4 daily snapshot sync.' }, 405);
  }

  const syncSecret = Deno.env.get('GA4_SYNC_SECRET') || '';
  if (syncSecret) {
    const headerSecret = request.headers.get('x-sync-secret') || '';
    if (headerSecret !== syncSecret) return json({ error: 'Unauthorized sync request.' }, 401);
  }

  try {
    const supabaseUrl = requiredEnv('SUPABASE_URL');
    const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const propertyId = requiredEnv('GA4_PROPERTY_ID').replace(/^properties\//, '');
    const clientEmail = requiredEnv('GA4_CLIENT_EMAIL');
    const privateKey = requiredEnv('GA4_PRIVATE_KEY').replace(/\\n/g, '\n');
    const searchConsoleSiteUrl = Deno.env.get('SEARCH_CONSOLE_SITE_URL') || 'sc-domain:breezesiding.com';

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const accessToken = await getAccessToken(clientEmail, privateKey);
    const checkedOn = pacificDate();
    const searchRange = dateRange(28);

    const [summary, channels, cities, pages, leads, existing, search] = await Promise.all([
      runReport(propertyId, accessToken, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'engagementRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensionFilter: washingtonFilter()
      }),
      runReport(propertyId, accessToken, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        dimensionFilter: washingtonFilter(),
        limit: 20
      }),
      runReport(propertyId, accessToken, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
        dimensions: [{ name: 'city' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'engagementRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensionFilter: washingtonFilter(),
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 12
      }),
      runReport(propertyId, accessToken, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
        dimensions: [{ name: 'landingPagePlusQueryString' }, { name: 'pageTitle' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'engagedSessions' }
        ],
        dimensionFilter: washingtonFilter(),
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 12
      }),
      loadLeadCounts(supabase),
      loadExistingSnapshot(supabase, checkedOn),
      loadSearchConsoleMetrics(searchConsoleSiteUrl, accessToken, searchRange.startDate, searchRange.endDate)
    ]);

    const summaryRow = firstMetricRow(summary);
    const visitorCount = asInteger(summaryRow.activeUsers);
    const organicSearchSessions = rows(channels)
      .filter((row) => String(row.sessionDefaultChannelGroup).toLowerCase() === 'organic search')
      .reduce((total, row) => total + asInteger(row.sessions), 0);

    const snapshot = {
      checked_on: checkedOn,
      visitors_28d: visitorCount,
      visitors_per_day: round(visitorCount / 28),
      leads_7d: leads.leads7,
      leads_28d: leads.leads28,
      search_clicks_28d: search.clicks ?? existing?.search_clicks_28d ?? null,
      search_impressions_28d: search.impressions ?? existing?.search_impressions_28d ?? null,
      search_ctr: search.ctr ?? existing?.search_ctr ?? null,
      average_position: search.position ?? existing?.average_position ?? null,
      indexed_pages: existing?.indexed_pages ?? null,
      not_indexed_pages: existing?.not_indexed_pages ?? null,
      wa_active_users_28d: visitorCount,
      wa_sessions_28d: asInteger(summaryRow.sessions),
      wa_engaged_sessions_28d: asInteger(summaryRow.engagedSessions),
      wa_engagement_rate: round(asNumber(summaryRow.engagementRate) * 100),
      wa_average_session_duration: round(asNumber(summaryRow.averageSessionDuration)),
      organic_search_sessions_28d: organicSearchSessions,
      top_cities: rows(cities).map((row) => ({
        city: row.city || 'Not set',
        activeUsers: asInteger(row.activeUsers),
        sessions: asInteger(row.sessions),
        engagedSessions: asInteger(row.engagedSessions),
        engagementRate: round(asNumber(row.engagementRate) * 100),
        averageSessionDuration: round(asNumber(row.averageSessionDuration))
      })),
      top_pages: rows(pages).map((row) => ({
        path: row.landingPagePlusQueryString || '/',
        title: row.pageTitle || 'Untitled page',
        activeUsers: asInteger(row.activeUsers),
        sessions: asInteger(row.sessions),
        engagedSessions: asInteger(row.engagedSessions)
      })),
      source: search.note ? 'ga4-auto' : 'ga4-search-console-auto',
      notes: search.note || 'Daily GA4 and Search Console sync for Washington traffic and organic search performance.',
      synced_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('seo_snapshots')
      .upsert(snapshot, { onConflict: 'checked_on' })
      .select('*')
      .single();

    if (error) throw error;

    return json({ ok: true, checkedOn, snapshot: data, searchConsole: search });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('GA4 daily snapshot failed:', message);
    return json({ ok: false, error: message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

function washingtonFilter() {
  return {
    andGroup: {
      expressions: [
        { filter: { fieldName: 'country', stringFilter: { matchType: 'EXACT', value: 'United States' } } },
        { filter: { fieldName: 'region', stringFilter: { matchType: 'EXACT', value: 'Washington' } } }
      ]
    }
  };
}

async function getAccessToken(clientEmail: string, privateKey: string) {
  const assertion = await signJwt(clientEmail, privateKey);
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!response.ok) throw new Error(`Google token request failed: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  if (!payload.access_token) throw new Error('Google token response did not include an access token.');
  return payload.access_token as string;
}

async function signJwt(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: clientEmail,
    scope: googleScopes,
    aud: tokenUrl,
    exp: now + 3600,
    iat: now
  };
  const unsigned = `${base64UrlJson(header)}.${base64UrlJson(claim)}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${base64UrlBytes(new Uint8Array(signature))}`;
}

function base64UrlJson(value: unknown) {
  return base64UrlString(JSON.stringify(value));
}

function base64UrlString(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlBytes(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function runReport(propertyId: string, accessToken: string, body: Record<string, unknown>) {
  const response = await fetch(`${analyticsApi}/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`GA4 runReport failed: ${response.status} ${await response.text()}`);
  return await response.json();
}

async function loadSearchConsoleMetrics(siteUrl: string, accessToken: string, startDate: string, endDate: string): Promise<SearchConsoleMetrics> {
  try {
    const response = await fetch(`${searchConsoleApi}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ startDate, endDate, rowLimit: 1 })
    });

    if (!response.ok) {
      return {
        clicks: null,
        impressions: null,
        ctr: null,
        position: null,
        note: `Daily GA4 sync succeeded. Search Console was not imported yet: ${response.status} ${await response.text()}`
      };
    }

    const payload = await response.json();
    const row = payload.rows?.[0] || {};
    return {
      clicks: asInteger(row.clicks),
      impressions: asInteger(row.impressions),
      ctr: round(asNumber(row.ctr) * 100),
      position: round(asNumber(row.position))
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      clicks: null,
      impressions: null,
      ctr: null,
      position: null,
      note: `Daily GA4 sync succeeded. Search Console was not imported yet: ${message}`
    };
  }
}

function rows(report: any): MetricRow[] {
  const dimensionNames = (report.dimensionHeaders || []).map((header: any) => header.name);
  const metricNames = (report.metricHeaders || []).map((header: any) => header.name);
  return (report.rows || []).map((row: any) => {
    const output: MetricRow = {};
    (row.dimensionValues || []).forEach((value: any, index: number) => { output[dimensionNames[index]] = value.value; });
    (row.metricValues || []).forEach((value: any, index: number) => { output[metricNames[index]] = Number(value.value); });
    return output;
  });
}

function firstMetricRow(report: any) {
  return rows(report)[0] || {};
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asInteger(value: unknown) {
  return Math.round(asNumber(value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function pacificDate() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function dateRange(days: number) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - Math.max(days - 1, 0));
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
}

async function loadLeadCounts(supabase: ReturnType<typeof createClient>) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twentyEightDaysAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
  try {
    const [seven, twentyEight] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo).neq('stage', 'spam').neq('is_spam', true),
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', twentyEightDaysAgo).neq('stage', 'spam').neq('is_spam', true)
    ]);
    return { leads7: seven.count || 0, leads28: twentyEight.count || 0 };
  } catch (_error) {
    return { leads7: 0, leads28: 0 };
  }
}

async function loadExistingSnapshot(supabase: ReturnType<typeof createClient>, checkedOn: string): Promise<SnapshotRow | null> {
  const { data } = await supabase
    .from('seo_snapshots')
    .select('search_clicks_28d, search_impressions_28d, search_ctr, average_position, indexed_pages, not_indexed_pages')
    .eq('checked_on', checkedOn)
    .maybeSingle();
  return data || null;
}
