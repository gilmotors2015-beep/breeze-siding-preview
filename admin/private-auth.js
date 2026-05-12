(() => {
  const config = window.BREEZE_PRIVATE_ADMIN;
  const supabaseFactory = window.supabase;
  const bootText = document.querySelector('#auth-check-screen span');
  if (bootText) bootText.textContent = 'Checking your saved login session...';

  function loginUrl() {
    const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return `/admin-login/?next=${encodeURIComponent(next || '/admin/')}`;
  }

  function showLoginNeeded(message = 'Secure login is needed before this dashboard can open.') {
    const screen = document.querySelector('#auth-check-screen');
    const text = screen?.querySelector('span');
    const link = screen?.querySelector('a');
    if (text) text.textContent = message;
    if (link) link.setAttribute('href', loginUrl());
  }

  if (!config?.enabled || config.provider !== 'supabase' || !supabaseFactory?.createClient) {
    showLoginNeeded('Secure login could not load. Use the login button below.');
    return;
  }

  const client = supabaseFactory.createClient(config.supabaseUrl, config.supabaseAnonKey);
  let currentSession = null;
  let authWatcherReady = false;

  function setMessage(message) {
    const target = document.querySelector('#private-status-message');
    if (target) target.textContent = message;
  }

  function loadDashboardEnhancements() {
    if (document.querySelector('script[data-admin-status-enhancement]')) return;
    const script = document.createElement('script');
    script.src = '/admin/admin-status-enhancement.js?v=status-4';
    script.defer = true;
    script.dataset.adminStatusEnhancement = 'true';
    document.body.append(script);
  }

  function unlockDashboard() {
    document.body.classList.remove('is-auth-checking');
    document.body.classList.add('is-auth-ready');
    const pill = document.querySelector('#mode-pill');
    if (pill) pill.textContent = 'Private mode';
    document.querySelector('#private-auth-logout')?.removeAttribute('hidden');
    loadDashboardEnhancements();
  }

  function toDashboardStage(stage) {
    const map = {
      needs_review: 'new',
      qualified: 'qualified',
      contacted: 'contacted',
      estimate_sent: 'estimate-sent',
      scheduled: 'scheduled',
      won: 'won',
      lost: 'lost',
      spam: 'spam',
      review_follow_up: 'review'
    };
    return map[stage] || 'new';
  }

  function mapLead(row) {
    const cityStateZip = [row.city, row.state, row.zip].filter(Boolean).join(', ');
    const address = [row.address_line, cityStateZip].filter(Boolean).join(' - ');
    const total = row.estimate_total ? Number(row.estimate_total).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '';
    const hasFolder = Boolean(row.folder_path);
    const hasEstimate = Boolean(row.estimate_no || row.estimate_date || row.estimate_total);

    return {
      id: row.id,
      name: row.customer_name || 'Unnamed lead',
      contactPerson: row.contact_person || row.customer_name || 'Not set',
      email: row.email || 'Not set',
      phone: row.phone || 'Not set',
      address: address || 'Not set',
      city: cityStateZip || row.city || 'Not set',
      project: row.project_summary || row.project_type || 'Not set',
      estimateNo: row.estimate_no || '',
      estimateDate: row.estimate_date || '',
      dueDate: row.due_date || '',
      proposalTotal: total,
      stage: toDashboardStage(row.stage),
      qualityChecksDone: row.is_spam ? [] : ['real-contact', 'service-area', 'real-project', 'not-spam'],
      folderStatus: row.folder_status || (hasFolder ? 'Folder exists' : 'Qualified, folder not created'),
      folderTasksDone: ['folder', hasEstimate ? 'estimate' : ''].filter((item) => item && (item !== 'folder' || hasFolder)),
      nextStep: row.next_step || 'Review and update next action.',
      notes: row.notes || '',
      createdAt: row.created_at || new Date().toISOString(),
      folderPathOverride: row.folder_path || ''
    };
  }

  async function loadLeads() {
    if (!currentSession) return;
    setMessage('Loading private customer records...');
    const { data, error } = await client
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      setMessage(`Signed in, but private records could not load: ${error.message}`);
      return;
    }

    const leads = (data || []).map(mapLead);
    window.BREEZE_PRIVATE_ADMIN_LEADS = leads;
    window.dispatchEvent(new CustomEvent('breeze-private-leads', { detail: { leads } }));
    setMessage(leads.length ? `Private mode loaded ${leads.length} customer record${leads.length === 1 ? '' : 's'}.` : 'Private mode is connected. No database leads have been entered yet.');
  }

  async function signOut() {
    await client.auth.signOut();
    window.dispatchEvent(new CustomEvent('breeze-private-logout'));
    window.location.replace('/admin-login/');
  }

  async function init() {
    document.querySelector('#private-auth-logout')?.addEventListener('click', signOut);

    const { data } = await client.auth.getSession();
    currentSession = data.session;

    if (!currentSession) {
      showLoginNeeded('You are not signed in. Use the secure login button below.');
      return;
    }

    unlockDashboard();
    await loadLeads();

    if (!authWatcherReady) {
      authWatcherReady = true;
      client.auth.onAuthStateChange(async (_event, session) => {
        currentSession = session;
        if (!session) {
          showLoginNeeded('You are not signed in. Use the secure login button below.');
          return;
        }
        unlockDashboard();
        await loadLeads();
      });
    }
  }

  window.BREEZE_PRIVATE_ADMIN_BRIDGE = { client, loadLeads, signOut };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
