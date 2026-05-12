(() => {
  const statusOptions = [
    ['new', 'Lead'],
    ['qualified', 'Qualified'],
    ['contacted', 'Contacted'],
    ['scheduled', 'Scheduled'],
    ['estimate-sent', 'Estimate sent'],
    ['won', 'Won'],
    ['review', 'Review follow-up'],
    ['lost', 'Lost'],
    ['spam', 'Spam']
  ];

  const privateStage = {
    new: 'needs_review',
    qualified: 'qualified',
    contacted: 'contacted',
    scheduled: 'scheduled',
    'estimate-sent': 'estimate_sent',
    won: 'won',
    review: 'review_follow_up',
    lost: 'lost',
    spam: 'spam'
  };

  const nextStep = {
    new: 'Review the lead, confirm it is real, then qualify or mark spam.',
    qualified: 'Set the appointment, send the schedule email, or call/text the customer.',
    contacted: 'Confirm the appointment or site visit details.',
    scheduled: 'Complete the site visit, measurements, photos, and estimate notes.',
    'estimate-sent': 'Follow up on the proposal and track the reply.',
    won: 'Prepare job expectations, start date planning, and contract details.',
    review: 'Request feedback, review, maintenance follow-up, or closeout notes.',
    lost: 'Record why the bid did not move forward.',
    spam: 'No action needed.'
  };

  const qualifiedChecks = ['real-contact', 'service-area', 'real-project', 'not-spam'];

  function selectedStage() {
    return document.querySelector('#manual-lead-stage')?.value || 'new';
  }

  function insertStatusField() {
    const grid = document.querySelector('#manual-lead-form .manual-lead-grid');
    if (!grid || document.querySelector('#manual-lead-stage')) return;

    const label = document.createElement('label');
    label.textContent = 'Status';

    const select = document.createElement('select');
    select.id = 'manual-lead-stage';
    select.name = 'stage';

    statusOptions.forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.append(option);
    });

    label.append(select);
    const firstField = grid.querySelector('label');
    if (firstField?.nextSibling) {
      grid.insertBefore(label, firstField.nextSibling);
    } else {
      grid.append(label);
    }
  }

  function enhanceLocalLeadBuilder() {
    if (typeof localLeadFromManualForm !== 'function' || localLeadFromManualForm.isStatusEnhanced) return;

    const original = localLeadFromManualForm;
    const enhanced = function enhancedLocalLeadFromManualForm() {
      const lead = original();
      const stage = selectedStage();
      lead.stage = stage;
      lead.nextStep = nextStep[stage] || lead.nextStep;
      lead.qualityChecksDone = stage === 'new' || stage === 'spam' ? [] : qualifiedChecks;
      if (stage === 'spam') {
        lead.folderStatus = 'No folder - spam';
        lead.folderTasksDone = [];
      }
      return lead;
    };

    enhanced.isStatusEnhanced = true;
    localLeadFromManualForm = enhanced;
  }

  function enhancePrivateLeadBuilder() {
    if (typeof privateLeadFromManualForm !== 'function' || privateLeadFromManualForm.isStatusEnhanced) return;

    const original = privateLeadFromManualForm;
    const enhanced = function enhancedPrivateLeadFromManualForm() {
      const row = original();
      const stage = selectedStage();
      row.stage = privateStage[stage] || 'needs_review';
      row.next_step = nextStep[stage] || row.next_step;
      row.is_spam = stage === 'spam';
      return row;
    };

    enhanced.isStatusEnhanced = true;
    privateLeadFromManualForm = enhanced;
  }

  function init() {
    insertStatusField();
    enhanceLocalLeadBuilder();
    enhancePrivateLeadBuilder();
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
