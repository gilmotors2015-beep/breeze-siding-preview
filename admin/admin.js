const stages = [
  { id: 'new', label: 'Needs review' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'estimate-sent', label: 'Estimate sent' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'won', label: 'Won' },
  { id: 'review', label: 'Review follow-up' },
  { id: 'lost', label: 'Lost' },
  { id: 'spam', label: 'Spam' }
];

const customerRootPath = 'D:\\OneDrive\\Breeze Siding documents\\CUSTOMERS';
const localHelperPath = '.\\new-customer-folder-builder.ps1';

const folderTasks = [
  { key: 'folder', label: 'Customer folder exists' },
  { key: 'sections', label: 'Numbered sections created' },
  { key: 'starter', label: 'Starter pack copied or reviewed' },
  { key: 'template', label: 'Email templates linked from master folder' },
  { key: 'estimate', label: 'Estimate/proposal file ready' }
];

const qualityChecks = [
  { key: 'real-contact', label: 'Real name and reachable phone or email' },
  { key: 'service-area', label: 'Inside the Breeze Siding service area' },
  { key: 'real-project', label: 'Real siding, window, paint, deck, or exterior repair need' },
  { key: 'not-spam', label: 'Not an SEO pitch, bot form, or unrelated solicitation' }
];

const allQualityChecks = qualityChecks.map((check) => check.key);

