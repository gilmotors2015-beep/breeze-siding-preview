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
  ['sections', 'Numbered sections reviewed'],
  ['starter', 'Starter pack copied or reviewed'],
  ['template', 'Email templates linked from master folder'],
  ['estimate', 'Estimate/proposal file ready']
].map(([key, label]) => ({ key, label }));

const privateRecord = {
  email: 'Stored in private customer record',
  phone: 'Stored in private customer record',
  address: 'Stored in private customer record',
  city: 'Stored privately',
  estimateNo: 'Stored privately',
  proposalTotal: 'Stored privately',
  qualityChecksDone: allQualityChecks
};

const customerRecords = [
  { ...privateRecord, id: 'lead-evergreen-lutheran', name: 'Evergreen Lutheran High School', contactPerson: 'Rick', city: 'Tacoma, WA', project: 'Siding replacement proposal', estimateDate: '5/8/2026', dueDate: '5/23/2026', stage: 'estimate-sent', folderStatus: 'Estimate sent', folderTasksDone: ['folder', 'sections', 'starter', 'template', 'estimate'], nextStep: 'Waiting for response to the proposal sent on 5/8/2026.', notes: 'Private proposal details are saved locally, not in the public admin view.', createdAt: '2026-05-08T12:00:00' },
  { ...privateRecord, id: 'lead-mary', name: 'Mary', contactPerson: 'Mary', project: 'Siding replacement + paint proposal', estimateDate: 'Proposal sent', dueDate: 'Stored privately', stage: 'estimate-sent', folderStatus: 'Existing folder, estimate sent', folderTasksDone: ['folder', 'estimate'], nextStep: 'Waiting for response to the proposal.', notes: 'Proposal options are in the local customer folder.', createdAt: '2026-04-26T12:00:00' },
  { ...privateRecord, id: 'lead-troy-wyatt-rambler', name: 'Troy Wyatt Rambler', contactPerson: 'Troy Wyatt', project: 'Repeat customer - exterior paint estimate', estimateDate: '5/6/2026', dueDate: 'Stored privately', stage: 'estimate-sent', folderStatus: 'Archived folder, new paint estimate sent', folderTasksDone: ['folder', 'estimate'], nextStep: 'Waiting for response to the exterior paint estimate.', notes: 'Repeat customer. Siding was completed previously; current opportunity is exterior paint.', createdAt: '2026-05-06T12:00:00' },
  { ...privateRecord, id: 'lead-fran-construction', name: 'Fran Construction', contactPerson: 'Fran Construction', project: 'Construction proposal', estimateDate: '4/26/2026', dueDate: 'Stored privately', stage: 'estimate-sent', folderStatus: 'Existing folder, estimate sent', folderTasksDone: ['folder', 'estimate'], nextStep: 'Waiting for reply to the estimate.', notes: 'Existing customer folder confirmed with proposal and estimate files present.', createdAt: '2026-04-26T18:09:00' },
  { ...privateRecord, id: 'lead-jessica-miller', name: 'Jessica Miller', contactPerson: 'Jessica Miller', project: 'Repeat customer - vinyl repair', estimateDate: '4/10/2026', dueDate: 'Stored privately', stage: 'won', folderStatus: 'Agreement in place', folderTasksDone: ['folder', 'estimate'], nextStep: 'Waiting on materials before scheduling the vinyl repair.', notes: 'Repeat customer. Current vinyl repair agreement is in place; materials are pending.', createdAt: '2026-04-10T12:00:00' }
];

const slots = [];
const activity = [
  ['Fran Construction added', 'Estimate has been sent and the current step is waiting for reply.'],
  ['Proposal sent', 'Evergreen Lutheran High School proposal is out and waiting for response.'],
  ['Proposal sent', 'Mary has proposal options out and is waiting for response.'],
  ['Paint estimate sent', 'Troy Wyatt Rambler is a repeat customer with a new paint estimate pending.'],
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
const performanceSummary = { visitors: 0, clicks: 0, impressions: 0, averagePosition: 0 };
const trafficMarkers = [
  ['Analytics connection', 'Pending', 'Connect Google Analytics after the private admin layer is ready.', 'next', 'watch'],
  ['Form submissions', 'Email only', 'Leads currently arrive by email, then can be manually entered into this board.', 'active', 'good'],
  ['Schedule data', 'Manual', 'Calendar availability is ready to connect after the secure backend exists.', 'next', 'watch']
].map(([label, value, detail, change, tone]) => ({ label, value, detail, change, tone }));
const searchMarkers = [
  ['Search Console connection', 'Pending', 'Use Search Console directly until this dashboard has a secure data connection.', 'next', 'watch'],
  ['Sitemap', 'Submitted', 'Live site sitemap is available for Google discovery.', 'ok', 'good'],
  ['Index follow-up', 'Manual', 'Review non-indexed pages in Search Console after Google recrawls the live domain.', 'watch', 'watch']
].map(([label, value, detail, change, tone]) => ({ label, value, detail, change, tone }));
const keywordTargets = [
  ['siding replacement seattle', '/siding-replacement-seattle.html', 'Pending', 0, 0, 'Track once Search Console data is connected.'],
  ['siding contractor tacoma', '/siding-replacement-tacoma.html', 'Pending', 0, 0, 'Track once Search Console data is connected.'],
  ['james hardie siding installer', '/siding-replacement.html', 'Pending', 0, 0, 'Track once Search Console data is connected.']
].map(([keyword, page, position, clicks, impressions, plan]) => ({ keyword, page, position, clicks, impressions, plan }));
const performancePlan = [
  ['Secure the private layer', 'Contact information, lead submission storage, and calendar data need login protection before going fully live.'],
  ['Connect real form data', 'Route qualified form submissions into the board after spam filtering and review.'],
  ['Connect Search Console and Analytics', 'Bring real visitors, clicks, impressions, and keyword positions into the performance tab.'],
  ['Add contact records', 'Store phone, email, address, and notes in a private database instead of public static files.']
].map(([title, detail]) => ({ title, detail }));

let leads = [...customerRecords];
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
  if (lead.folderPathOverride) return lead.folderPathOverride;
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
  $('#schedule-list').innerHTML = slots.length
    ? slots.map((slot) => `<article class="schedule-item"><strong>${slot.date} - ${slot.time}</strong><span>${slot.label} - ${slot.status}</span></article>`).join('')
    : '<article class="schedule-item"><strong>No customer appointments entered yet</strong><span>Schedule slots will show here once the schedule workflow is connected.</span></article>';
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
  setText('#metric-position', performanceSummary.averagePosition.toLocaleString());
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
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(script);
  });
}
async function enablePrivateLayer() {
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
    await loadScript('private-admin-config.js');
    await loadScript('private-auth.js');
  } catch (error) {
    console.warn(error.message);
  }
}

$('#lead-search').addEventListener('input', renderBoard);
$('#stage-filter').addEventListener('change', renderBoard);
copyFolderCommandButton.addEventListener('click', copyFolderCommand);
$('#mark-qualified-button').addEventListener('click', markActiveLeadQualified);
$('#mark-spam-button').addEventListener('click', markActiveLeadSpam);
document.querySelectorAll('.tab-button').forEach((button) => button.addEventListener('click', () => activateTab(button.dataset.tab)));
window.addEventListener('breeze-private-leads', (event) => {
  leads = event.detail?.leads?.length ? event.detail.leads : [...customerRecords];
  renderAll();
});
window.addEventListener('breeze-private-logout', () => {
  leads = [...customerRecords];
  renderAll();
});

renderAll();
enablePrivateLayer();
