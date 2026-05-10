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
      card.querySelector('.lead-meta').textContent = `${lead.city} · ${lead.phone}`;
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
    item.innerHTML = `<strong>${slot.date} · ${slot.time}</strong><span>${slot.label} · ${slot.status}</span>`;
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

function showLead(lead) {
  document.querySelector('#dialog-name').textContent = lead.name;
  document.querySelector('#dialog-stage').textContent = stageLabel(lead.stage);
  document.querySelector('#dialog-project').textContent = lead.project;
  document.querySelector('#dialog-contact').textContent = `${lead.phone} · ${lead.email}`;
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

function renderAll() {
  renderMetrics();
  renderBoard();
  renderSchedule();
  renderActivity();
}

searchInput.addEventListener('input', renderBoard);
stageFilter.addEventListener('change', renderBoard);
addLeadButton.addEventListener('click', addSampleLead);
addSlotButton.addEventListener('click', addSampleSlot);

renderAll();
