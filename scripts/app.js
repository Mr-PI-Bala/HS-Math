const STORAGE_KEY = 'hsMath_progress_v2';
const MANIFEST = 'cfg/manifest.json';
const CORE_MASTERY_TARGET = 14;

let decks = [];
let progressData = createEmptyProgress();
let queue = [];
let queueIdx = 0;
let revealed = false;
let includeOptionalCards = false;
let sessionEnded = false;
let actionHistory = [];
let hintLevel = 0;
let swipeStartX = 0;
let swipeStartY = 0;
let swipeActive = false;
let suppressNextCardClick = false;

const $ = id => document.getElementById(id);
const deckFilter = $('deck-filter');
const statusFilter = $('filter-status');
const cardEl = $('card');
const cardContainer = $('card-container');
const actionRow = $('action-row');
const kbHint = $('keyboard-hint');
const emptyState = $('empty-state');
const doneState = $('done-state');
const statsBar = $('stats-bar');
const progressBar = $('progress-bar');
const deckList = $('deck-list');
const studyMain = $('study-main');
const optionalToggle = $('toggle-optional-cards');
const sessionEndedState = $('session-ended-state');
const currentCategoryChip = $('current-category-chip');
const hintSlots = [$('hint-slot-1'), $('hint-slot-2'), $('hint-slot-3')];
const hintProgress = $('hint-progress');
const expandOverlay = $('expand-overlay');
const expandTitle = $('expand-title');
const expandContent = $('expand-content');
const swipeHint = $('swipe-hint');

const SWIPE_HINT_DISMISS_KEY = 'hsMath_swipe_hint_dismissed_v1';
const isTouchDevice = ('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
let swipeHintDismissed = false;

const SWIPE_PROFILE_DEFAULTS = {
  ipad: { minDistance: 58, axisRatio: 1.24, tapGuardMs: 300 },
  iphone: { minDistance: 44, axisRatio: 1.16, tapGuardMs: 250 },
  'android-phone': { minDistance: 46, axisRatio: 1.18, tapGuardMs: 260 },
  'android-tablet': { minDistance: 56, axisRatio: 1.22, tapGuardMs: 290 },
  desktop: { minDistance: 64, axisRatio: 1.3, tapGuardMs: 320 },
  custom: { minDistance: 52, axisRatio: 1.2, tapGuardMs: 280 }
};

function createEmptyProgress() {
  return {
    version: 2,
    lastExported: null,
    actionsSinceExport: 0,
    autoExportEnabled: true,
    autoExportEvery: 5,
    swipeProfile: 'auto',
    swipeMinDistance: 52,
    swipeAxisRatio: 1.2,
    swipeTapGuardMs: 280,
    cards: {},
    deckStats: {}
  };
}

function normalizeProgressData(raw) {
  const base = createEmptyProgress();
  if (!raw || typeof raw !== 'object') return base;

  if (raw.cards && typeof raw.cards === 'object') {
    return {
      version: raw.version || 2,
      lastExported: raw.lastExported || null,
      actionsSinceExport: Number(raw.actionsSinceExport || 0),
      autoExportEnabled: raw.autoExportEnabled !== undefined ? !!raw.autoExportEnabled : true,
      autoExportEvery: Number(raw.autoExportEvery || 5),
      swipeProfile: typeof raw.swipeProfile === 'string' ? raw.swipeProfile : 'auto',
      swipeMinDistance: Number(raw.swipeMinDistance || 52),
      swipeAxisRatio: Number(raw.swipeAxisRatio || 1.2),
      swipeTapGuardMs: Number(raw.swipeTapGuardMs || 280),
      cards: raw.cards,
      deckStats: raw.deckStats && typeof raw.deckStats === 'object' ? raw.deckStats : {}
    };
  }

  const looksLikeLegacy = Object.values(raw).some(v => v && typeof v === 'object' && 'status' in v);
  if (looksLikeLegacy) {
    return { ...base, cards: raw };
  }

  return base;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    progressData = normalizeProgressData(raw ? JSON.parse(raw) : null);
  } catch {
    progressData = createEmptyProgress();
  }
}

function loadSwipeHintPreference() {
  try {
    swipeHintDismissed = localStorage.getItem(SWIPE_HINT_DISMISS_KEY) === '1';
  } catch {
    swipeHintDismissed = false;
  }
}

function dismissSwipeHint() {
  swipeHintDismissed = true;
  swipeHint.style.display = 'none';
  try {
    localStorage.setItem(SWIPE_HINT_DISMISS_KEY, '1');
  } catch {
    // Ignore storage errors for non-critical hint preference.
  }
}

function updateSwipeHintVisibility() {
  if (!isTouchDevice || swipeHintDismissed || queue.length === 0 || queueIdx >= queue.length || sessionEnded) {
    swipeHint.style.display = 'none';
    return;
  }

  swipeHint.style.display = queueIdx < 2 ? 'flex' : 'none';
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
  } catch {
    showToast('Could not save to local storage');
  }
}

function getAutoExportEvery() {
  const value = Number(progressData.autoExportEvery || 5);
  if (!Number.isFinite(value)) return 5;
  return Math.max(1, Math.floor(value));
}

