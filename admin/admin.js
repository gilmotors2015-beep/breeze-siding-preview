const stages = [
  ['new', 'Needs review'],
  ['qualified', 'Qualified'],
  ['contacted', 'Contacted'],
  ['estimate-sent', 'Estimate sent'],
  ['scheduled', 'Scheduled'],
  ['won', 'Won'],
  ['review', 'Review follow-up'],
  ['lost', 'Lost'],
  ['spam', 'Spam']
].map(([id, label]) => ({ id, label }));

const customerRootPath = 'D:\\OneDrive\\Breeze Siding documents\\CUSTOMERS';
const localHelperPath = '.\\new-customer-folder-builder.ps1';
const qualityChecks = [
  ['real-contact', 'Real name and reachable phone or email'],
  ['service-area', 'Inside the Breeze Siding service area'],
  ['real-project', 'Real siding, window, paint, deck, or exterior repair need'],
  ['not-spam', 'Not an SEO pitch, bot form, or unrelated solicitation']
].map(([key, label]) => ({ key, label }));
const allQualityChecks = qualityChecks.map((check) => check.key);
const folderTasks = [
  ['folder', 'Customer folder exists'],
  ['sections', 'Numbered sections created'],
  ['starter', 'Starter pack copied or reviewed'],
  ['template', 'Email templates linked from master folder'],
  ['estimate', 'Estimate/proposal file ready']
].map(([key, label]) => ({ key, label }));

