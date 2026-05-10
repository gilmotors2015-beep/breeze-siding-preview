const stages = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'estimate-sent', label: 'Estimate sent' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'review', label: 'Review follow-up' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' }
];

const sampleLeads = [
  {
    id: 'lead-1001',
    name: 'Sarah M.',
    email: 'sarah@example.com',
    phone: '253-555-0188',
    city: 'Tacoma',
    project: 'Siding replacement',
    stage: 'new',
    nextStep: 'Call back and request photos',
    notes: 'Interested in fiber cement siding and trim around front windows.',
    createdAt: '2026-05-10T09:20:00'
  },
  {
    id: 'lead-1002',
    name: 'Daniel R.',
    email: 'daniel@example.com',
    phone: '206-555-0144',
    city: 'Seattle',
    project: 'Window and siding estimate',
    stage: 'contacted',
    nextStep: 'Prepare estimate after walkthrough',
    notes: 'Older home. Wants better weather protection and a cleaner front elevation.',
    createdAt: '2026-05-09T15:40:00'
  },
  {
    id: 'lead-1003',
    name: 'Melissa K.',
    email: 'melissa@example.com',
    phone: '425-555-0169',
    city: 'Bellevue',
    project: 'Exterior paint and trim',
    stage: 'estimate-sent',
    nextStep: 'Follow up on estimate in two days',
    notes: 'Asked for separate siding repair and paint options.',
    createdAt: '2026-05-08T11:05:00'
  },
  {
    id: 'lead-1004',
    name: 'Jon P.',
    email: 'jon@example.com',
    phone: '360-555-0126',
    city: 'Puyallup',
    project: 'Repair visit',
    stage: 'scheduled',
    nextStep: 'Service visit scheduled',
    notes: 'Small leak-prone trim area near second-story window.',
    createdAt: '2026-05-07T16:30:00'
  },
  {
    id: 'lead-1005',
    name: 'Alicia T.',
    email: 'alicia@example.com',
    phone: '253-555-0191',
    city: 'Spanaway',
    project: 'Completed siding project',
    stage: 'review',
    nextStep: 'Send review request link',
    notes: 'Project completed. Customer sounded happy at final walkthrough.',
    createdAt: '2026-05-05T14:10:00'
  }
];

const sampleSlots = [
  { id: 'slot-1', date: 'Tue May 12', time: '9:00 AM - 11:00 AM', label: 'Estimate window', status: 'Open' },
  { id: 'slot-2', date: 'Wed May 13', time: '1:00 PM - 3:00 PM', label: 'Walkthrough', status: 'Held' },
  { id: 'slot-3', date: 'Fri May 15', time: '10:00 AM - 12:00 PM', label: 'Repair visit', status: 'Open' }
];

const sampleActivity = [
  { title: 'New lead received', detail: 'Homepage estimate form added Sarah M. to New.' },
  { title: 'Estimate follow-up needed', detail: 'Melissa K. should be contacted after estimate review.' },
  { title: 'Review request ready', detail: 'Alicia T. is ready for rate-us follow-up.' }
];

const performanceSummary = {
  visitors: 128,
  clicks: 42,
  impressions: 1840,
  averagePosition: 18.6
};

const trafficMarkers = [
  { label: 'Organic search visitors', value: '74', detail: 'Primary traffic source to watch after launch', change: '+12%', tone: 'good' },
  { label: 'Estimate form starts', value: '9', detail: 'Track from homepage and service pages', change: 'watch', tone: 'watch' },
  { label: 'Mobile visitors', value: '68%', detail: 'Keep mobile speed and form usability high', change: '+5%', tone: 'good' }
];

const searchMarkers = [
  { label: 'Indexed pages', value: '37', detail: 'Watch new static pages as Google recrawls', change: 'stable', tone: 'good' },
  { label: 'Not indexed pages', value: '263', detail: 'Mostly old WordPress tag and missing URLs', change: 'cleanup', tone: 'watch' },
  { label: 'Sitemap status', value: 'Live', detail: 'Submitted under breezesiding.com', change: 'ok', tone: 'good' }
];

