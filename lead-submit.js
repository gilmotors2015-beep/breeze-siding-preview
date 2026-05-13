(() => {
  const supabaseUrl = 'https://nwvsriwsbpdhszmmousi.supabase.co';
  const supabaseAnonKey = 'sb_publishable_SHsFk0DcYRACTjzr_xZsAA_e-wX-Vt7';
  const submitTimeoutMs = 8000;
  const form = document.querySelector('#estimate-lead-form');
  const status = document.querySelector('#estimate-form-status');

  if (!form || !status) return;

  function setStatus(message, tone = 'info') {
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function cleanRecord(record) {
    Object.keys(record).forEach((key) => {
      if (record[key] === '') delete record[key];
    });
    return record;
  }

  function formValue(data, key) {
    return String(data.get(key) || '').trim();
  }

  function leadFromForm(data) {
    const project = formValue(data, 'project');
    const timeline = formValue(data, 'timeline');
    const notes = formValue(data, 'message');
    const summaryParts = [project, timeline].filter(Boolean);

    return cleanRecord({
      source: 'website',
      stage: 'needs_review',
      customer_name: formValue(data, 'name'),
      phone: formValue(data, 'phone'),
      email: formValue(data, 'email'),
      city: formValue(data, 'city'),
      project_type: project,
      project_summary: summaryParts.join(' - '),
      notes,
      folder_status: 'not_started',
      next_step: 'Review website request, confirm it is real, then qualify or mark spam.',
      is_spam: false
    });
  }

  function timeoutAfter(ms) {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve({ timedOut: true }), ms);
    });
  }

  async function submitLead(event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = new FormData(form);
    if (formValue(data, '_honey')) {
      window.location.assign('/thank-you.html');
      return;
    }

    if (!window.supabase?.createClient) {
      setStatus('The secure lead system did not load. Please call 253-228-0531 or email service@breezesiding.com.', 'error');
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalText = button?.textContent || 'Request Free Estimate';
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending request...';
    }
    setStatus('Sending your request securely...', 'info');

    const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    const submitRequest = client.from('leads').insert(leadFromForm(data));
    const result = await Promise.race([submitRequest, timeoutAfter(submitTimeoutMs)]);

    if (result?.timedOut) {
      setStatus('This is taking longer than expected. Please wait a moment or call 253-228-0531.', 'error');
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
      return;
    }

    if (result?.error) {
      setStatus('The form could not send right now. Please call 253-228-0531 or email service@breezesiding.com.', 'error');
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
      return;
    }

    setStatus('Request received. Opening the confirmation page...', 'success');
    window.location.assign('/thank-you.html');
  }

  form.addEventListener('submit', submitLead);
})();