const leadBase = { email: 'Stored in local customer record', phone: 'Stored in local customer record', address: 'Stored in local customer record', estimateNo: 'Stored locally', proposalTotal: 'Stored locally', qualityChecksDone: allQualityChecks };
const sampleLeads = [
  { ...leadBase, id: 'lead-evergreen-lutheran', name: 'Evergreen Lutheran High School', contactPerson: 'Rick', city: 'Tacoma, WA', project: 'Siding replacement proposal', estimateDate: '5/8/2026', dueDate: '5/23/2026', stage: 'estimate-sent', folderStatus: 'Estimate sent', folderTasksDone: ['folder', 'sections', 'starter', 'template', 'estimate'], nextStep: 'Waiting for response to the proposal sent on 5/8/2026.', notes: 'Private proposal details are saved locally, not in the public admin demo.', createdAt: '2026-05-08T12:00:00' },
  { ...leadBase, id: 'lead-mary', name: 'Mary', contactPerson: 'Mary', city: 'Stored locally', project: 'Siding replacement + paint proposal', estimateDate: 'Proposal sent', dueDate: 'Stored locally', stage: 'estimate-sent', folderStatus: 'Existing folder, estimate sent', folderTasksDone: ['folder', 'estimate'], nextStep: 'Waiting for response to the proposal.', notes: 'Private file review shows full and partial siding replacement plus paint proposal PDFs.', createdAt: '2026-04-26T12:00:00' },
  { ...leadBase, id: 'lead-troy-wyatt-rambler', name: 'Troy Wyatt Rambler', contactPerson: 'Troy Wyatt', city: 'Stored locally', project: 'Repeat customer - exterior paint estimate', estimateDate: '5/6/2026', dueDate: 'Stored locally', stage: 'estimate-sent', folderStatus: 'Archived folder, new paint estimate sent', folderTasksDone: ['folder', 'estimate'], nextStep: 'Waiting for response to the exterior paint estimate.', notes: 'Repeat customer. Siding was completed previously; current opportunity is exterior paint.', createdAt: '2026-05-06T12:00:00' },
  { ...leadBase, id: 'lead-jessica-miller', name: 'Jessica Miller', contactPerson: 'Jessica Miller', city: 'Stored locally', project: 'Repeat customer - vinyl repair', estimateDate: '4/10/2026', dueDate: 'Stored locally', stage: 'won', folderStatus: 'Agreement in place', folderTasksDone: ['folder', 'estimate'], nextStep: 'Waiting on materials before scheduling the vinyl repair.', notes: 'Repeat customer. Current vinyl repair agreement is in place; materials are pending.', createdAt: '2026-04-10T12:00:00' },
  { id: 'lead-1001', name: 'Sarah M.', contactPerson: 'Sarah M.', email: 'sarah@example.com', phone: '253-555-0188', address: '', city: 'Tacoma', project: 'Siding replacement', estimateNo: '', estimateDate: '', dueDate: '', proposalTotal: '', stage: 'new', qualityChecksDone: ['real-contact', 'service-area', 'real-project'], folderStatus: 'Locked until qualified', folderTasksDone: [], nextStep: 'Call back and confirm project details before creating a folder.', notes: 'Interested in fiber cement siding and trim around front windows.', createdAt: '2026-05-10T09:20:00' },
  { id: 'lead-1002', name: 'Daniel R.', contactPerson: 'Daniel R.', email: 'daniel@example.com', phone: '206-555-0144', address: '', city: 'Seattle', project: 'Window and siding estimate', estimateNo: '', estimateDate: '', dueDate: '', proposalTotal: '', stage: 'qualified', qualityChecksDone: allQualityChecks, folderStatus: 'Qualified, folder not created', folderTasksDone: [], nextStep: 'Create folder, then prepare estimate after walkthrough.', notes: 'Older home. Wants better weather protection and a cleaner front elevation.', createdAt: '2026-05-09T15:40:00' },
  { id: 'lead-1003', name: 'SEO Pitch Form', contactPerson: 'Unknown', email: 'Hidden spam example', phone: 'Not provided', address: '', city: 'Outside service area', project: 'Marketing solicitation', estimateNo: '', estimateDate: '', dueDate: '', proposalTotal: '', stage: 'spam', qualityChecksDone: [], folderStatus: 'No folder - spam', folderTasksDone: [], nextStep: 'No action needed.', notes: 'Example of a form submission that should never create a customer folder.', createdAt: '2026-05-09T17:10:00' },
  { id: 'lead-1004', name: 'Jon P.', contactPerson: 'Jon P.', email: 'jon@example.com', phone: '360-555-0126', address: '', city: 'Puyallup', project: 'Repair visit', estimateNo: '', estimateDate: '', dueDate: '', proposalTotal: '', stage: 'scheduled', qualityChecksDone: allQualityChecks, folderStatus: 'Starter pack copied', folderTasksDone: ['folder', 'sections', 'starter', 'template'], nextStep: 'Service visit scheduled', notes: 'Small leak-prone trim area near second-story window.', createdAt: '2026-05-07T16:30:00' },
  { id: 'lead-1005', name: 'Alicia T.', contactPerson: 'Alicia T.', email: 'alicia@example.com', phone: '253-555-0191', address: '', city: 'Spanaway', project: 'Completed siding project', estimateNo: '', estimateDate: '', dueDate: '', proposalTotal: '', stage: 'review', qualityChecksDone: allQualityChecks, folderStatus: 'Invoice ready', folderTasksDone: ['folder', 'sections', 'starter', 'template', 'estimate'], nextStep: 'Send review request link', notes: 'Project completed. Customer sounded happy at final walkthrough.', createdAt: '2026-05-05T14:10:00' }
];