const sampleLeads = [
  {
    id: 'lead-evergreen-lutheran',
    name: 'Evergreen Lutheran High School',
    contactPerson: 'Rick',
    email: 'Stored in local customer record',
    phone: 'Stored in local customer record',
    address: 'Stored in local customer record',
    city: 'Tacoma, WA',
    project: 'Siding replacement proposal',
    estimateNo: 'Stored locally',
    estimateDate: '5/8/2026',
    dueDate: '5/23/2026',
    proposalTotal: 'Stored locally',
    stage: 'estimate-sent',
    qualityChecksDone: allQualityChecks,
    folderStatus: 'Estimate sent',
    folderTasksDone: ['folder', 'sections', 'starter', 'template', 'estimate'],
    nextStep: 'Waiting for response to the proposal sent on 5/8/2026.',
    notes: 'Private proposal details are saved locally, not in the public admin demo.',
    createdAt: '2026-05-08T12:00:00'
  },
  {
    id: 'lead-mary',
    name: 'Mary',
    contactPerson: 'Mary',
    email: 'Stored in local customer record',
    phone: 'Stored in local customer record',
    address: 'Stored in local customer record',
    city: 'Stored locally',
    project: 'Siding replacement + paint proposal',
    estimateNo: 'Stored locally',
    estimateDate: 'Proposal sent',
    dueDate: 'Stored locally',
    proposalTotal: 'Stored locally',
    stage: 'estimate-sent',
    qualityChecksDone: allQualityChecks,
    folderStatus: 'Existing folder, estimate sent',
    folderTasksDone: ['folder', 'estimate'],
    nextStep: 'Waiting for response to the proposal.',
    notes: 'Private file review shows full and partial siding replacement plus paint proposal PDFs.',
    createdAt: '2026-04-26T12:00:00'
  },
  {
    id: 'lead-troy-wyatt-rambler',
    name: 'Troy Wyatt Rambler',
    contactPerson: 'Troy Wyatt',
    email: 'Stored in local customer record',
    phone: 'Stored in local customer record',
    address: 'Stored in local customer record',
    city: 'Stored locally',
    project: 'Repeat customer - exterior paint estimate',
    estimateNo: 'Stored locally',
    estimateDate: '5/6/2026',
    dueDate: 'Stored locally',
    proposalTotal: 'Stored locally',
    stage: 'estimate-sent',
    qualityChecksDone: allQualityChecks,
    folderStatus: 'Archived folder, new paint estimate sent',
    folderTasksDone: ['folder', 'estimate'],
    nextStep: 'Waiting for response to the exterior paint estimate.',
    notes: 'Repeat customer. Siding was completed previously; current opportunity is exterior paint.',
    createdAt: '2026-05-06T12:00:00'
  },
  {
    id: 'lead-jessica-miller',
    name: 'Jessica Miller',
    contactPerson: 'Jessica Miller',
    email: 'Stored in local customer record',
    phone: 'Stored in local customer record',
    address: 'Stored in local customer record',
    city: 'Stored locally',
    project: 'Repeat customer - vinyl repair',
    estimateNo: 'Stored locally',
    estimateDate: '4/10/2026',
    dueDate: 'Stored locally',
    proposalTotal: 'Stored locally',
    stage: 'won',
    qualityChecksDone: allQualityChecks,
    folderStatus: 'Agreement in place',
    folderTasksDone: ['folder', 'estimate'],
    nextStep: 'Waiting on materials before scheduling the vinyl repair.',
    notes: 'Repeat customer. Current vinyl repair agreement is in place; materials are pending.',
    createdAt: '2026-04-10T12:00:00'
  },
  {
    id: 'lead-1001',
    name: 'Sarah M.',
    contactPerson: 'Sarah M.',
    email: 'sarah@example.com',
    phone: '253-555-0188',
    address: '',
    city: 'Tacoma',
    project: 'Siding replacement',
    estimateNo: '',
    estimateDate: '',
    dueDate: '',
    proposalTotal: '',
    stage: 'new',
    qualityChecksDone: ['real-contact', 'service-area', 'real-project'],
    folderStatus: 'Locked until qualified',
    folderTasksDone: [],
    nextStep: 'Call back and confirm project details before creating a folder.',
    notes: 'Interested in fiber cement siding and trim around front windows.',
    createdAt: '2026-05-10T09:20:00'
  },
  {
    id: 'lead-1002',
    name: 'Daniel R.',
    contactPerson: 'Daniel R.',
    email: 'daniel@example.com',
    phone: '206-555-0144',
    address: '',
    city: 'Seattle',
    project: 'Window and siding estimate',
    estimateNo: '',
    estimateDate: '',
    dueDate: '',
    proposalTotal: '',
    stage: 'qualified',
    qualityChecksDone: allQualityChecks,
    folderStatus: 'Qualified, folder not created',
    folderTasksDone: [],
    nextStep: 'Create folder, then prepare estimate after walkthrough.',
    notes: 'Older home. Wants better weather protection and a cleaner front elevation.',
    createdAt: '2026-05-09T15:40:00'
  },
  {
    id: 'lead-1003',
    name: 'SEO Pitch Form',
    contactPerson: 'Unknown',
    email: 'Hidden spam example',
    phone: 'Not provided',
    address: '',
    city: 'Outside service area',
    project: 'Marketing solicitation',
    estimateNo: '',
    estimateDate: '',
    dueDate: '',
    proposalTotal: '',
    stage: 'spam',
    qualityChecksDone: [],
    folderStatus: 'No folder - spam',
    folderTasksDone: [],
    nextStep: 'No action needed.',
    notes: 'Example of a form submission that should never create a customer folder.',
    createdAt: '2026-05-09T17:10:00'
  },
  {
    id: 'lead-1004',
    name: 'Jon P.',
    contactPerson: 'Jon P.',
    email: 'jon@example.com',
    phone: '360-555-0126',
    address: '',
    city: 'Puyallup',
    project: 'Repair visit',
    estimateNo: '',
    estimateDate: '',
    dueDate: '',
    proposalTotal: '',
    stage: 'scheduled',
    qualityChecksDone: allQualityChecks,
    folderStatus: 'Starter pack copied',
    folderTasksDone: ['folder', 'sections', 'starter', 'template'],
    nextStep: 'Service visit scheduled',
    notes: 'Small leak-prone trim area near second-story window.',
    createdAt: '2026-05-07T16:30:00'
  },
  {
    id: 'lead-1005',
    name: 'Alicia T.',
    contactPerson: 'Alicia T.',
    email: 'alicia@example.com',
    phone: '253-555-0191',
    address: '',
    city: 'Spanaway',
    project: 'Completed siding project',
    estimateNo: '',
    estimateDate: '',
    dueDate: '',
    proposalTotal: '',
    stage: 'review',
    qualityChecksDone: allQualityChecks,
    folderStatus: 'Invoice ready',
    folderTasksDone: ['folder', 'sections', 'starter', 'template', 'estimate'],
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
  { title: 'Lead review gate added', detail: 'New leads now stay in Needs review until you mark them qualified.' },
  { title: 'Proposal sent', detail: 'Evergreen Lutheran High School proposal is out and waiting for response.' },
  { title: 'Proposal sent', detail: 'Mary has proposal options out and is waiting for response.' },
  { title: 'Waiting on materials', detail: 'Jessica Miller repair agreement is in place; materials are pending.' }
];

const workflowSteps = [
  { template: 'Review gate', title: 'Lead received', trigger: 'Customer fills out a form, calls, or is manually entered.', action: 'Leave the lead in Needs review until it is confirmed as real and useful.' },
  { template: 'Qualified', title: 'Lead approved', trigger: 'The request is real, in-service, and worth pursuing.', action: 'Mark qualified to unlock the customer folder command and scheduling flow.' },
  { template: 'schedule.oft', title: 'Appointment scheduling', trigger: 'Lead is qualified and ready for an estimate visit or walkthrough.', action: 'Send scheduling instructions or appointment confirmation.' },
  { template: 'Estimate.oft', title: 'Bid sent', trigger: 'Estimate PDF is ready after site visit or project review.', action: 'Send estimate email with the PDF attachment and track follow-up.' },
  { template: 'bid accepted.oft', title: 'Bid accepted', trigger: 'Customer approves the estimate.', action: 'Lay out job expectations, next steps, start date planning, and prep details.' },
  { template: 'Final invoice.oft', title: 'Final walkthrough and invoice', trigger: 'Work is complete or ready for closeout.', action: 'Schedule final walkthrough, send invoice, and include payment options.' },
  { template: 'feedback.oft', title: 'Feedback, review, and maintenance loop', trigger: 'Job is complete, or estimate did not move forward.', action: 'Request feedback, review, or future maintenance/checkup follow-up.' }
];

const performanceSummary = { visitors: 128, clicks: 42, impressions: 1840, averagePosition: 18.6 };

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
  { keyword: 'siding replacement seattle', page: '/siding-replacement-seattle.html', position: 16, clicks: 8, impressions: 420, plan: 'Strengthen city page content and add internal links from related blog posts.' },
  { keyword: 'siding contractor tacoma', page: '/siding-replacement-tacoma.html', position: 22, clicks: 5, impressions: 310, plan: 'Build local proof, completed project references, and Tacoma-specific service copy.' },
  { keyword: 'james hardie siding installer', page: '/siding-replacement.html', position: 18, clicks: 6, impressions: 275, plan: 'Add stronger James Hardie sections, FAQs, and supporting comparison content.' }
];

