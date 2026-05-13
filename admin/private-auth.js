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

  function withTimeout(promise, ms, fallback) {
    return Promise.race([
      promise,
      new Promise((resolve) => window.setTimeout(() => resolve(fallback), ms))
    ]);
  }

  if (!config?.enabled || config.provider !== 'supabase' || !supabaseFactory?.createClient) {
    showLoginNeeded('Secure login could not load. Refresh once, or use the login button below.');
    return;
  }

  const client = supabaseFactory.createClient(config.supabaseUrl, config.supabaseAnonKey);
  let currentSession = null;
  let authWatcherReady = false;

  function setMessage(message) {
    const target = document.querySelector('#private-status-message');
    if (target) target.textContent = message;
  }

  function appendEnhancementScript(src, attrName) {
    if (document.querySelector(`script[data-${attrName}]`)) return null;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.async = false;
    script.setAttribute(`data-${attrName}`, 'true');
    document.body.append(script);
    return script;
  }

  function loadDashboardEnhancements() {
    const statusScript = appendEnhancementScript('/admin/admin-status-enhancement.js?v=status-8', 'admin-status-enhancement');
    const loadStatusController = () => appendEnhancementScript('/admin/admin-status-controller.js?v=status-controller-1', 'admin-status-controller');
    const loadSchedulePolish = () => {
      const scheduleScript = appendEnhancementScript('/admin/admin-schedule-action-polish.js?v=schedule-2', 'admin-schedule-action-polish');
      if (scheduleScript) {
        scheduleScript.addEventListener('load', loadStatusController, { once: true });
      } else {
        loadStatusController();
      }
    };
    const loadDialogPolish = () => {
      const dialogScript = appendEnhancementScript('/admin/admin-lead-dialog-polish.js?v=dialog-3', 'admin-lead-dialog-polish');
      if (dialogScript) {
        dialogScript.addEventListener('load', loadSchedulePolish, { once: true });
      } else {
        loadSchedulePolish();
      }
    };
    const loadFlowPolish = () => {
      const flowScript = appendEnhancementScript('/admin/admin-flow-polish.js?v=flow-2', 'admin-flow-polish');
      if (flowScript) {
        flowScript.addEventListener('load', loadDialogPolish, { once: true });
      } else {
        loadDialogPolish();
      }
    };
    const loadDeleteActions = () => {
      const deleteScript = appendEnhancementScript('/admin/admin-delete-lead-actions.js?v=delete-1', 'admin-delete-lead-actions');
      if (deleteScript) {
        deleteScript.addEventListener('load', loadFlowPolish, { once: true });
      } else {
        loadFlowPolish();
      }
    };
    const loadEstimateActions = () => {
      const estimateScript = appendEnhancementScript('/admin/admin-estimate-sent-actions.js?v=estimate-2', 'admin-estimate-sent-actions');
      if (estimateScript) {
        estimateScript.addEventListener('load', loadDeleteActions, { once: true });
      } else {
        loadDeleteActions();
      }
    };
    const loadWorkflowActions = () => {
      const workflowScript = appendEnhancementScript('/admin/admin-workflow-actions.js?v=workflow-6', 'admin-workflow-actions');
      if (workflowScript) {
        workflowScript.addEventListener('load', loadEstimateActions, { once: true });
      } else {
        loadEstimateActions();
      }
    };

    if (statusScript) {
      statusScript.addEventListener('load', loadWorkflowActions, { once: true });
    } else {
      loadWorkflowActions();
    }
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
      scheduled: 'scheduled',
      estimate_sent: 'estimate-sent',
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
      addressLine: row.address_line || '',
      city: cityStateZip || row.city || 'Not set',
      cityName: row.city || '',
      state: row.state || 'WA',
      zip: row.zip || '',
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
      updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
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

    if (leads.length) {
      window.dispatchEvent(new CustomEvent('breeze-private-leads', { detail: { leads } }));
      setMessage(`Private mode loaded ${leads.length} customer record${leads.length === 1 ? '' : 's'}.`);
      return;
    }

    setMessage('Private mode is connected. Showing the current customer records until database leads are entered.');
  }

  async function signOut() {
    await client.auth.signOut();
    window.dispatchEvent(new CustomEvent('breeze-private-logout'));
    window.location.replace('/admin-login/');
  }

  async function init() {
    document.querySelector('#private-auth-logout')?.addEventListener('click', signOut);

    const sessionResult = await withTimeout(client.auth.getSession(), 5000, { timedOut: true });
    if (sessionResult?.timedOut) {
      showLoginNeeded('Saved login could not be confirmed. Please sign in again.');
      return;
    }

    currentSession = sessionResult?.data?.session || null;

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
