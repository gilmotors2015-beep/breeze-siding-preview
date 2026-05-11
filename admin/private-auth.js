(() => {
  const config = window.BREEZE_PRIVATE_ADMIN;
  const supabaseFactory = window.supabase;

  if (!config?.enabled || config.provider !== 'supabase' || !supabaseFactory?.createClient) {
    return;
  }

  const client = supabaseFactory.createClient(config.supabaseUrl, config.supabaseAnonKey);
  let currentSession = null;
  let panelReady = false;

  function insertAuthPanel() {
    if (panelReady) return;
    const setupNotice = document.querySelector('#setup-notice');
    if (!setupNotice) return;

    const section = document.createElement('section');
    section.className = 'notice private-auth-panel';
    section.id = 'private-auth-panel';
    section.innerHTML = `
      <div>
        <strong>Private admin login</strong>
        <p id="private-auth-message">Sign in to load private customer details from the protected database.</p>
      </div>
      <div class="private-auth-controls">
        <input id="private-auth-email" type="email" autocomplete="username" placeholder="Email" value="${config.ownerEmail || ''}">
        <input id="private-auth-password" type="password" autocomplete="current-password" placeholder="Password">
        <button class="button primary" id="private-auth-login" type="button">Sign in</button>
        <button class="button secondary" id="private-auth-logout" type="button" hidden>Sign out</button>
      </div>
    `;
    setupNotice.insertAdjacentElement('afterend', section);
    panelReady = true;

    document.querySelector('#private-auth-login')?.addEventListener('click', signIn);
    document.querySelector('#private-auth-logout')?.addEventListener('click', signOut);
  }

  function setMessage(message) {
    const target = document.querySelector('#private-auth-message');
    if (target) target.textContent = message;
  }

  function setSignedInUI(isSignedIn) {
    document.querySelector('#private-auth-login')?.toggleAttribute('hidden', isSignedIn);
    document.querySelector('#private-auth-logout')?.toggleAttribute('hidden', !isSignedIn);
    document.querySelector('#private-auth-password')?.toggleAttribute('hidden', isSignedIn);
    document.querySelector('#private-auth-email')?.toggleAttribute('hidden', isSignedIn);
    const pill = document.querySelector('#mode-pill');
    if (pill) pill.textContent = isSignedIn ? 'Private mode' : 'Workflow mode';
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
    const stage = toDashboardStage(row.stage);
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
      stage,
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
    window.dispatchEvent(new CustomEvent('breeze-private-leads', { detail: { leads } }));
    setMessage(leads.length ? `Private mode loaded ${leads.length} customer record${leads.length === 1 ? '' : 's'}.` : 'Private mode is connected. No database leads have been entered yet.');
  }

  async function signIn() {
    const email = document.querySelector('#private-auth-email')?.value.trim();
    const password = document.querySelector('#private-auth-password')?.value;
    if (!email || !password) {
      setMessage('Enter the admin email and password to sign in.');
      return;
    }

    setMessage('Signing in...');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(`Sign-in failed: ${error.message}`);
      return;
    }

    currentSession = data.session;
    setSignedInUI(true);
    await loadLeads();
  }

  async function signOut() {
    await client.auth.signOut();
    currentSession = null;
    setSignedInUI(false);
    window.dispatchEvent(new CustomEvent('breeze-private-logout'));
    setMessage('Signed out. Redacted workflow records are showing.');
  }

  async function init() {
    insertAuthPanel();
    const { data } = await client.auth.getSession();
    currentSession = data.session;
    setSignedInUI(Boolean(currentSession));
    if (currentSession) await loadLeads();

    client.auth.onAuthStateChange(async (_event, session) => {
      currentSession = session;
      setSignedInUI(Boolean(session));
      if (session) await loadLeads();
    });
  }

  window.BREEZE_PRIVATE_ADMIN_BRIDGE = { client, loadLeads };
  window.addEventListener('DOMContentLoaded', init);
})();
