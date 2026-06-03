(() => {
  const supabaseUrl = 'https://nwvsriwsbpdhszmmousi.supabase.co';
  const supabaseAnonKey = 'sb_publishable_SHsFk0DcYRACTjzr_xZsAA_e-wX-Vt7';
  const form = document.querySelector('#estimate-lead-form');
  const status = document.querySelector('#estimate-form-status');
  const thankYouUrl = '/thank-you.html';
  const softNoticeMs = 1400;
  const redirectTimeoutMs = 6500;
  const loadedAt = Date.now();
  const botTrapNames = ['_honey', 'company', 'website', 'website_url', 'url', 'business_name', 'fax'];

  if (!form || !status) return;

  addBotTraps();

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

  function addBotTraps() {
    const trapWrap = document.createElement('div');
    trapWrap.setAttribute('aria-hidden', 'true');
    trapWrap.style.position = 'absolute';
    trapWrap.style.left = '-10000px';
    trapWrap.style.width = '1px';
    trapWrap.style.height = '1px';
    trapWrap.style.overflow = 'hidden';

    botTrapNames.slice(1).forEach((name) => {
      if (form.querySelector(`[name="${name}"]`)) return;
      const input = document.createElement('input');
      input.type = 'text';
      input.name = name;
      input.tabIndex = -1;
      input.autocomplete = 'off';
      trapWrap.appendChild(input);
    });

    form.appendChild(trapWrap);
  }

  function formValue(data, key) {
    return String(data.get(key) || '').trim();
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function digitCount(value) {
    return String(value || '').replace(/\D/g, '').length;
  }

  function hasRepeatingDigits(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 7 && /(\d)\1{5,}/.test(digits);
  }

  function looksRandomToken(value) {
    const text = String(value || '').trim();
    if (text.length < 10 || /\s/.test(text)) return false;
    const letters = text.replace(/[^a-z]/gi, '');
    if (letters.length < 10) return false;

    const vowels = (letters.match(/[aeiou]/gi) || []).length;
    const upper = (text.match(/[A-Z]/g) || []).length;
    const lower = (text.match(/[a-z]/g) || []).length;
    const mixedCase = upper >= 2 && lower >= 2;
    const vowelRatio = vowels / letters.length;
    const consonantRun = /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(letters);
    const oddCaseRun = /[a-z][A-Z][a-z][A-Z]|[A-Z][a-z][A-Z][a-z]/.test(text);

    return (mixedCase && vowelRatio < 0.34) || consonantRun || oddCaseRun;
  }

  function looksLikeRealName(value) {
    const text = String(value || '').trim();
    if (!text) return false;
    if (looksRandomToken(text)) return false;
    return /^[a-z][a-z'.-]+(?:\s+[a-z][a-z'.-]+){0,3}$/i.test(text);
  }

  function hasLink(value) {
    return /https?:\/\/|www\.|\.[a-z]{2,}\//i.test(String(value || ''));
  }

  function emailDomain(value) {
    const email = normalizeText(value);
    return email.includes('@') ? email.split('@').pop() : '';
  }

  function hasBotTrap(data) {
    return botTrapNames.some((name) => formValue(data, name));
  }

  function wasRecentlySubmitted() {
    const lastSubmit = Number(window.sessionStorage.getItem('breeze_last_lead_submit') || 0);
    const now = Date.now();
    if (lastSubmit && now - lastSubmit < 30000) return true;
    window.sessionStorage.setItem('breeze_last_lead_submit', String(now));
    return false;
  }

  function scoreLead(data) {
    const name = formValue(data, 'name');
    const phone = formValue(data, 'phone');
    const email = formValue(data, 'email');
    const city = formValue(data, 'city');
    const notes = formValue(data, 'message');
    const elapsedSeconds = (Date.now() - loadedAt) / 1000;
    const domain = emailDomain(email);
    const localPart = normalizeText(email).split('@')[0] || '';
    let score = 0;
    const reasons = [];

    if (elapsedSeconds < 3) {
      score += 3;
      reasons.push('submitted_too_fast');
    }

    if (name && looksRandomToken(name)) {
      score += 4;
      reasons.push('random_name');
    } else if (name && !looksLikeRealName(name)) {
      score += 1;
      reasons.push('unusual_name');
    }

    if (city && looksRandomToken(city)) {
      score += 3;
      reasons.push('random_city');
    }

    if (phone) {
      const digits = digitCount(phone);
      if (digits < 10 || digits > 11 || hasRepeatingDigits(phone)) {
        score += 2;
        reasons.push('invalid_phone_pattern');
      }
    }

    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        score += 3;
        reasons.push('invalid_email');
      }
      if (looksRandomToken(localPart)) {
        score += 2;
        reasons.push('random_email_local');
      }
      if (/7-11\.com|chameleongroup\.co|international\.inquiry/i.test(domain) || domain.endsWith('.ru')) {
        score += 2;
        reasons.push('suspicious_domain');
      }
    }

    if (hasLink(notes)) {
      score += 3;
      reasons.push('notes_include_link');
    }

    return {
      score,
      reasons,
      block: score >= 4,
      markSpam: score >= 3
    };
  }

  function leadFromForm(data, spamCheck) {
    const project = formValue(data, 'project');
    const timeline = formValue(data, 'timeline');
    const notes = formValue(data, 'message');
    const summaryParts = [project, timeline].filter(Boolean);
    const isSpam = Boolean(spamCheck?.markSpam);
    const spamReason = spamCheck?.reasons?.length ? `\n\nSpam signals: ${spamCheck.reasons.join(', ')}.` : '';

    return cleanRecord({
      source: 'website',
      stage: isSpam ? 'spam' : 'needs_review',
      customer_name: formValue(data, 'name'),
      phone: formValue(data, 'phone'),
      email: formValue(data, 'email'),
      city: formValue(data, 'city'),
      project_type: project,
      project_summary: summaryParts.join(' - '),
      notes: isSpam ? `${notes}${spamReason}`.trim() : notes,
      folder_status: 'not_started',
      next_step: isSpam
        ? 'Likely spam submission. Review only if contact details look real.'
        : 'Review website request, confirm it is real, then qualify or mark spam.',
      is_spam: isSpam
    });
  }

  function delay(ms, value) {
    return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
  }

  async function insertLead(record) {
    let response;
    try {
      response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(record)
      });
    } catch (error) {
      throw new Error(error?.message || 'The request was blocked by the browser.');
    }

    if (!response.ok) {
      throw new Error('The lead request was rejected.');
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
    if (hasBotTrap(data) || wasRecentlySubmitted()) {
      openConfirmation();
      return;
    }

    const spamCheck = scoreLead(data);
    if (spamCheck.block) {
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

    const sendPromise = insertLead(leadFromForm(data, spamCheck));
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
