// Leonida Trophy Checklist — the tracker for all 55 official GTA VI trophies.
//
// Trophy data (official names, descriptions, grades, guides, tips, hidden and
// missable flags, sources) comes from data/trophies.json. Progress lives in
// localStorage and can be exported to a file and imported back. The app makes no
// network requests. The address bar can preset the view, so screenshots and deep
// links can set it: ?grade=silver&kind=robbery&stage=2&q=bank&spoiler=off
const SAVE_KEY = 'gta6-trophy-checklist';
const SPOILER_KEY = 'gta6-trophy-spoiler';
const EXPORT_NAME = 'gta6-trophy-progress.json';

const queryParams = new URLSearchParams(window.location.search);
const grab = (id) => document.getElementById(id);
const grid = grab('cards');
const queryField = grab('query');
const gradeSelect = grab('gradeFilter');
const kindSelect = grab('kindFilter');
const stageSelect = grab('stageFilter');
const statusSelect = grab('statusFilter');
const spoilerToggle = grab('spoilerToggle');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function loadChecklist() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SAVE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

let done = loadChecklist();
let hideSpoilers = queryParams.get('spoiler') === 'off'
  ? false
  : queryParams.get('spoiler') === 'on'
    ? true
    : localStorage.getItem(SPOILER_KEY) !== 'off';
spoilerToggle.checked = hideSpoilers;

function storeProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify([...done]));
  localStorage.setItem(SPOILER_KEY, hideSpoilers ? 'on' : 'off');
}

let allTrophies = [];

function trophyVisible(trophy) {
  if (gradeSelect.value !== 'all' && trophy.grade !== gradeSelect.value) return false;
  if (kindSelect.value === 'missable') {
    if (!trophy.missable) return false;
  } else if (kindSelect.value !== 'all' && trophy.kind !== kindSelect.value) {
    return false;
  }
  if (stageSelect.value !== 'all' && String(trophy.phase) !== stageSelect.value) return false;
  if (statusSelect.value === 'earned' && !done.has(trophy.name)) return false;
  if (statusSelect.value === 'remaining' && done.has(trophy.name)) return false;
  const needle = queryField.value.trim().toLowerCase();
  if (!needle) return true;
  const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.tip} ${trophy.kind}`.toLowerCase();
  return hay.includes(needle);
}

function renderCard(trophy) {
  const earned = done.has(trophy.name);
  const concealed = hideSpoilers && trophy.hidden && !earned;
  const shownName = concealed ? 'Hidden Trophy' : trophy.name;
  const shownDesc = concealed ? 'Story trophy — hidden until you earn it.' : `“${trophy.description}”`;
  const shownGuide = concealed ? 'Hidden — tick it off once it pops to reveal the guide.' : trophy.guide;
  const shownTip = concealed ? '' : trophy.tip;
  const tags = [
    trophy.hidden ? '<span class="tag tag-hidden">Hidden</span>' : '',
    trophy.missable ? '<span class="tag tag-missable">Missable</span>' : '',
    `<span class="tag">${escapeHtml(trophy.kind.replace('-', ' '))}</span>`,
    `<span class="tag">Step ${trophy.phase}</span>`,
  ].join('');
  return `<article class="trophy-card tier-${trophy.grade}${earned ? ' is-earned' : ''}">` +
    `<div class="trophy-row">` +
    `<input type="checkbox" data-trophy="${escapeHtml(trophy.name)}" ${earned ? 'checked' : ''} aria-label="Mark ${escapeHtml(shownName)} as earned">` +
    `<div>` +
    `<span class="tier-pill ${trophy.grade}">${trophy.grade}</span>` +
    `<h3 class="trophy-title">${escapeHtml(shownName)}</h3>` +
    `<p class="trophy-official">${escapeHtml(shownDesc)}</p>` +
    `<p class="trophy-guide">${escapeHtml(shownGuide)}</p>` +
    (shownTip ? `<p class="trophy-guide"><strong>Tip:</strong> ${escapeHtml(shownTip)}</p>` : '') +
    `<div class="tag-row">${tags}</div>` +
    `<p class="trophy-sources">Sources: ${escapeHtml(trophy.sources.join(' · '))}</p>` +
    `</div></div></article>`;
}

function redraw() {
  const visible = allTrophies.filter(trophyVisible);
  grid.innerHTML = visible.length
    ? visible.map(renderCard).join('')
    : '<p class="no-match">No trophies match these filters.</p>';

  grab('earnedCount').textContent = `${done.size} of ${allTrophies.length} earned`;
  grab('earnedPct').textContent = `${Math.round((done.size / allTrophies.length) * 100)}%`;
  grab('earnedFill').style.width = `${(done.size / allTrophies.length) * 100}%`;
  const earnedByTier = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totalByTier = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of allTrophies) {
    totalByTier[trophy.grade]++;
    if (done.has(trophy.name)) earnedByTier[trophy.grade]++;
  }
  grab('gradeBreakdown').textContent =
    `Platinum ${earnedByTier.platinum}/${totalByTier.platinum} · Gold ${earnedByTier.gold}/${totalByTier.gold} · ` +
    `Silver ${earnedByTier.silver}/${totalByTier.silver} · Bronze ${earnedByTier.bronze}/${totalByTier.bronze}`;
  for (const tally of document.querySelectorAll('.step-tally')) {
    const step = Number(tally.dataset.stage);
    const inStep = allTrophies.filter((trophy) => trophy.phase === step);
    const finished = inStep.filter((trophy) => done.has(trophy.name)).length;
    tally.textContent = `${finished} of ${inStep.length} trophies in this step earned.`;
  }
  grab('resultCount').textContent =
    `Showing ${visible.length} of ${allTrophies.length} trophies` +
    (hideSpoilers ? ' · story trophies hidden until earned' : ' · spoilers shown');
}

// A single delegated listener covers every card checkbox, since redraw() rebuilds them.
grid.addEventListener('change', (event) => {
  const box = event.target;
  if (!box.matches('input[type="checkbox"]')) return;
  if (box.checked) done.add(box.dataset.trophy);
  else done.delete(box.dataset.trophy);
  storeProgress();
  redraw();
});

for (const control of [queryField, gradeSelect, kindSelect, stageSelect, statusSelect]) {
  control.addEventListener(control === queryField ? 'input' : 'change', redraw);
}
spoilerToggle.addEventListener('change', () => {
  hideSpoilers = spoilerToggle.checked;
  storeProgress();
  redraw();
});

grab('exportBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify([...done].sort(), null, 2)], { type: 'application/json' }));
  link.download = EXPORT_NAME;
  link.click();
});
grab('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  let names;
  try {
    names = JSON.parse(await file.text());
  } catch {
    alert('That file is not a valid progress export.');
    return;
  }
  if (!Array.isArray(names)) {
    alert('That file is not a valid progress export.');
    return;
  }
  done = new Set(names.filter((name) => allTrophies.some((trophy) => trophy.name === name)));
  storeProgress();
  redraw();
});
grab('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    done = new Set();
    storeProgress();
    redraw();
  }
});

async function start() {
  // Filter values come from the URL when the link sets them (screenshots and
  // deep links use this), and the search text too.
  for (const [control, key] of [[gradeSelect, 'grade'], [kindSelect, 'kind'], [stageSelect, 'stage'], [statusSelect, 'status']]) {
    const wanted = queryParams.get(key);
    if (wanted && [...control.options].some((option) => option.value === wanted)) control.value = wanted;
  }
  if (queryParams.get('q')) queryField.value = queryParams.get('q');

  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  allTrophies = doc.trophies;
  redraw();
}

start();