function detectDeviceProfile() {
  const ua = (navigator.userAgent || '').toLowerCase();
  const maxTouch = Number(navigator.maxTouchPoints || 0);
  const width = Math.min(window.innerWidth || 1200, window.innerHeight || 1200);

  if (ua.includes('iphone')) return 'iphone';
  if (ua.includes('ipad')) return 'ipad';
  if (ua.includes('android')) return ua.includes('mobile') ? 'android-phone' : 'android-tablet';
  if (ua.includes('mac') && maxTouch > 1) return 'ipad';
  if (!isTouchDevice) return 'desktop';
  return width <= 820 ? 'android-phone' : 'android-tablet';
}

function getDefaultSwipeSettings(profile) {
  const resolved = profile === 'auto' ? detectDeviceProfile() : profile;
  return SWIPE_PROFILE_DEFAULTS[resolved] || SWIPE_PROFILE_DEFAULTS.custom;
}

function getSwipeConfig() {
  return {
    minDistance: Math.max(20, Math.min(180, Number(progressData.swipeMinDistance || 52))),
    axisRatio: Math.max(1, Math.min(2.5, Number(progressData.swipeAxisRatio || 1.2))),
    tapGuardMs: Math.max(80, Math.min(600, Number(progressData.swipeTapGuardMs || 280)))
  };
}

function applySwipeProfile(profile, persist = true) {
  const defaults = getDefaultSwipeSettings(profile);
  progressData.swipeProfile = profile;
  progressData.swipeMinDistance = defaults.minDistance;
  progressData.swipeAxisRatio = defaults.axisRatio;
  progressData.swipeTapGuardMs = defaults.tapGuardMs;
  if (persist) saveProgress();
  syncAdvancedControls();
}

function syncAdvancedControls() {
  const autoEveryInput = $('auto-export-every');
  const autoToggle = $('auto-export-toggle');
  const profileSelect = $('swipe-device-profile');
  const minInput = $('swipe-min-distance');
  const ratioInput = $('swipe-axis-ratio');
  const guardInput = $('swipe-tap-guard-ms');
  const note = $('swipe-detected-note');

  if (autoEveryInput) autoEveryInput.value = String(getAutoExportEvery());
  if (autoToggle) autoToggle.checked = progressData.autoExportEnabled !== false;

  const profile = progressData.swipeProfile || 'auto';
  if (profileSelect) profileSelect.value = profile;
  if (minInput) minInput.value = String(Math.round(Number(progressData.swipeMinDistance || 52)));
  if (ratioInput) ratioInput.value = String(Number(progressData.swipeAxisRatio || 1.2).toFixed(2));
  if (guardInput) guardInput.value = String(Math.round(Number(progressData.swipeTapGuardMs || 280)));

  if (note) {
    const detected = detectDeviceProfile();
    note.textContent = profile === 'auto'
      ? 'Auto mode detected: ' + detected + '. You can tweak values any time; editing a value switches to Custom.'
      : 'Profile: ' + profile + '. Use Custom (or edit fields) for manual tuning.';
  }
}

function ensureAdvancedSettings() {
  const validProfile = ['auto', 'ipad', 'iphone', 'android-phone', 'android-tablet', 'desktop', 'custom'].includes(progressData.swipeProfile);
  if (!validProfile) progressData.swipeProfile = 'auto';

  if (progressData.swipeProfile === 'auto') {
    applySwipeProfile('auto', false);
  } else {
    const cfg = getSwipeConfig();
    progressData.swipeMinDistance = cfg.minDistance;
    progressData.swipeAxisRatio = cfg.axisRatio;
    progressData.swipeTapGuardMs = cfg.tapGuardMs;
  }
}

function getStatus(cardId) {
  return progressData.cards[cardId]?.status || 'new';
}

function getDeckStat(deckId) {
  if (!progressData.deckStats[deckId]) {
    progressData.deckStats[deckId] = {
      reviewed: 0,
      skipped: 0,
      markedReview: 0,
      markedStrong: 0
    };
  }
  return progressData.deckStats[deckId];
}

function recordAction(deckId, type) {
  const stat = getDeckStat(deckId);
  if (type === 'skip') stat.skipped += 1;
  if (type === 'review') {
    stat.reviewed += 1;
    stat.markedReview += 1;
  }
  if (type === 'strong') {
    stat.reviewed += 1;
    stat.markedStrong += 1;
  }

  progressData.actionsSinceExport += 1;
  saveProgress();

  const autoEvery = getAutoExportEvery();
  if (progressData.autoExportEnabled !== false && progressData.actionsSinceExport > 0 && progressData.actionsSinceExport % autoEvery === 0) {
    exportProgress({ auto: true });
  }
}

function setStatus(cardId, status) {
  progressData.cards[cardId] = {
    status,
    lastReviewed: new Date().toISOString()
  };
  saveProgress();
}

async function loadDecks() {
  const manifest = await fetch(MANIFEST).then(r => r.json());
  decks = await Promise.all(
    manifest.decks.map(async entry => {
      const deck = await fetch(entry.file).then(r => r.json());
      return { ...entry, ...deck };
    })
  );
  populateDeckFilter();
  buildQueue();
}