const slots = [
  { date: 'Tue May 12', time: '9:00 AM - 11:00 AM', label: 'Estimate window', status: 'Open' },
  { date: 'Wed May 13', time: '1:00 PM - 3:00 PM', label: 'Walkthrough', status: 'Held' },
  { date: 'Fri May 15', time: '10:00 AM - 12:00 PM', label: 'Repair visit', status: 'Open' }
];
const activity = [
  ['Lead review gate added', 'New leads now stay in Needs review until you mark them qualified.'],
  ['Proposal sent', 'Evergreen Lutheran High School proposal is out and waiting for response.'],
  ['Proposal sent', 'Mary has proposal options out and is waiting for response.'],
  ['Waiting on materials', 'Jessica Miller repair agreement is in place; materials are pending.']
];
const workflowSteps = [
  ['Review gate', 'Lead received', 'Customer fills out a form, calls, or is manually entered.', 'Leave the lead in Needs review until it is confirmed as real and useful.'],
  ['Qualified', 'Lead approved', 'The request is real, in-service, and worth pursuing.', 'Mark qualified to unlock the customer folder command and scheduling flow.'],
  ['schedule.oft', 'Appointment scheduling', 'Lead is qualified and ready for an estimate visit or walkthrough.', 'Send scheduling instructions or appointment confirmation.'],
  ['Estimate.oft', 'Bid sent', 'Estimate PDF is ready after site visit or project review.', 'Send estimate email with the PDF attachment and track follow-up.'],
  ['bid accepted.oft', 'Bid accepted', 'Customer approves the estimate.', 'Lay out job expectations, next steps, start date planning, and prep details.'],
  ['Final invoice.oft', 'Final walkthrough and invoice', 'Work is complete or ready for closeout.', 'Schedule final walkthrough, send invoice, and include payment options.'],
  ['feedback.oft', 'Feedback, review, and maintenance loop', 'Job is complete, or estimate did not move forward.', 'Request feedback, review, or future maintenance/checkup follow-up.']
].map(([template, title, trigger, action]) => ({ template, title, trigger, action }));
const performanceSummary = { visitors: 128, clicks: 42, impressions: 1840, averagePosition: 18.6 };
const trafficMarkers = [
  ['Organic search visitors', '74', 'Primary traffic source to watch after launch', '+12%', 'good'],
  ['Estimate form starts', '9', 'Track from homepage and service pages', 'watch', 'watch'],
  ['Mobile visitors', '68%', 'Keep mobile speed and form usability high', '+5%', 'good']
].map(([label, value, detail, change, tone]) => ({ label, value, detail, change, tone }));
const searchMarkers = [
  ['Indexed pages', '37', 'Watch new static pages as Google recrawls', 'stable', 'good'],
  ['Not indexed pages', '263', 'Mostly old WordPress tag and missing URLs', 'cleanup', 'watch'],
  ['Sitemap status', 'Live', 'Submitted under breezesiding.com', 'ok', 'good']
].map(([label, value, detail, change, tone]) => ({ label, value, detail, change, tone }));
const keywordTargets = [
  ['siding replacement seattle', '/siding-replacement-seattle.html', 16, 8, 420, 'Strengthen city page content and add internal links from related blog posts.'],
  ['siding contractor tacoma', '/siding-replacement-tacoma.html', 22, 5, 310, 'Build local proof, completed project references, and Tacoma-specific service copy.'],
  ['james hardie siding installer', '/siding-replacement.html', 18, 6, 275, 'Add stronger James Hardie sections, FAQs, and supporting comparison content.']
].map(([keyword, page, position, clicks, impressions, plan]) => ({ keyword, page, position, clicks, impressions, plan }));
const performancePlan = [
  ['Connect real data', 'Link Google Analytics and Search Console data after the admin database is secured.'],
  ['Track top three keyword pages', 'Watch clicks, impressions, and position weekly before making heavy content changes.'],
  ['Prioritize pages near page one', 'Improve pages ranking between positions 8 and 20 first because they usually move fastest.'],
  ['Keep conversion tied to SEO', 'Compare keyword gains with estimate form submissions, calls, and scheduled appointments.']
].map(([title, detail]) => ({ title, detail }));

let leads = [...sampleLeads];
let activeLead = null;

