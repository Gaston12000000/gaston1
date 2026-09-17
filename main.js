/* ==========================================================================
   YOUTUBE BUSINESS 360° — main.js
   Coeur de l'application : état/XP (AppStorage), notifications (AppToast),
   navigation mobile, accordéon FAQ, filtres génériques, boutons copier.
   Chargé sur TOUTES les pages, avant animations.js et les scripts de page.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. APPTOAST — Notifications toast réutilisables sur toutes les pages
   -------------------------------------------------------------------------- */
const AppToast = (() => {
  function getContainer() {
    return document.getElementById('toast-container');
  }

  function show(message, type = 'info') {
    const container = getContainer();
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type === 'xp' ? 'xp' : type}`;

    const icons = { success: '✓', error: '✕', xp: '⚡', info: 'ℹ' };
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Force reflow then reveal (matches .toast.show transition in style.css)
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

  return { show };
})();

/* --------------------------------------------------------------------------
   2. APPSTORAGE — État persistant (localStorage) : XP, niveau, progression
   -------------------------------------------------------------------------- */
const AppStorage = (() => {
  const STORAGE_KEY = 'ybt360_state_v1';

  const LEVELS = [
    { min: 0, name: '🌱 Débutant' },
    { min: 200, name: '🚀 Créateur' },
    { min: 500, name: '⚡ Stratège' },
    { min: 1000, name: '🏆 Expert' },
    { min: 2000, name: '👑 Maître 360°' },
  ];

  const DEFAULT_STATE = {
    xp: 150,
    completedLessons: [],
    exercises: {},
    checklist: {},
    copiedPrompts: [],
    totalLessons: 24,
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATE };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    } catch (e) {
      return { ...DEFAULT_STATE };
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* localStorage indisponible (navigation privée, etc.) : on continue sans persister */
    }
  }

  function getLevel(xp) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
      if (xp >= lvl.min) current = lvl;
    }
    return current;
  }

  function getState() {
    return load();
  }

  function addXP(amount, reason) {
    const state = load();
    state.xp = Math.max(0, state.xp + amount);
    save(state);
    syncNavbar();
    if (amount > 0) {
      AppToast.show(`+${amount} XP — ${reason || 'Progression enregistrée'}`, 'xp');
    }
    return state;
  }

  function isLessonComplete(lessonId) {
    return load().completedLessons.includes(lessonId);
  }

  function setLessonComplete(lessonId, complete) {
    const state = load();
    const idx = state.completedLessons.indexOf(lessonId);
    if (complete && idx === -1) {
      state.completedLessons.push(lessonId);
    } else if (!complete && idx !== -1) {
      state.completedLessons.splice(idx, 1);
    }
    save(state);
    return state;
  }

  function saveExercise(exerciseId, data) {
    const state = load();
    state.exercises[exerciseId] = data;
    save(state);
    return state;
  }

  function getExercise(exerciseId) {
    return load().exercises[exerciseId] || null;
  }

  function getChecklist() {
    return load().checklist;
  }

  function setChecklistItem(itemId, checked) {
    const state = load();
    state.checklist[itemId] = checked;
    save(state);
    return state;
  }

  function resetChecklist() {
    const state = load();
    state.checklist = {};
    save(state);
    return state;
  }

  function hasCopiedPrompt(promptId) {
    return load().copiedPrompts.includes(promptId);
  }

  function markPromptCopied(promptId) {
    const state = load();
    if (!state.copiedPrompts.includes(promptId)) {
      state.copiedPrompts.push(promptId);
      save(state);
    }
    return state;
  }

  /* Met à jour tous les éléments de navigation affichant le niveau/XP,
     quel que soit le gabarit de page utilisé. */
  function syncNavbar() {
    const state = load();
    const level = getLevel(state.xp);

    document.querySelectorAll('#nav-level-name').forEach(el => {
      el.textContent = level.name;
    });
    document.querySelectorAll('#nav-xp-val').forEach(el => {
      el.textContent = `${state.xp} XP`;
    });
    document.querySelectorAll('#profile-level-str').forEach(el => {
      el.textContent = `${level.name} (${state.xp} XP)`;
    });
    document.querySelectorAll('#dash-kpi-level').forEach(el => {
      el.textContent = level.name;
    });

    const progressEl = document.getElementById('dash-kpi-progress');
    if (progressEl) {
      const pct = Math.round((state.completedLessons.length / state.totalLessons) * 100);
      progressEl.textContent = `${pct}%`;
    }
    const modulesEl = document.getElementById('dash-kpi-modules');
    if (modulesEl) {
      modulesEl.textContent = `${state.completedLessons.length} / ${state.totalLessons}`;
    }
    const promptsEl = document.getElementById('dash-kpi-prompts');
    if (promptsEl) {
      promptsEl.textContent = `${state.copiedPrompts.length}`;
    }
  }

  return {
    getState,
    addXP,
    getLevel,
    isLessonComplete,
    setLessonComplete,
    saveExercise,
    getExercise,
    getChecklist,
    setChecklistItem,
    resetChecklist,
    hasCopiedPrompt,
    markPromptCopied,
    syncNavbar,
  };
})();

/* --------------------------------------------------------------------------
   3. NAVIGATION MOBILE (hamburger + drawer + backdrop)
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-nav-backdrop');
  if (!hamburger || !drawer || !backdrop) return;

  function closeMenu() {
    hamburger.classList.remove('active');
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      hamburger.classList.add('active');
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  hamburger.addEventListener('click', toggleMenu);
  backdrop.addEventListener('click', closeMenu);
  drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
}

/* --------------------------------------------------------------------------
   4. ACCORDÉON FAQ (index.html)
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   5. FILTRES GÉNÉRIQUES (modules.html : .filter-btn[data-filter] + [data-category])
   -------------------------------------------------------------------------- */
function initGenericFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  if (!filterBtns.length) return;

  const cards = document.querySelectorAll('[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. COPIER DANS LE PRESSE-PAPIER (bouton exemple sur index.html)
   -------------------------------------------------------------------------- */
function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // Repli pour file:// et contextes non sécurisés
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); } catch (e) { /* ignore */ }
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function initSamplePromptCopy() {
  const btn = document.getElementById('btn-copy-sample-prompt');
  const source = document.getElementById('sample-prompt-text');
  if (!btn || !source) return;

  btn.addEventListener('click', () => {
    copyTextToClipboard(source.textContent.trim()).then(() => {
      AppToast.show('Prompt copié dans le presse-papier ✓', 'success');
    });
  });
}

/* --------------------------------------------------------------------------
   7. INITIALISATION GLOBALE
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  AppStorage.syncNavbar();
  initMobileNav();
  initFaqAccordion();
  initGenericFilters();
  initSamplePromptCopy();
});