const keywordTargets = [
  {
    keyword: 'siding replacement seattle',
    page: '/siding-replacement-seattle.html',
    position: 16,
    clicks: 8,
    impressions: 420,
    plan: 'Strengthen city page content and add internal links from related blog posts.'
  },
  {
    keyword: 'siding contractor tacoma',
    page: '/siding-replacement-tacoma.html',
    position: 22,
    clicks: 5,
    impressions: 310,
    plan: 'Build local proof, completed project references, and Tacoma-specific service copy.'
  },
  {
    keyword: 'james hardie siding installer',
    page: '/siding-replacement.html',
    position: 18,
    clicks: 6,
    impressions: 275,
    plan: 'Add stronger James Hardie sections, FAQs, and supporting comparison content.'
  }
];

const performancePlan = [
  { title: 'Connect real data', detail: 'Link Google Analytics and Search Console data after the admin database is secured.' },
  { title: 'Track top three keyword pages', detail: 'Watch clicks, impressions, and position weekly before making heavy content changes.' },
  { title: 'Prioritize pages near page one', detail: 'Improve pages ranking between positions 8 and 20 first because they usually move fastest.' },
  { title: 'Keep conversion tied to SEO', detail: 'Compare keyword gains with estimate form submissions, calls, and scheduled appointments.' }
];

let leads = [...sampleLeads];
let slots = [...sampleSlots];

const board = document.querySelector('#pipeline-board');
const searchInput = document.querySelector('#lead-search');
const stageFilter = document.querySelector('#stage-filter');
const scheduleList = document.querySelector('#schedule-list');
const activityList = document.querySelector('#activity-list');
const addLeadButton = document.querySelector('#add-lead-button');
const addSlotButton = document.querySelector('#add-slot-button');
const dialog = document.querySelector('#lead-dialog');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('[data-tab-panel]');

function stageLabel(stageId) {
  return stages.find((stage) => stage.id === stageId)?.label || 'Unknown';
}

function filteredLeads() {
  const search = searchInput.value.trim().toLowerCase();
  const stage = stageFilter.value;

  return leads.filter((lead) => {
    const matchesStage = stage === 'all' || lead.stage === stage;
    const haystack = `${lead.name} ${lead.city} ${lead.project} ${lead.email} ${lead.phone}`.toLowerCase();
    return matchesStage && (!search || haystack.includes(search));
  });
}

function renderMetrics() {
  document.querySelector('#metric-new').textContent = leads.filter((lead) => lead.stage === 'new').length;
  document.querySelector('#metric-estimates').textContent = leads.filter((lead) => lead.stage === 'estimate-sent').length;
  document.querySelector('#metric-scheduled').textContent = leads.filter((lead) => lead.stage === 'scheduled').length;
  document.querySelector('#metric-review').textContent = leads.filter((lead) => lead.stage === 'review').length;
}

function renderBoard() {
  const visibleLeads = filteredLeads();
  const template = document.querySelector('#lead-card-template');
  board.innerHTML = '';

  stages.forEach((stage) => {
    const column = document.createElement('section');
    column.className = 'pipeline-column';
    column.dataset.stage = stage.id;

    const stageLeads = visibleLeads.filter((lead) => lead.stage === stage.id);
    const heading = document.createElement('h3');
    heading.innerHTML = `${stage.label}<span>${stageLeads.length}</span>`;
    column.append(heading);

    stageLeads.forEach((lead) => {
      const card = template.content.firstElementChild.cloneNode(true);
      card.querySelector('.lead-name').textContent = lead.name;
      card.querySelector('.lead-meta').textContent = `${lead.city} - ${lead.phone}`;
      card.querySelector('.lead-project').textContent = lead.project;
      card.querySelector('button').addEventListener('click', () => showLead(lead));
      column.append(card);
    });

    board.append(column);
  });
}

function renderSchedule() {
  scheduleList.innerHTML = '';
  slots.forEach((slot) => {
    const item = document.createElement('article');
    item.className = 'schedule-item';
    item.innerHTML = `<strong>${slot.date} - ${slot.time}</strong><span>${slot.label} - ${slot.status}</span>`;
    scheduleList.append(item);
  });
}