const $ = (selector) => document.querySelector(selector);
const board = $('#pipeline-board');
const dialog = $('#lead-dialog');
const copyFolderCommandButton = $('#copy-folder-command');
const folderWorkspace = $('#dialog-folder-workspace');
const folderLockNote = $('#dialog-folder-lock-note');

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
  const element = $(selector);
  if (element) element.textContent = value || 'Not set';
}
function filteredLeads() {
  const search = $('#lead-search').value.trim().toLowerCase();
  const stage = $('#stage-filter').value;
  return leads.filter((lead) => {
    const matchesStage = stage === 'all' || lead.stage === stage;
    const text = `${lead.name} ${lead.contactPerson} ${lead.city} ${lead.project} ${lead.email} ${lead.phone} ${lead.estimateNo}`.toLowerCase();
    return matchesStage && (!search || text.includes(search));
  });
}
function renderMetrics() {
  setText('#metric-new', leads.filter((lead) => lead.stage === 'new').length);
  setText('#metric-qualified', leads.filter((lead) => lead.stage === 'qualified').length);
  setText('#metric-estimates', leads.filter((lead) => lead.stage === 'estimate-sent').length);
  setText('#metric-spam', leads.filter((lead) => lead.stage === 'spam').length);
}
function renderBoard() {
  const visibleLeads = filteredLeads();
  const template = $('#lead-card-template');
  board.innerHTML = '';
  stages.forEach((stage) => {
    const column = document.createElement('section');
    column.className = 'pipeline-column';
    const stageLeads = visibleLeads.filter((lead) => lead.stage === stage.id);
    column.innerHTML = `<h3>${stage.label}<span>${stageLeads.length}</span></h3>`;
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
  $('#schedule-list').innerHTML = slots.map((slot) => `<article class="schedule-item"><strong>${slot.date} - ${slot.time}</strong><span>${slot.label} - ${slot.status}</span></article>`).join('');
}
function renderActivity() {
  $('#activity-list').innerHTML = activity.map(([title, detail]) => `<article class="activity-item"><strong>${title}</strong><span>${detail}</span></article>`).join('');
}
function renderWorkflow() {
  $('#workflow-steps').innerHTML = workflowSteps.map((step, index) => `<article class="workflow-step"><span class="workflow-number">${index + 1}</span><div><strong>${step.title}</strong><span>${step.trigger}</span><span>${step.action}</span></div><span class="workflow-template">${step.template}</span></article>`).join('');
}
function renderPerformance() {
  setText('#metric-visitors', performanceSummary.visitors.toLocaleString());
  setText('#metric-clicks', performanceSummary.clicks.toLocaleString());
  setText('#metric-impressions', performanceSummary.impressions.toLocaleString());
  setText('#metric-position', performanceSummary.averagePosition.toFixed(1));
  renderMarkers(trafficMarkers, '#traffic-markers');
  renderMarkers(searchMarkers, '#search-markers');
  $('#keyword-body').innerHTML = keywordTargets.map((target) => `<tr><td>${target.keyword}</td><td>${target.page}</td><td><span class="position">${target.position}</span></td><td>${target.clicks}</td><td>${target.impressions}</td><td>${target.plan}</td></tr>`).join('');
  $('#performance-plan').innerHTML = performancePlan.map((item) => `<article class="plan-item"><strong>${item.title}</strong><span>${item.detail}</span></article>`).join('');
}
function renderMarkers(items, selector) {
  $(selector).innerHTML = items.map((item) => `<article class="marker-item"><div><strong>${item.label}: ${item.value}</strong><span>${item.detail}</span></div><span class="change ${item.tone === 'watch' ? 'watch' : ''}">${item.change}</span></article>`).join('');
}
function renderChecklist(selector, checks, doneKeys, doneText, pendingText) {
  $(selector).innerHTML = checks.map((check) => {
    const done = doneKeys.includes(check.key);
    return `<li class="${done ? 'is-done' : ''}"><span>${done ? doneText : pendingText}</span>${check.label}</li>`;
  }).join('');
}
function renderQualityChecklist(lead) {
  const completed = lead.qualityChecksDone || [];
  const isQualified = completed.length === qualityChecks.length && !['new', 'spam'].includes(lead.stage);
  const status = $('#dialog-quality-status');
  status.textContent = lead.stage === 'spam' ? 'Spam' : isQualified ? 'Qualified' : 'Needs review';
  status.classList.toggle('is-qualified', isQualified);
  status.classList.toggle('is-spam', lead.stage === 'spam');
  renderChecklist('#dialog-quality-checklist', qualityChecks, completed, 'Yes', 'Check');
}
function renderFolderPanel(lead) {
  const unlocked = canUseFolderActions(lead);
  folderWorkspace.classList.toggle('is-locked', !unlocked);
  folderLockNote.textContent = unlocked ? 'Folder tools are available for this qualified or active customer.' : 'Review this lead first. If it is real and worth pursuing, mark it qualified to unlock folder creation.';
  setText('#dialog-folder-status', unlocked ? lead.folderStatus : 'Locked until qualified');
  setText('#dialog-folder-path', unlocked ? folderPathForLead(lead) : 'Qualify the lead before creating a OneDrive folder.');
  setText('#dialog-folder-command', unlocked ? commandForLead(lead) : 'Folder command unlocks after qualification.');
  copyFolderCommandButton.disabled = !unlocked;
  copyFolderCommandButton.textContent = unlocked ? 'Copy folder command' : 'Locked until qualified';
  const doneKeys = unlocked ? lead.folderTasksDone : [];
  renderChecklist('#dialog-folder-checklist', folderTasks, doneKeys, 'Done', unlocked ? 'Next' : 'Locked');
}
function refreshLeadDetails(lead) {
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
}
function showLead(lead) {
  refreshLeadDetails(lead);
  if (!dialog.open) dialog.showModal();
}
async function copyFolderCommand() {
  if (!activeLead || !canUseFolderActions(activeLead)) return;
  try {
    await navigator.clipboard.writeText(commandForLead(activeLead));
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
  refreshLeadDetails(activeLead);
}
function markActiveLeadSpam() {
  if (!activeLead) return;
  activeLead.stage = 'spam';
  activeLead.qualityChecksDone = [];
  activeLead.folderStatus = 'No folder - spam';
  activeLead.folderTasksDone = [];
  activeLead.nextStep = 'No action needed.';
  renderAll();
  refreshLeadDetails(activeLead);
}
function addSampleLead() {
  const nextNumber = leads.length + 1001;
  leads = [{ id: `lead-${nextNumber}`, name: `Sample Lead ${leads.length + 1}`, contactPerson: `Sample Lead ${leads.length + 1}`, email: 'sample@example.com', phone: '253-555-0100', address: '', city: 'Federal Way', project: 'Siding estimate', estimateNo: '', estimateDate: '', dueDate: '', proposalTotal: '', stage: 'new', qualityChecksDone: ['real-contact'], folderStatus: 'Locked until qualified', folderTasksDone: [], nextStep: 'Review and qualify before creating a folder.', notes: 'Sample record added in demo mode.', createdAt: new Date().toISOString() }, ...leads];
  renderAll();
}
function addSampleSlot() {
  slots.push({ date: 'Next available', time: '3:00 PM - 5:00 PM', label: 'Estimate window', status: 'Open' });
  renderSchedule();
}
function activateTab(tabName) {
  document.querySelectorAll('.tab-button').forEach((button) => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-tab-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.tabPanel === tabName));
}
function renderAll() {
  renderMetrics();
  renderBoard();
  renderSchedule();
  renderActivity();
  renderWorkflow();
  renderPerformance();
}

$('#lead-search').addEventListener('input', renderBoard);
$('#stage-filter').addEventListener('change', renderBoard);
$('#add-lead-button').addEventListener('click', addSampleLead);
$('#add-slot-button').addEventListener('click', addSampleSlot);
copyFolderCommandButton.addEventListener('click', copyFolderCommand);
$('#mark-qualified-button').addEventListener('click', markActiveLeadQualified);
$('#mark-spam-button').addEventListener('click', markActiveLeadSpam);
document.querySelectorAll('.tab-button').forEach((button) => button.addEventListener('click', () => activateTab(button.dataset.tab)));

renderAll();