function buildDeckBundlePayload() {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      app: 'HS Math Flashcards',
      manifest: MANIFEST,
      note: 'Use with scripts/enhance_cards.py for offline batch enhancement.'
    },
    decks
  };
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: filename
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function applyEnhancedBundle(data) {
  if (!data || !Array.isArray(data.decks) || data.decks.length === 0) {
    throw new Error('Invalid bundle');
  }

  const valid = data.decks.every(d => d && d.id && d.deck && Array.isArray(d.cards));
  if (!valid) {
    throw new Error('Invalid deck structure');
  }

  decks = data.decks;
  populateDeckFilter();
  buildQueue();
  renderStats();
  renderSidebar();
}

function populateDeckFilter() {
  deckFilter.innerHTML = '<option value="all">All decks</option>' +
    decks.map(d => `<option value="${d.id}">${d.deck}</option>`).join('');
}

function buildQueue() {
  sessionEnded = false;
  const deckId = deckFilter.value;
  const statusV = statusFilter.value;

  let cards = [];
  for (const d of decks) {
    if (deckId !== 'all' && d.id !== deckId) continue;
    const partition = getDeckPartitions(d);
    for (const c of partition.core) {
      cards.push({ ...c, _deck: d.deck, _deckId: d.id, _isOptional: false });
    }
    if (includeOptionalCards) {
      for (const c of partition.optional) {
        cards.push({ ...c, _deck: d.deck, _deckId: d.id, _isOptional: true });
      }
    }
  }

  if (statusV !== 'all') {
    cards = cards.filter(c => getStatus(c.id) === statusV);
  }

  queue = cards;
  queueIdx = 0;
  revealed = false;

  renderCard();
  renderStats();
  renderSidebar();
  updateCurrentCategoryLabel();
}

function renderCard() {
  if (sessionEnded) {
    cardContainer.style.display = 'none';
    actionRow.style.display = 'none';
    kbHint.style.display = 'none';
    doneState.style.display = 'none';
    emptyState.style.display = 'none';
    sessionEndedState.style.display = 'block';
    updateSwipeHintVisibility();
    return;
  }

  sessionEndedState.style.display = 'none';
  if (queue.length === 0) {
    cardContainer.style.display = 'none';
    actionRow.style.display = 'none';
    kbHint.style.display = 'none';
    doneState.style.display = 'none';
    emptyState.style.display = 'block';
    updateSwipeHintVisibility();
    return;
  }

  if (queueIdx >= queue.length) {
    cardContainer.style.display = 'none';
    actionRow.style.display = 'none';
    kbHint.style.display = 'none';
    emptyState.style.display = 'none';
    doneState.style.display = 'block';
    progressBar.style.width = '100%';
    renderDoneDecks();
    updateSwipeHintVisibility();
    return;
  }

  emptyState.style.display = 'none';
  doneState.style.display = 'none';
  cardContainer.style.display = 'block';
  actionRow.style.display = 'flex';
  kbHint.style.display = 'block';

  const card = queue[queueIdx];
  const status = getStatus(card.id);

  cardEl.classList.remove('flipped');
  revealed = false;
  hintLevel = 0;

  $('card-front').textContent = card.front;
  $('card-back-question').textContent = 'Question: ' + card.front;
  $('card-back').textContent = card.back;
  $('card-example').innerHTML = '<strong>Real-world example:</strong> ' + escapeHtml(deriveExampleFromCard(card));
  const deckLabel = card._isOptional ? '(Optional) ' + card._deck : card._deck;
  $('card-deck-lbl').textContent = deckLabel;
  $('card-deck-lbl-b').textContent = deckLabel;
  renderCardLearningAids(card);
  renderHintSlots(card);
  wireExpandableAreas(card);

  const counter = `${queueIdx + 1} / ${queue.length}`;
  $('card-counter').textContent = counter;
  $('card-counter-b').textContent = counter;

  setBadge($('card-badge'), status);
  setBadge($('card-badge-b'), status);
  updateFlipActionButtons();
  updateSwipeHintVisibility();

  progressBar.style.width = ((queueIdx / queue.length) * 100) + '%';
}

function updateFlipActionButtons() {
  $('btn-reveal').disabled = false;
  $('btn-reveal').textContent = revealed ? 'Hide answer' : 'Reveal answer';
  $('btn-strong').disabled = !revealed;
  $('btn-review').disabled = !revealed;
}

function toggleReveal() {
  if (queue.length === 0 || queueIdx >= queue.length) return;
  revealed = !revealed;
  cardEl.classList.toggle('flipped', revealed);
  updateFlipActionButtons();
}