function renderActivity() {
  activityList.innerHTML = '';
  sampleActivity.forEach((activity) => {
    const item = document.createElement('article');
    item.className = 'activity-item';
    item.innerHTML = `<strong>${activity.title}</strong><span>${activity.detail}</span>`;
    activityList.append(item);
  });
}

function renderPerformanceMetrics() {
  document.querySelector('#metric-visitors').textContent = performanceSummary.visitors.toLocaleString();
  document.querySelector('#metric-clicks').textContent = performanceSummary.clicks.toLocaleString();
  document.querySelector('#metric-impressions').textContent = performanceSummary.impressions.toLocaleString();
  document.querySelector('#metric-position').textContent = performanceSummary.averagePosition.toFixed(1);
}

function renderMarkers(items, targetSelector) {
  const target = document.querySelector(targetSelector);
  target.innerHTML = '';

  items.forEach((item) => {
    const marker = document.createElement('article');
    marker.className = 'marker-item';
    marker.innerHTML = `
      <div>
        <strong>${item.label}: ${item.value}</strong>
        <span>${item.detail}</span>
      </div>
      <span class="change ${item.tone === 'watch' ? 'watch' : ''}">${item.change}</span>
    `;
    target.append(marker);
  });
}

function renderKeywords() {
  const body = document.querySelector('#keyword-body');
  body.innerHTML = '';

  keywordTargets.forEach((target) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${target.keyword}</td>
      <td>${target.page}</td>
      <td><span class="position">${target.position}</span></td>
      <td>${target.clicks}</td>
      <td>${target.impressions}</td>
      <td>${target.plan}</td>
    `;
    body.append(row);
  });
}

function renderPerformancePlan() {
  const target = document.querySelector('#performance-plan');
  target.innerHTML = '';

  performancePlan.forEach((item) => {
    const plan = document.createElement('article');
    plan.className = 'plan-item';
    plan.innerHTML = `<strong>${item.title}</strong><span>${item.detail}</span>`;
    target.append(plan);
  });
}

function renderPerformance() {
  renderPerformanceMetrics();
  renderMarkers(trafficMarkers, '#traffic-markers');
  renderMarkers(searchMarkers, '#search-markers');
  renderKeywords();
  renderPerformancePlan();
}

function showLead(lead) {
  document.querySelector('#dialog-name').textContent = lead.name;
  document.querySelector('#dialog-stage').textContent = stageLabel(lead.stage);
  document.querySelector('#dialog-project').textContent = lead.project;
  document.querySelector('#dialog-contact').textContent = `${lead.phone} - ${lead.email}`;
  document.querySelector('#dialog-city').textContent = lead.city;
  document.querySelector('#dialog-next').textContent = lead.nextStep;
  document.querySelector('#dialog-notes').textContent = lead.notes;
  dialog.showModal();
}

function addSampleLead() {
  const nextNumber = leads.length + 1001;
  leads = [
    {
      id: `lead-${nextNumber}`,
      name: `Sample Lead ${leads.length + 1}`,
      email: 'sample@example.com',
      phone: '253-555-0100',
      city: 'Federal Way',
      project: 'Siding estimate',
      stage: 'new',
      nextStep: 'Call to qualify project',
      notes: 'Sample record added in demo mode.',
      createdAt: new Date().toISOString()
    },
    ...leads
  ];
  renderAll();
}

function addSampleSlot() {
  slots = [
    ...slots,
    {
      id: `slot-${slots.length + 1}`,
      date: 'Next available',
      time: '3:00 PM - 5:00 PM',
      label: 'Estimate window',
      status: 'Open'
    }
  ];
  renderSchedule();
}

function activateTab(tabName) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.tabPanel === tabName);
  });
}

function renderAll() {
  renderMetrics();
  renderBoard();
  renderSchedule();
  renderActivity();
  renderPerformance();
}

searchInput.addEventListener('input', renderBoard);
stageFilter.addEventListener('change', renderBoard);
addLeadButton.addEventListener('click', addSampleLead);
addSlotButton.addEventListener('click', addSampleSlot);
tabButtons.forEach((button) => {
  button.addEventListener('click', () => activateTab(button.dataset.tab));
});

renderAll();
