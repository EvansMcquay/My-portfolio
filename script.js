// ========== Base UX niceties ==========
document.getElementById('year').textContent = new
Date().getFullYear();
// ========== GA4 utilities ==========
const DEBUG_GA = true; // set to false before going live
function sendEvent(eventName, params = {}) {
const payload = DEBUG_GA ? { ...params, debug_mode: true } : params;
if (typeof gtag === 'function') {
gtag('event', eventName, payload);
} else {
console.log('[GA4 pending]', eventName, payload);
}
}
// ========== Wire up after DOM is ready ==========
document.addEventListener('DOMContentLoaded', () => {
// --- Automation preview ---
const organizeButton = document.getElementById('organize-files');
const resetButton = document.getElementById('reset-files');
const organizedFiles = document.querySelector('.organized-files');
const fileGroups = {
documents: document.getElementById('documents-files'),
images: document.getElementById('images-files'),
scripts: document.getElementById('scripts-files')
};
const fileTypes = {
'.txt': 'documents',
'.pdf': 'documents',
'.jpg': 'images',
'.py': 'scripts'
};
const originalFiles = ['notes.txt', 'photo.jpg', 'backup.py', 'report.pdf', 'cleanup.py'];

function createFileItem(fileName) {
const item = document.createElement('li');
const extension = fileName.slice(fileName.lastIndexOf('.') + 1).toUpperCase();
item.innerHTML = `<span aria-hidden="true">${extension}</span>${fileName}`;
return item;
}

function resetAutomationDemo() {
Object.values(fileGroups).forEach((group) => {
group.replaceChildren();
});
organizedFiles.hidden = true;
organizeButton.disabled = false;
}

organizeButton?.addEventListener('click', () => {
originalFiles.forEach((fileName) => {
const groupName = fileTypes[fileName.slice(fileName.lastIndexOf('.'))];
fileGroups[groupName].append(createFileItem(fileName));
});
organizedFiles.hidden = false;
organizeButton.disabled = true;
});
resetButton?.addEventListener('click', resetAutomationDemo);

// --- Contact Me (mailto) lead tracking ---
// index.html has: <a id="cta-btn" href="mailto:...">Contact Me</a>
const ctaLink = document.getElementById('cta-btn');
if (ctaLink) {
ctaLink.addEventListener('click', () => {
// GA4 recommended event for lead/contact
sendEvent('generate_lead', {
method: 'email',
link_text: 'Contact Me',
location: 'header'
});
// Optional custom event for finer analysis
sendEvent('contact_email_click', {
link_url: ctaLink.href,
location: 'header'
});
// No alert here—let the mail client open smoothly
}, { passive: true });
}
// --- Project links: open in new tab + track ---
// Example HTML:
// <a href="https://example.com/project-one"
// class="view-project" data-project="Project One">View</a>
const projectLinks = document.querySelectorAll('.view-project');
projectLinks.forEach((a) => {
a.addEventListener('click', (e) => {
e.preventDefault();
const url = a.getAttribute('href') || '';
const name = a.dataset.project || 'Unknown Project';
// Send analytics first
sendEvent('project_view', {
project_name: name,
ui_section: 'projects_list'
});
// Open the project in a new tab/window
// Note: This runs inside the user-initiated click handler.
const win = window.open(url, '_blank');
// Security hardening: prevent the new tab from accessing window.opener
if (win) win.opener = null;
});
});
// --- (Optional) Global outbound link tracking pattern ---
// Uncomment to track any external link click site-wide
/*
document.body.addEventListener('click', (e) => {
const link = e.target.closest('a[href]');
if (!link) return;
const url = link.getAttribute('href');
const isExternal = /^https?:\/\//i.test(url) &&
!url.includes(location.hostname);
if (isExternal) {
sendEvent('click_outbound', {
link_url: url,
link_text: (link.textContent || '').trim().slice(0, 80)
});
}
}, { passive: true });
*/
});