function setBadge(el, status) {
  el.className = 'card-badge badge-' + status;
  el.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

function getDeckPartitions(deck) {
  const coreCount = Number.isInteger(deck.coreCount)
    ? Math.max(0, Math.min(deck.cards.length, deck.coreCount))
    : Math.min(deck.cards.length, CORE_MASTERY_TARGET);
  return {
    core: deck.cards.slice(0, coreCount),
    optional: deck.cards.slice(coreCount)
  };
}

function deriveStepsFromCard(card) {
  if (Array.isArray(card.steps) && card.steps.length > 0) {
    return card.steps.map(s => String(s).trim()).filter(Boolean).slice(0, 5);
  }

  const lines = String(card.back || '')
    .split('\n')
    .map(s => s.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    return lines.slice(0, 4);
  }

  return [
    'Recall the key formula or definition.',
    'Substitute known values carefully.',
    'Simplify step by step and check reasonableness.'
  ];
}

function deriveTipFromCard(card) {
  if (card.tip) return String(card.tip);
  const cue = String(card.front || '').split(':')[0].trim();
  return 'Tip: Anchor this to "' + cue + '" and say the rule out loud once.';
}

function deriveHintLadder(card) {
  if (Array.isArray(card.hints) && card.hints.length >= 3) {
    return card.hints.slice(0, 3).map(h => String(h));
  }

  const steps = deriveStepsFromCard(card);
  return [
    steps[0] || 'Start by identifying what the question is asking for.',
    steps[1] || 'Choose the matching formula or rule and substitute known values.',
    steps[2] || 'Simplify carefully and check the result against context.'
  ];
}

function deriveExampleFromCard(card) {
  if (card.example) return String(card.example);

  const deck = String(card._deck || '').toLowerCase();
  if (deck.includes('financial')) {
    return 'If a savings account compounds monthly, this concept helps estimate how your balance changes over time.';
  }
  if (deck.includes('geometry')) {
    return 'Contractors use this idea when measuring floor plans, cuts, and material quantities on job sites.';
  }
  if (deck.includes('calculus')) {
    return 'Engineers use this to model changing rates, like speed changes or growth trends over time.';
  }
  if (deck.includes('statistics')) {
    return 'Analysts apply this when interpreting survey data to make evidence-based decisions.';
  }
  return 'This principle is used when solving practical quantity problems, such as planning costs, distances, or growth.';
}

function renderHintSlots(card) {
  const hints = deriveHintLadder(card);
  hintSlots.forEach((slot, index) => {
    const level = index + 1;
    const text = hintLevel >= level ? hints[index] : (level === 1 ? 'Simple hint hidden' : level === 2 ? 'Middle hint hidden' : 'Detailed hint hidden');
    slot.classList.toggle('revealed', hintLevel >= level);
    slot.innerHTML = '<span class="hint-level">' + level + '.</span><span class="hint-text">' + escapeHtml(text) + '</span>';
    slot.dataset.fullText = text;
    slot.dataset.expandTitle = 'Hint level ' + level;
  });
  hintProgress.textContent = hintLevel + '/3';
}

function revealHint() {
  if (queue.length === 0 || queueIdx >= queue.length || sessionEnded) return;
  if (revealed) {
    showToast('Hints are shown on the question side before revealing answer.');
    return;
  }

  if (hintLevel >= 3) {
    showToast('All hints are exhausted. Reveal the answer or choose another action.');
    return;
  }

  hintLevel += 1;
  renderHintSlots(queue[queueIdx]);
  if (hintLevel === 3) {
    showToast('Hint level 3 revealed. All hints shown.');
  }
}

function onHintSlotClick(level) {
  if (queue.length === 0 || queueIdx >= queue.length || sessionEnded || revealed) return;

  // Clicking the next unrevealed hint should behave like pressing H.
  if (level === hintLevel + 1) {
    revealHint();
    return;
  }

  // Out-of-order clicks preserve current state with hidden placeholder behavior.
  if (level > hintLevel + 1) {
    showToast('Reveal hints in order: 1 -> 2 -> 3.');
    return;
  }

  // Already revealed hint: show expanded detail as read-only reference.
  const slot = hintSlots[level - 1];
  const text = slot?.dataset.fullText || '';
  if (text) openExpandPanel('Hint level ' + level, text);
}

function wireExpandableAreas(card) {
  const answerEl = $('card-back');
  const exampleEl = $('card-example');
  const stepsEl = $('card-steps');
  const tipEl = $('card-tip');

  answerEl.dataset.fullText = card.back || '';
  answerEl.dataset.expandTitle = 'Answer';

  exampleEl.dataset.fullText = deriveExampleFromCard(card);
  exampleEl.dataset.expandTitle = 'Real-world example';

  const steps = deriveStepsFromCard(card);
  stepsEl.dataset.fullText = steps.map((s, i) => (i + 1) + '. ' + s).join('\n');
  stepsEl.dataset.expandTitle = 'Steps to arrive at answer';

  tipEl.dataset.fullText = deriveTipFromCard(card);
  tipEl.dataset.expandTitle = 'Memory tip';
}

function openExpandPanel(title, text) {
  expandTitle.textContent = title;
  expandContent.textContent = text;
  expandOverlay.classList.add('open');
  expandOverlay.setAttribute('aria-hidden', 'false');
}

function closeExpandPanel() {
  expandOverlay.classList.remove('open');
  expandOverlay.setAttribute('aria-hidden', 'true');
}

function bindExpandable(target, fallbackTitle) {
  target.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const text = target.dataset.fullText || target.textContent || '';
    const title = target.dataset.expandTitle || fallbackTitle;
    if (!text.trim()) return;
    openExpandPanel(title, text);
  });
}

