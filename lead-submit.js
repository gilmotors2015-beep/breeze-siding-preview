(() => {
  const supabaseUrl = 'https://nwvsriwsbpdhszmmousi.supabase.co';
  const supabaseAnonKey = 'sb_publishable_SHsFk0DcYRACTjzr_xZsAA_e-wX-Vt7';
  const form = document.querySelector('#estimate-lead-form');
  const status = document.querySelector('#estimate-form-status');
  const thankYouUrl = '/thank-you.html';
  const softNoticeMs = 1400;
  const redirectTimeoutMs = 6500;

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

  function delay(ms, value) {
    return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
  }

  async function insertLead(record) {
    const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(record),
      keepalive: true
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(details || `Lead request failed with ${response.status}`);
    }

    return { ok: true };
  }

  function openConfirmation() {
    window.location.assign(thankYouUrl);
  }

  async function submitLead(event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = new FormData(form);
    if (formValue(data, '_honey')) {
      openConfirmation();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalText = button?.textContent || 'Request Free Estimate';
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending request...';
    }
    setStatus('Sending your request securely...', 'info');

    const noticeTimer = window.setTimeout(() => {
      setStatus('Request received. Opening the confirmation page...', 'success');
      if (button) button.textContent = 'Opening confirmation...';
    }, softNoticeMs);

    const sendPromise = insertLead(leadFromForm(data));
    sendPromise.catch(() => {});

    try {
      const result = await Promise.race([
        sendPromise,
        delay(redirectTimeoutMs, { timedOut: true })
      ]);

      window.clearTimeout(noticeTimer);

      if (result?.timedOut) {
        setStatus('Request received. Opening the confirmation page...', 'success');
        openConfirmation();
        return;
      }

      setStatus('Request received. Opening the confirmation page...', 'success');
      openConfirmation();
    } catch (_error) {
      window.clearTimeout(noticeTimer);
      setStatus('The form could not send right now. Please call 253-228-0531 or email service@breezesiding.com.', 'error');
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }

  form.addEventListener('submit', submitLead);
})();
