(() => {
  const supabaseUrl = 'https://nwvsriwsbpdhszmmousi.supabase.co';
  const supabaseAnonKey = 'sb_publishable_SHsFk0DcYRACTjzr_xZsAA_e-wX-Vt7';
  const form = document.querySelector('#estimate-lead-form');
  const status = document.querySelector('#estimate-form-status');
  const thankYouUrl = '/thank-you.html';
  const softNoticeMs = 1400;
  const requestTimeoutMs = 15000;
  const loadedAt = Date.now();
  const repeatWindowMs = 120000;
  const quickRepeatWindowMs = 15000;
  const botTrapNames = ['_honey', 'company', 'website', 'website_url', 'url', 'business_name', 'fax'];
  const suspiciousEmailPatterns = [
    /international\.inquiry/i,
    /chameleongroup/i,
    /7-11\.com/i,
    /\.ru$/i,
    /\.xyz$/i,
    /\.top$/i
  ];
  let firstInteractionAt = 0;

  if (!form || !status) return;

  addBotTraps();
  form.addEventListener('focusin', noteInteraction, true);
  form.addEventListener('input', noteInteraction, true);

  function noteInteraction() {
    if (!firstInteractionAt) firstInteractionAt = Date.now();
  }

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

  function compactText(value) {
    return String(value || '').replace(/[^a-z0-9]/gi, '');
  }

  function digitCount(value) {
    return String(value || '').replace(/\D/g, '').length;
  }

  function hasRepeatingDigits(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 7 && /(\d)\1{5,}/.test(digits);
  }

  function hasLongNumberBlob(value) {
    return /\d{8,}/.test(String(value || ''));
  }

  function caseSwitchCount(value) {
    const letters = String(value || '').replace(/[^a-z]/gi, '');
    let switches = 0;
    for (let index = 1; index < letters.length; index += 1) {
      const previous = letters[index - 1];
      const current = letters[index];
      if (previous.toLowerCase() === previous.toUpperCase()) continue;
      if (current.toLowerCase() === current.toUpperCase()) continue;
      if ((previous === previous.toUpperCase()) !== (current === current.toUpperCase())) switches += 1;
    }
    return switches;
  }

  function looksRandomToken(value) {
    const text = String(value || '').trim();
    if (text.length < 9 || /\s/.test(text)) return false;

    const compact = compactText(text);
    if (compact.length < 10) return false;

    const letters = compact.replace(/[^a-z]/gi, '');
    if (letters.length < 9) return false;

    const vowels = (letters.match(/[aeiou]/gi) || []).length;
    const upper = (compact.match(/[A-Z]/g) || []).length;
    const lower = (compact.match(/[a-z]/g) || []).length;
    const numbers = (compact.match(/\d/g) || []).length;
    const mixedCase = upper >= 2 && lower >= 2;
    const vowelRatio = vowels / letters.length;
    const switches = caseSwitchCount(compact);
    const consonantRun = /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(letters);
    const oddCaseRun = /[a-z][A-Z][a-z]|[A-Z][a-z][A-Z]/.test(compact);
    const rareLetterCluster = /[qxz][a-z]{0,2}[qxz]|[bcdfghjklmnpqrstvwxyz]{4}[aeiou]?[bcdfghjklmnpqrstvwxyz]{3}/i.test(letters);

    return (
      (mixedCase && switches >= 3 && compact.length >= 12) ||
      (mixedCase && oddCaseRun && compact.length >= 10) ||
      (mixedCase && numbers >= 2 && compact.length >= 10) ||
      (letters.length >= 12 && vowelRatio < 0.26) ||
      consonantRun ||
      rareLetterCluster
    );
  }

  function looksFakeLocation(value) {
    const text = String(value || '').trim();
    if (!text) return false;
    return looksRandomToken(text) || hasLongNumberBlob(text) || /,\s*wa\s*[-,]\s*\d{6,}/i.test(text);
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

  function emailLocalPart(value) {
    return normalizeText(value).split('@')[0] || '';
  }

  function hasOddEmailLocalPart(value) {
    const local = emailLocalPart(value);
    const dots = (local.match(/\./g) || []).length;
    return looksRandomToken(local) || dots >= 4 || /^[a-z]{1,2}\d{5,}/i.test(local);
  }

  function hasSuspiciousEmailDomain(value) {
    const domain = emailDomain(value);
    return suspiciousEmailPatterns.some((pattern) => pattern.test(domain));
  }

  function hasBotTrap(data) {
    return botTrapNames.some((name) => formValue(data, name));
  }

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key) || window.sessionStorage.getItem(key) || '';
    } catch (_error) {
      return '';
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      window.sessionStorage.setItem(key, value);
    } catch (_error) {}
  }

  function leadFingerprint(data) {
    return [
      normalizeText(formValue(data, 'email')),
      formValue(data, 'phone').replace(/\D/g, ''),
      normalizeText(formValue(data, 'name')),
      normalizeText(formValue(data, 'project'))
    ].join('|');
  }

  function wasRecentlySubmitted(data) {
    const now = Date.now();
    const fingerprint = leadFingerprint(data);
    let last = null;

    try {
      last = JSON.parse(storageGet('breeze_last_lead_submit') || 'null');
    } catch (_error) {}

    if (last?.at) {
      const age = now - Number(last.at);
      if (age < quickRepeatWindowMs) return true;
      if (last.fingerprint === fingerprint && age < repeatWindowMs) return true;
    }

    storageSet('breeze_last_lead_submit', JSON.stringify({ at: now, fingerprint }));
    return false;
  }

  function scoreLead(data) {
    const name = formValue(data, 'name');
    const phone = formValue(data, 'phone');
    const email = formValue(data, 'email');
    const city = formValue(data, 'city');
    const project = formValue(data, 'project');
    const notes = formValue(data, 'message');
    const elapsedSeconds = (Date.now() - loadedAt) / 1000;
    let score = 0;
    const reasons = [];

    if (elapsedSeconds < 3) {
      score += 3;
      reasons.push('submitted_too_fast');
    } else if (!firstInteractionAt && elapsedSeconds < 8) {
      score += 2;
      reasons.push('no_form_interaction');
    }

    if (window.navigator?.webdriver) {
      score += 2;
      reasons.push('automated_browser');
    }

    if (name && looksRandomToken(name)) {
      score += 5;
      reasons.push('random_name');
    } else if (name && !looksLikeRealName(name)) {
      score += 1;
      reasons.push('unusual_name');
    }

    if (city && looksFakeLocation(city)) {
      score += 4;
      reasons.push('fake_city_or_address');
    }

    if (phone) {
      const digits = digitCount(phone);
      if (digits < 10 || digits > 11 || hasRepeatingDigits(phone) || hasLongNumberBlob(phone)) {
        score += 2;
        reasons.push('invalid_phone_pattern');
      }
    }

    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        score += 3;
        reasons.push('invalid_email');
      }
      if (hasOddEmailLocalPart(email)) {
        score += 2;
        reasons.push('odd_email_local_part');
      }
      if (hasSuspiciousEmailDomain(email)) {
        score += 3;
        reasons.push('suspicious_domain');
      }
    }

    if (!email && !phone) {
      score += 4;
      reasons.push('missing_contact');
    }

    if (hasLink(notes)) {
      score += 3;
      reasons.push('notes_include_link');
    }

    if (notes && looksRandomToken(notes)) {
      score += 3;
      reasons.push('random_notes');
    }

    if (!project) {
      score += 1;
      reasons.push('missing_project_type');
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
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs);
    let response;

    try {
      response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(record)
      });
    } catch (error) {
      const message = error?.name === 'AbortError'
        ? 'The request took too long. Please try again or call 253-228-0531.'
        : (error?.message || 'The request was blocked by the browser.');
      throw new Error(message);
    } finally {
      window.clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error('The lead request was rejected.');
    }

    return { ok: true };
  }

  function openConfirmation() {
    window.location.assign(thankYouUrl);
  }

  function trackConfirmedLead(record) {
    if (typeof window.gtag !== 'function') {
      openConfirmation();
      return;
    }

    let redirected = false;
    const finish = () => {
      if (redirected) return;
      redirected = true;
      openConfirmation();
    };

    window.gtag('event', 'generate_lead', {
      event_category: 'estimate',
      form_id: 'estimate-lead-form',
      project_type: record.project_type || 'not_specified',
      landing_page: window.location.pathname,
      event_callback: finish,
      event_timeout: 1000
    });
    window.setTimeout(finish, 1100);
  }

  async function submitLead(event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = new FormData(form);
    if (hasBotTrap(data) || wasRecentlySubmitted(data)) {
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

    try {
      const record = leadFromForm(data, spamCheck);
      await insertLead(record);

      window.clearTimeout(noticeTimer);
      setStatus('Request received. Opening the confirmation page...', 'success');
      trackConfirmedLead(record);
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