function renderCardLearningAids(card) {
  const steps = deriveStepsFromCard(card);
  $('card-steps').innerHTML = steps.map(s => '<li>' + escapeHtml(s) + '</li>').join('');
  const optionalPrefix = card._isOptional ? '<span class="optional-note">(Optional)</span>' : '';
  $('card-tip').innerHTML = optionalPrefix + '<strong>' + escapeHtml(deriveTipFromCard(card)) + '</strong>';
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getDeckStatusCounts(deck) {
  const counts = { total: 0, core: 0, optional: 0, new: 0, review: 0, strong: 0 };
  const partition = getDeckPartitions(deck);
  counts.core = partition.core.length;
  counts.optional = partition.optional.length;
  counts.total = counts.core + counts.optional;

  for (const c of deck.cards) {
    counts[getStatus(c.id)] += 1;
  }
  return counts;
}

function renderSidebar() {
  const activeDeck = deckFilter.value;

  let html = '';
  const allPartition = decks.reduce((acc, d) => {
    const p = getDeckPartitions(d);
    acc.core += p.core.length;
    acc.optional += p.optional.length;
    return acc;
  }, { core: 0, optional: 0 });
  const allTotal = allPartition.core + allPartition.optional;
  const allStats = decks.reduce((sum, d) => {
    const ds = getDeckStat(d.id);
    sum.reviewed += ds.reviewed;
    sum.skipped += ds.skipped;
    sum.markedReview += ds.markedReview;
    sum.markedStrong += ds.markedStrong;
    return sum;
  }, { reviewed: 0, skipped: 0, markedReview: 0, markedStrong: 0 });

  html += deckItemTemplate({
    id: 'all',
    name: 'All Decks',
    total: allTotal,
    core: allPartition.core,
    optional: allPartition.optional,
    status: {
      new: decks.flatMap(d => d.cards).filter(c => getStatus(c.id) === 'new').length,
      review: decks.flatMap(d => d.cards).filter(c => getStatus(c.id) === 'review').length,
      strong: decks.flatMap(d => d.cards).filter(c => getStatus(c.id) === 'strong').length
    },
    activity: allStats,
    active: activeDeck === 'all',
    open: activeDeck === 'all'
  });

  for (const deck of decks) {
    const status = getDeckStatusCounts(deck);
    const activity = getDeckStat(deck.id);
    html += deckItemTemplate({
      id: deck.id,
      name: deck.deck,
      total: status.total,
      core: status.core,
      optional: status.optional,
      status,
      activity,
      active: activeDeck === deck.id,
      open: activeDeck === deck.id
    });
  }

  deckList.innerHTML = html;

  deckList.querySelectorAll('.deck-head').forEach(btn => {
    btn.addEventListener('click', () => {
      deckFilter.value = btn.dataset.deckId;
      buildQueue();
    });
  });
}

function deckItemTemplate({ id, name, total, status, activity, active, open }) {
  return `
    <section class="deck-item ${active ? 'active' : ''} ${open ? '' : 'collapsed'}" data-deck-id="${id}">
      <button class="deck-head" data-deck-id="${id}" type="button">
      <div class="deck-top">
        <span class="deck-name">${name}</span>
        <span class="deck-total">${total} cards <span class="deck-toggle">▼</span></span>
      </div>
      </button>
      <div class="deck-body">
      <div class="deck-metrics">
        <span>Core: <strong>${status.core ?? total}</strong></span>
        <span>Optional: <strong>${status.optional ?? 0}</strong></span>
        <span>New: <strong>${status.new}</strong></span>
        <span>Review: <strong>${status.review}</strong></span>
        <span>Strong: <strong>${status.strong}</strong></span>
        <span>Reviewed: <strong>${activity.reviewed || 0}</strong></span>
        <span>Skipped: <strong>${activity.skipped || 0}</strong></span>
        <span>Review marks: <strong>${activity.markedReview || 0}</strong></span>
      </div>
      </div>
    </section>
  `;
}

function renderStats() {
  const allCards = decks.flatMap(d => d.cards);
  const totals = decks.reduce((acc, deck) => {
    const part = getDeckPartitions(deck);
    acc.core += part.core.length;
    acc.optional += part.optional.length;
    return acc;
  }, { core: 0, optional: 0 });
  const strong = allCards.filter(c => getStatus(c.id) === 'strong').length;
  const review = allCards.filter(c => getStatus(c.id) === 'review').length;
  const newC = allCards.filter(c => getStatus(c.id) === 'new').length;
  const total = allCards.length;
  const reviewed = Object.values(progressData.deckStats).reduce((acc, d) => acc + (d.reviewed || 0), 0);
  const skipped = Object.values(progressData.deckStats).reduce((acc, d) => acc + (d.skipped || 0), 0);

  statsBar.innerHTML = `
    Total: <span>${total} (${totals.core}, ${totals.optional})</span>
    | Reviewed actions: <span>${reviewed}</span>
    | Skipped actions: <span>${skipped}</span>
    | <span class="stat-strong">Strong: ${strong}</span>
    | <span class="stat-review">Review: ${review}</span>
    | <span class="stat-new">New: ${newC}</span>
  `;
}

function updateCurrentCategoryLabel() {
  const id = deckFilter.value;
  const label = id === 'all' ? 'All decks' : (decks.find(d => d.id === id)?.deck || 'All decks');
  currentCategoryChip.textContent = label;
}

function nextCard() {
  if (queueIdx >= queue.length) return;
  pendingSkip = false;
  queueIdx += 1;
  revealed = false;
  renderCard();
  renderStats();
  renderSidebar();
}

function previousCard() {
  if (queue.length === 0) return;
  queueIdx = Math.max(0, queueIdx - 1);
  revealed = false;
  renderCard();
  renderStats();
}

function changeCategoryBy(step) {
  const options = Array.from(deckFilter.options);
  const currentIndex = Math.max(0, options.findIndex(o => o.value === deckFilter.value));
  const nextIndex = (currentIndex + step + options.length) % options.length;
  deckFilter.value = options[nextIndex].value;
  buildQueue();
}

function focusCategoryPicker() {
  deckFilter.focus();
  deckFilter.click();
  showToast('Category selector focused. Use arrows and Enter to choose.');
}

function shouldIgnoreSwipeTarget(target) {
  return !!target.closest('button, input, select, textarea, a, .rail-group, .deck-head, .hint-slot');
}

function handleSwipeAction(direction) {
  if (direction === 'left') {
    if (queueIdx === 0) {
      showToast('Already at first card');
      return;
    }
    previousCard();
    return;
  }

  if (direction === 'right') {
    skipCard();
    return;
  }

  if (direction === 'up') {
    if (!revealed) toggleReveal();
    markCard('strong');
    return;
  }

  if (direction === 'down') {
    if (!revealed) toggleReveal();
    markCard('review');
  }
}

function onSwipeStart(clientX, clientY, target) {
  if (shouldIgnoreSwipeTarget(target)) return;
  swipeStartX = clientX;
  swipeStartY = clientY;
  swipeActive = true;
}

function onSwipeEnd(clientX, clientY) {
  if (!swipeActive) return;
  swipeActive = false;

  const dx = clientX - swipeStartX;
  const dy = clientY - swipeStartY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  const cfg = getSwipeConfig();
  const minDistance = cfg.minDistance;
  const axisRatio = cfg.axisRatio;

  if (absX < minDistance && absY < minDistance) return;

  if (absX >= absY * axisRatio) {
    suppressNextCardClick = true;
    setTimeout(() => { suppressNextCardClick = false; }, cfg.tapGuardMs);
    handleSwipeAction(dx > 0 ? 'right' : 'left');
    return;
  }

  if (absY >= absX * axisRatio) {
    suppressNextCardClick = true;
    setTimeout(() => { suppressNextCardClick = false; }, cfg.tapGuardMs);
    handleSwipeAction(dy > 0 ? 'down' : 'up');
  }
}

function markCard(status) {
  if (!revealed) {
    toggleReveal();
    return;
  }

  const card = queue[queueIdx];
  const prevStatus = getStatus(card.id);
  actionHistory.push({ kind: 'mark', cardId: card.id, deckId: card._deckId, prevStatus, newStatus: status, cardQueueIndex: queueIdx });
  setStatus(card.id, status);
  recordAction(card._deckId, status);
  advance();
}

function advance() {
  const current = queue[queueIdx];
  if (current) {
    recordIfSkipRequested(current);
  }
  queueIdx += 1;
  revealed = false;
  renderCard();
  renderStats();
  renderSidebar();
}

let pendingSkip = false;
function skipCard() {
  if (queueIdx >= queue.length) return;
  const card = queue[queueIdx];
  actionHistory.push({ kind: 'skip', deckId: card._deckId, cardQueueIndex: queueIdx });
  pendingSkip = true;
  advance();
}

function recordIfSkipRequested(card) {
  if (!pendingSkip) return;
  pendingSkip = false;
  recordAction(card._deckId, 'skip');
}

function undoLastAction() {
  const last = actionHistory.pop();
  if (!last) {
    showToast('No action to undo');
    return;
  }

  if (last.kind === 'mark') {
    if (last.prevStatus === 'new') {
      delete progressData.cards[last.cardId];
    } else {
      progressData.cards[last.cardId] = {
        status: last.prevStatus,
        lastReviewed: new Date().toISOString()
      };
    }

    const stat = getDeckStat(last.deckId);
    stat.reviewed = Math.max(0, (stat.reviewed || 0) - 1);
    if (last.newStatus === 'review') stat.markedReview = Math.max(0, (stat.markedReview || 0) - 1);
    if (last.newStatus === 'strong') stat.markedStrong = Math.max(0, (stat.markedStrong || 0) - 1);
  }

  if (last.kind === 'skip') {
    const stat = getDeckStat(last.deckId);
    stat.skipped = Math.max(0, (stat.skipped || 0) - 1);
  }

  progressData.actionsSinceExport = Math.max(0, (progressData.actionsSinceExport || 0) - 1);
  saveProgress();

  const focusCardId = last.cardId || null;
  buildQueue();
  if (focusCardId) {
    const idx = queue.findIndex(c => c.id === focusCardId);
    if (idx >= 0) queueIdx = idx;
  } else {
    queueIdx = Math.min(last.cardQueueIndex ?? 0, Math.max(0, queue.length - 1));
  }
  revealed = false;
  renderCard();
  renderStats();
  renderSidebar();
  showToast('Undid last action');
}

cardEl.addEventListener('click', () => {
  if (suppressNextCardClick) {
    suppressNextCardClick = false;
    return;
  }
  toggleReveal();
});
cardEl.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    toggleReveal();
  }
});

