/* ==========================================================================
   YOUTUBE BUSINESS 360° — dashboard.js
   Génère la checklist de publication (15 points), suit sa progression,
   et synchronise les indicateurs (KPI) du tableau de bord apprenant.
   Nécessite main.js (AppStorage, AppToast) chargé avant ce fichier.
   ========================================================================== */

const DashboardEngine = (() => {
  const CHECKLIST_ITEMS = [
    { id: 'sujet', label: 'Sujet validé et aligné avec la niche' },
    { id: 'audience', label: 'Audience cible clairement définie' },
    { id: 'titre', label: 'Titre optimisé (curiosité + spécificité + bénéfice)' },
    { id: 'hook', label: "Hook des 10 premières secondes préparé" },
    { id: 'script', label: 'Script terminé en 9 blocs' },
    { id: 'tournage', label: 'Tournage réalisé' },
    { id: 'audio', label: 'Audio vérifié (pas de souffle, pas de saturation)' },
    { id: 'montage', label: 'Montage terminé' },
    { id: 'soustitres', label: 'Sous-titres ajoutés' },
    { id: 'miniature', label: 'Miniature testée en taille réduite (mobile)' },
    { id: 'description', label: 'Description rédigée avec mots-clés SEO' },
    { id: 'chapitres', label: 'Chapitres ajoutés (si vidéo > 5-6 min)' },
    { id: 'ecranfin', label: 'Écran de fin configuré' },
    { id: 'cta', label: 'CTA aligné avec la valeur de la vidéo' },
    { id: 'verification', label: 'Vérification finale avant publication' },
  ];

  function render() {
    const container = document.getElementById('checklist-grid-container');
    if (!container) return;

    const state = AppStorage.getChecklist();
    container.innerHTML = CHECKLIST_ITEMS.map(item => {
      const checked = !!state[item.id];
      return `
        <div class="checklist-item${checked ? ' checked' : ''}" data-checklist-id="${item.id}" role="checkbox" aria-checked="${checked}" tabindex="0">
          <div class="checklist-checkbox">✓</div>
          <span class="checklist-text">${item.label}</span>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.checklist-item').forEach(row => {
      const toggle = () => {
        const id = row.getAttribute('data-checklist-id');
        const nowChecked = !row.classList.contains('checked');
        row.classList.toggle('checked', nowChecked);
        row.setAttribute('aria-checked', String(nowChecked));
        AppStorage.setChecklistItem(id, nowChecked);
        updateProgress();
      };
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });

    updateProgress();
  }

  function updateProgress() {
    const state = AppStorage.getChecklist();
    const total = CHECKLIST_ITEMS.length;
    const done = CHECKLIST_ITEMS.filter(item => state[item.id]).length;
    const pct = Math.round((done / total) * 100);

    const badge = document.getElementById('checklist-score-badge');
    const bar = document.getElementById('checklist-progress-bar');
    if (badge) badge.textContent = `${done} / ${total} complétés (${pct} %)`;
    if (bar) bar.style.width = `${pct}%`;
  }

  function resetChecklist() {
    AppStorage.resetChecklist();
    render();
    AppToast.show('Checklist réinitialisée', 'info');
  }

  function initChecklist() {
    render();
  }

  function initKpis() {
    const state = AppStorage.getState();
    const exercisesEl = document.getElementById('dash-kpi-exercises');
    if (exercisesEl) {
      const count = Object.keys(state.exercises || {}).length;
      exercisesEl.textContent = `${count} / 40`;
    }
    // Les autres KPI (progress, modules, level, prompts) sont synchronisés
    // automatiquement par AppStorage.syncNavbar() dans main.js.
  }

  return { initChecklist, resetChecklist, initKpis };
})();

document.addEventListener('DOMContentLoaded', () => {
  DashboardEngine.initChecklist();
  DashboardEngine.initKpis();
});