const performancePlan = [
  { title: 'Connect real data', detail: 'Link Google Analytics and Search Console data after the admin database is secured.' },
  { title: 'Track top three keyword pages', detail: 'Watch clicks, impressions, and position weekly before making heavy content changes.' },
  { title: 'Prioritize pages near page one', detail: 'Improve pages ranking between positions 8 and 20 first because they usually move fastest.' },
  { title: 'Keep conversion tied to SEO', detail: 'Compare keyword gains with estimate form submissions, calls, and scheduled appointments.' }
];

let leads = [...sampleLeads];
let slots = [...sampleSlots];
let activeLead = null;

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
const copyFolderCommandButton = document.querySelector('#copy-folder-command');
const folderWorkspace = document.querySelector('#dialog-folder-workspace');
const folderLockNote = document.querySelector('#dialog-folder-lock-note');
const markQualifiedButton = document.querySelector('#mark-qualified-button');
const markSpamButton = document.querySelector('#mark-spam-button');

function stageLabel(stageId) {
  return stages.find((stage) => stage.id === stageId)?.label || 'Unknown';
}

function safeFolderName(name) {
  return name.replace(/[<>:"/\\|?*]+/g, '-').replace(/\s+/g, ' ').trim();
}

function folderPathForLead(lead) {
  const base = lead.id === 'lead-troy-wyatt-rambler' ? `${customerRootPath}\\Archive` : customerRootPath;
  return `${base}\\${safeFolderName(lead.name)}`;
}

function commandForLead(lead) {
  return `powershell -NoProfile -ExecutionPolicy Bypass -File "${localHelperPath}" -CustomerName "${safeFolderName(lead.name)}"`;
}

function canUseFolderActions(lead) {
  return !['new', 'spam', 'lost'].includes(lead.stage) || lead.folderTasksDone.includes('folder');
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || 'Not set';
}

function filteredLeads() {
  const search = searchInput.value.trim().toLowerCase();
  const stage = stageFilter.value;

  return leads.filter((lead) => {
    const matchesStage = stage === 'all' || lead.stage === stage;
    const haystack = `${lead.name} ${lead.contactPerson} ${lead.city} ${lead.project} ${lead.email} ${lead.phone} ${lead.estimateNo}`.toLowerCase();
    return matchesStage && (!search || haystack.includes(search));
  });
}

function count(stageId) {
  return leads.filter((lead) => lead.stage === stageId).length;
}

function renderMetrics() {
  document.querySelector('#metric-new').textContent = count('new');
  document.querySelector('#metric-qualified').textContent = count('qualified');
  document.querySelector('#metric-estimates').textContent = count('estimate-sent');
  document.querySelector('#metric-spam').textContent = count('spam');
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

function renderWorkflow() {
  const target = document.querySelector('#workflow-steps');
  target.innerHTML = '';
  workflowSteps.forEach((step, index) => {
    const item = document.createElement('article');
    item.className = 'workflow-step';
    item.innerHTML = `<span class="workflow-number">${index + 1}</span><div><strong>${step.title}</strong><span>${step.trigger}</span><span>${step.action}</span></div><span class="workflow-template">${step.template}</span>`;
    target.append(item);
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
    marker.innerHTML = `<div><strong>${item.label}: ${item.value}</strong><span>${item.detail}</span></div><span class="change ${item.tone === 'watch' ? 'watch' : ''}">${item.change}</span>`;
    target.append(marker);
  });
}

function renderKeywords() {
  const body = document.querySelector('#keyword-body');
  body.innerHTML = '';
  keywordTargets.forEach((target) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${target.keyword}</td><td>${target.page}</td><td><span class="position">${target.position}</span></td><td>${target.clicks}</td><td>${target.impressions}</td><td>${target.plan}</td>`;
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

function renderQualityChecklist(lead) {
  const list = document.querySelector('#dialog-quality-checklist');
  const status = document.querySelector('#dialog-quality-status');
  const completed = lead.qualityChecksDone || [];
  const isQualified = completed.length === qualityChecks.length && !['new', 'spam'].includes(lead.stage);

  status.textContent = lead.stage === 'spam' ? 'Spam' : isQualified ? 'Qualified' : 'Needs review';
  status.classList.toggle('is-qualified', isQualified);
  status.classList.toggle('is-spam', lead.stage === 'spam');
  list.innerHTML = '';

  qualityChecks.forEach((check) => {
    const done = completed.includes(check.key);
    const item = document.createElement('li');
    item.className = done ? 'is-done' : '';
    item.innerHTML = `<span>${done ? 'Yes' : 'Check'}</span>${check.label}`;
    list.append(item);
  });
}

function renderFolderChecklist(lead, locked) {
  const list = document.querySelector('#dialog-folder-checklist');
  list.innerHTML = '';
  folderTasks.forEach((task) => {
    const done = !locked && lead.folderTasksDone.includes(task.key);
    const item = document.createElement('li');
    item.className = done ? 'is-done' : '';
    item.innerHTML = `<span>${done ? 'Done' : locked ? 'Locked' : 'Next'}</span>${task.label}`;
    list.append(item);
  });
}

function renderFolderPanel(lead) {
  const unlocked = canUseFolderActions(lead);
  folderWorkspace.classList.toggle('is-locked', !unlocked);
  folderLockNote.textContent = unlocked
    ? 'Folder tools are available for this qualified or active customer.'
    : 'Review this lead first. If it is real and worth pursuing, mark it qualified to unlock folder creation.';

  setText('#dialog-folder-status', unlocked ? lead.folderStatus : 'Locked until qualified');
  setText('#dialog-folder-path', unlocked ? folderPathForLead(lead) : 'Qualify the lead before creating a OneDrive folder.');
  setText('#dialog-folder-command', unlocked ? commandForLead(lead) : 'Folder command unlocks after qualification.');
  copyFolderCommandButton.disabled = !unlocked;
  copyFolderCommandButton.textContent = unlocked ? 'Copy folder command' : 'Locked until qualified';
  renderFolderChecklist(lead, !unlocked);
}

function showLead(lead) {
  activeLead = lead;
  setText('#dialog-name', lead.name);
  setText('#dialog-stage', stageLabel(lead.stage));
  setText('#dialog-project', lead.project);
  setText('#dialog-contact-person', lead.contactPerson);
  setText('#dialog-contact', `${lead.phone} - ${lead.email}`);
  setText('#dialog-address', lead.address);
  setText('#dialog-city', lead.city);
  setText('#dialog-estimate', lead.estimateNo ? `${lead.estimateNo} - ${lead.estimateDate}` : 'Not sent');
  setText('#dialog-total', lead.proposalTotal);
  setText('#dialog-due', lead.dueDate);
  setText('#dialog-next', lead.nextStep);
  setText('#dialog-notes', lead.notes);
  renderQualityChecklist(lead);
  renderFolderPanel(lead);
  dialog.showModal();
}

async function copyFolderCommand() {
  if (!activeLead || !copyFolderCommandButton || !canUseFolderActions(activeLead)) return;
  const command = commandForLead(activeLead);
  try {
    await navigator.clipboard.writeText(command);
    copyFolderCommandButton.textContent = 'Copied';
  } catch {
    copyFolderCommandButton.textContent = 'Copy failed';
  }
}

function markActiveLeadQualified() {
  if (!activeLead) return;
  activeLead.stage = 'qualified';
  activeLead.qualityChecksDone = allQualityChecks;
  activeLead.folderStatus = activeLead.folderTasksDone.includes('folder') ? activeLead.folderStatus : 'Qualified, folder not created';
  activeLead.nextStep = activeLead.folderTasksDone.includes('folder') ? activeLead.nextStep : 'Create the customer folder, then schedule or prepare the estimate.';
  renderAll();
  showLead(activeLead);
}

function markActiveLeadSpam() {
  if (!activeLead) return;
  activeLead.stage = 'spam';
  activeLead.qualityChecksDone = [];
  activeLead.folderStatus = 'No folder - spam';
  activeLead.folderTasksDone = [];
  activeLead.nextStep = 'No action needed.';
  renderAll();
  showLead(activeLead);
}

function addSampleLead() {
  const nextNumber = leads.length + 1001;
  leads = [{
    id: `lead-${nextNumber}`,
    name: `Sample Lead ${leads.length + 1}`,
    contactPerson: `Sample Lead ${leads.length + 1}`,
    email: 'sample@example.com',
    phone: '253-555-0100',
    address: '',
    city: 'Federal Way',
    project: 'Siding estimate',
    estimateNo: '',
    estimateDate: '',
    dueDate: '',
    proposalTotal: '',
    stage: 'new',
    qualityChecksDone: ['real-contact'],
    folderStatus: 'Locked until qualified',
    folderTasksDone: [],
    nextStep: 'Review and qualify before creating a folder.',
    notes: 'Sample record added in demo mode.',
    createdAt: new Date().toISOString()
  }, ...leads];
  renderAll();
}

function addSampleSlot() {
  slots = [...slots, { id: `slot-${slots.length + 1}`, date: 'Next available', time: '3:00 PM - 5:00 PM', label: 'Estimate window', status: 'Open' }];
  renderSchedule();
}

function activateTab(tabName) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
  tabPanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.tabPanel === tabName));
}

function renderAll() {
  renderMetrics();
  renderBoard();
  renderSchedule();
  renderActivity();
  renderWorkflow();
  renderPerformance();
}

searchInput.addEventListener('input', renderBoard);
stageFilter.addEventListener('change', renderBoard);
addLeadButton.addEventListener('click', addSampleLead);
addSlotButton.addEventListener('click', addSampleSlot);
if (copyFolderCommandButton) copyFolderCommandButton.addEventListener('click', copyFolderCommand);
if (markQualifiedButton) markQualifiedButton.addEventListener('click', markActiveLeadQualified);
if (markSpamButton) markSpamButton.addEventListener('click', markActiveLeadSpam);
tabButtons.forEach((button) => button.addEventListener('click', () => activateTab(button.dataset.tab)));

renderAll();