studyMain.addEventListener('touchstart', e => {
  if (!e.touches || e.touches.length === 0) return;
  const t = e.touches[0];
  onSwipeStart(t.clientX, t.clientY, e.target);
}, { passive: true });

studyMain.addEventListener('touchend', e => {
  if (!e.changedTouches || e.changedTouches.length === 0) return;
  const t = e.changedTouches[0];
  onSwipeEnd(t.clientX, t.clientY);
}, { passive: true });

studyMain.addEventListener('touchcancel', () => {
  swipeActive = false;
}, { passive: true });

$('btn-reveal').addEventListener('click', toggleReveal);
$('btn-strong').addEventListener('click', () => markCard('strong'));
$('btn-review').addEventListener('click', () => markCard('review'));
$('btn-skip').addEventListener('click', skipCard);
$('btn-hint').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  revealHint();
});
$('btn-restart').addEventListener('click', buildQueue);
$('btn-dismiss-swipe-hint').addEventListener('click', dismissSwipeHint);

$('btn-prev-deck').addEventListener('click', () => navigateDeck(-1));
$('btn-next-deck').addEventListener('click', () => navigateDeck(1));

function getDeckOptions() {
  return [{ id: 'all', name: 'All Decks' }, ...decks.map(d => ({ id: d.id, name: d.deck }))];
}

function navigateDeck(step) {
  const options = getDeckOptions();
  const currentIndex = options.findIndex(o => o.id === deckFilter.value);
  const nextIndex = Math.max(0, Math.min(options.length - 1, currentIndex + step));
  deckFilter.value = options[nextIndex].id;
  buildQueue();
}

function renderDoneDecks() {
  const options = getDeckOptions();
  const currentId = deckFilter.value;
  const currentIndex = options.findIndex(o => o.id === currentId);

  $('done-deck-label').textContent = options[currentIndex]?.name || '';
  $('btn-prev-deck').disabled = currentIndex <= 0;
  $('btn-next-deck').disabled = currentIndex >= options.length - 1;

  $('done-deck-jump').innerHTML = options.map(o =>
    `<button class="btn-deck-jump ${o.id === currentId ? 'active' : ''}" data-deck-id="${o.id}">${o.name}</button>`
  ).join('');

  $('done-deck-jump').querySelectorAll('.btn-deck-jump').forEach(btn => {
    btn.addEventListener('click', () => {
      deckFilter.value = btn.dataset.deckId;
      buildQueue();
    });
  });
}

// Collapsible rail sections
document.querySelectorAll('.rail-group .rail-head').forEach(h3 => {
  h3.addEventListener('click', () => {
    h3.closest('.rail-group').classList.toggle('collapsed');
  });
});
$('btn-export-done').addEventListener('click', exportProgress);

hintSlots.forEach((slot, index) => {
  slot.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    onHintSlotClick(index + 1);
  });
});
bindExpandable($('card-back'), 'Answer');
bindExpandable($('card-example'), 'Real-world example');
bindExpandable($('card-steps'), 'Steps to arrive at answer');
bindExpandable($('card-tip'), 'Memory tip');

$('expand-close').addEventListener('click', closeExpandPanel);
expandOverlay.addEventListener('click', e => {
  if (e.target === expandOverlay) closeExpandPanel();
});

deckFilter.addEventListener('change', buildQueue);
statusFilter.addEventListener('change', buildQueue);

document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  const isTypingField = tag === 'TEXTAREA' || e.target.isContentEditable || (tag === 'INPUT' && e.target.type !== 'file');
  if (isTypingField) return;

  if (expandOverlay.classList.contains('open') && e.key === 'Escape') {
    e.preventDefault();
    closeExpandPanel();
    return;
  }

  if (e.key === 'h' || e.key === 'H') {
    e.preventDefault();
    revealHint();
    return;
  }

  if (e.shiftKey && e.key === 'ArrowDown') {
    e.preventDefault();
    changeCategoryBy(1);
    return;
  }

  if (e.shiftKey && e.key === 'ArrowUp') {
    e.preventDefault();
    focusCategoryPicker();
    return;
  }

  if (e.key === ' ') {
    e.preventDefault();
    if (revealed) {
      nextCard();
    } else {
      toggleReveal();
    }
    return;
  }

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (queueIdx === 0) { showToast('Already at first card'); return; }
    previousCard();
    return;
  }

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    skipCard();
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (!revealed) toggleReveal();
    markCard('strong');
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (!revealed) toggleReveal();
    markCard('review');
    return;
  }

  if (e.key === 'Escape') {
    e.preventDefault();
    if (revealed) toggleReveal();
    return;
  }

  if (e.key === 'Backspace') {
    e.preventDefault();
    undoLastAction();
  }
});

$('btn-export').addEventListener('click', exportProgress);

$('btn-export-enhancement-bundle').addEventListener('click', () => {
  downloadJson('deck-enhancement-bundle.json', buildDeckBundlePayload());
  showToast('Deck bundle exported. Run offline enhancement scripts, then import enhanced bundle.');
});

$('btn-export-current-decks').addEventListener('click', () => {
  downloadJson('decks-current-snapshot.json', { generatedAt: new Date().toISOString(), decks });
  showToast('Current deck snapshot exported.');
});

$('btn-import-enhanced-bundle').addEventListener('click', () => $('import-enhanced-bundle-input').click());

$('auto-export-toggle').addEventListener('change', e => {
  progressData.autoExportEnabled = !!e.target.checked;
  saveProgress();
  showToast(progressData.autoExportEnabled ? 'Auto-export enabled.' : 'Auto-export disabled.');
});

$('auto-export-every').addEventListener('change', e => {
  const nextValue = Math.max(1, Math.floor(Number(e.target.value || 5)));
  progressData.autoExportEvery = nextValue;
  e.target.value = String(nextValue);
  saveProgress();
  showToast('Auto-export interval set to every ' + nextValue + ' completed cards.');
});

$('swipe-device-profile').addEventListener('change', e => {
  const profile = e.target.value;
  if (profile === 'custom') {
    progressData.swipeProfile = 'custom';
    saveProgress();
    syncAdvancedControls();
    showToast('Swipe profile set to Custom.');
    return;
  }
  applySwipeProfile(profile, true);
  showToast('Swipe profile set to ' + profile + '.');
});

function onSwipeNumericSettingChange(inputId, key, parseFn, formatFn) {
  $(inputId).addEventListener('change', e => {
    progressData[key] = parseFn(e.target.value);
    progressData.swipeProfile = 'custom';
    progressData[key] = getSwipeConfig()[key === 'swipeTapGuardMs' ? 'tapGuardMs' : key === 'swipeAxisRatio' ? 'axisRatio' : 'minDistance'];
    e.target.value = formatFn(progressData[key]);
    saveProgress();
    syncAdvancedControls();
    showToast('Swipe tuning updated (Custom profile).');
  });
}

onSwipeNumericSettingChange('swipe-min-distance', 'swipeMinDistance', v => Number(v || 52), v => String(Math.round(v)));
onSwipeNumericSettingChange('swipe-axis-ratio', 'swipeAxisRatio', v => Number(v || 1.2), v => String(Number(v).toFixed(2)));
onSwipeNumericSettingChange('swipe-tap-guard-ms', 'swipeTapGuardMs', v => Number(v || 280), v => String(Math.round(v)));

function buildExportPayload() {
  return {
    version: 2,
    lastExported: progressData.lastExported,
    actionsSinceExport: progressData.actionsSinceExport,
    autoExportEnabled: progressData.autoExportEnabled !== false,
    autoExportEvery: getAutoExportEvery(),
    swipeProfile: progressData.swipeProfile || 'auto',
    swipeMinDistance: getSwipeConfig().minDistance,
    swipeAxisRatio: getSwipeConfig().axisRatio,
    swipeTapGuardMs: getSwipeConfig().tapGuardMs,
    cards: progressData.cards,
    deckStats: progressData.deckStats
  };
}

function exportProgress(options = {}) {
  progressData.lastExported = new Date().toISOString();
  progressData.actionsSinceExport = 0;
  saveProgress();

  const payload = buildExportPayload();

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: options.auto ? 'progress-auto.json' : 'progress.json'
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast(options.auto
    ? 'Auto-export created after ' + getAutoExportEvery() + ' actions. Save it as cfg/progress.json if needed.'
    : 'Progress exported. Replace cfg/progress.json and commit to persist in repo.');

  renderStats();
  renderSidebar();
}

$('btn-copy-export-json').addEventListener('click', async () => {
  progressData.lastExported = new Date().toISOString();
  progressData.actionsSinceExport = 0;
  saveProgress();

  const payloadText = JSON.stringify(buildExportPayload(), null, 2);

  try {
    await navigator.clipboard.writeText(payloadText);
    showToast('Export JSON copied. Paste into cfg/progress.json and save.');
  } catch {
    // Fallback for browsers that block async clipboard API.
    const ta = document.createElement('textarea');
    ta.value = payloadText;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    ta.remove();

    showToast(copied
      ? 'Export JSON copied. Paste into cfg/progress.json and save.'
      : 'Clipboard copy blocked. Use Export to download progress.json instead.');
  }

  renderStats();
  renderSidebar();
});

$('btn-import').addEventListener('click', () => $('import-input').click());

$('import-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      progressData = normalizeProgressData(data);
      saveProgress();
      ensureAdvancedSettings();
      syncAdvancedControls();
      buildQueue();
      renderStats();
      renderSidebar();
      showToast('Progress imported and restored.');
    } catch {
      showToast('Could not parse progress file');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

$('import-enhanced-bundle-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      applyEnhancedBundle(data);
      showToast('Enhanced deck bundle imported into current session.');
    } catch {
      showToast('Could not parse enhanced bundle JSON');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

$('btn-reset').addEventListener('click', () => {
  if (!confirm('Reset ALL progress? This cannot be undone.')) return;
  progressData = createEmptyProgress();
  saveProgress();
  buildQueue();
  renderStats();
  renderSidebar();
  showToast('Progress reset');
});

$('btn-end-session').addEventListener('click', () => {
  sessionEnded = true;
  renderCard();
  showToast('Session ended. Progress remains saved.');
});

$('btn-resume-session').addEventListener('click', () => {
  sessionEnded = false;
  renderCard();
  showToast('Session resumed');
});

optionalToggle.addEventListener('change', () => {
  includeOptionalCards = optionalToggle.checked;
  buildQueue();
});

let toastTimer;
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

loadProgress();
loadSwipeHintPreference();
ensureAdvancedSettings();
syncAdvancedControls();
loadDecks().catch(err => {
  statsBar.innerHTML = 'Could not load decks. Serve this app over HTTP (not file://).';
  console.error(err);
});
