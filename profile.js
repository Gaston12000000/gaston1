/* ==========================================================================
   YOUTUBE BUSINESS 360° — profile.js
   Rend la page Profil dynamique à partir de l'état réel de l'apprenant
   (AppStorage) : progression sur les 25 modules, badges débloqués,
   statistiques, et bouton "Reprendre là où j'en étais".
   Nécessite main.js (AppStorage) chargé avant ce fichier.
   ========================================================================== */

const ProfileEngine = (() => {
  const MODULES = [
    { num: 1, id: 'mod-01-lec-01', title: 'Trouver sa niche', href: 'formation.html' },
    { num: 2, id: 'mod-02-lec-01', title: 'Psychologie du clic', href: 'formation-module-02.html' },
    { num: 3, id: 'mod-03-lec-01', title: 'Analyser la concurrence', href: 'formation-module-03.html' },
    { num: 4, id: 'mod-04-lec-01', title: 'Créer sa chaîne pro', href: 'formation-module-04.html' },
    { num: 5, id: 'mod-05-lec-01', title: 'Stratégie de contenu', href: 'formation-module-05.html' },
    { num: 6, id: 'mod-06-lec-01', title: 'Écrire un script', href: 'formation-module-06.html' },
    { num: 7, id: 'mod-07-lec-01', title: 'Miniatures qui cliquent', href: 'formation-module-07.html' },
    { num: 8, id: 'mod-08-lec-01', title: 'Tournage & montage', href: 'formation-module-08.html' },
    { num: 9, id: 'mod-09-lec-01', title: 'SEO YouTube', href: 'formation-module-09.html' },
    { num: 10, id: 'mod-10-lec-01', title: 'Calendrier & régularité', href: 'formation-module-10.html' },
    { num: 11, id: 'mod-11-lec-01', title: 'Analytics', href: 'formation-module-11.html' },
    { num: 12, id: 'mod-12-lec-01', title: 'Monétisation (9 modèles)', href: 'formation-module-12.html' },
    { num: 13, id: 'mod-13-lec-01', title: "YouTube depuis l'Afrique", href: 'formation-module-13.html' },
    { num: 14, id: 'mod-14-lec-01', title: 'Cas pratiques approfondis', href: 'formation-module-14.html' },
    { num: 15, id: 'mod-15-lec-01', title: "Plan d'action 7/30/60/90j", href: 'formation-module-15.html' },
    { num: 16, id: 'mod-16-lec-01', title: 'IA & YouTube', href: 'formation-module-16.html' },
    { num: 17, id: 'mod-17-lec-01', title: 'Glossaire A-Z', href: 'formation-module-17.html' },
    { num: 18, id: 'mod-18-lec-01', title: 'Boîte à outils bonus', href: 'formation-module-18.html' },
    { num: 19, id: 'mod-19-lec-01', title: 'Construire son système', href: 'formation-module-19.html' },
    { num: 20, id: 'mod-20-lec-01', title: 'Marque personnelle', href: 'formation-module-20.html' },
    { num: 21, id: 'mod-21-lec-01', title: 'Communauté engagée', href: 'formation-module-21.html' },
    { num: 22, id: 'mod-22-lec-01', title: 'Offre digitale rentable', href: 'formation-module-22.html' },
    { num: 23, id: 'mod-23-lec-01', title: 'Tunnel de conversion', href: 'formation-module-23.html' },
    { num: 24, id: 'mod-24-lec-01', title: 'Optimiser le business', href: 'formation-module-24.html' },
    { num: 25, id: 'mod-25-lec-01', title: 'Vision long terme', href: 'formation-module-25.html' },
  ];

  function getCompletedSet(state) {
    return new Set(state.completedLessons || []);
  }

  function renderHero(state) {
    const completed = getCompletedSet(state);
    const doneCount = MODULES.filter(m => completed.has(m.id)).length;
    const pct = Math.round((doneCount / MODULES.length) * 100);
    const level = AppStorage.getLevel(state.xp);

    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    setText('profile-modules-count', `${doneCount} / ${MODULES.length}`);
    setText('profile-progress-pct', `${pct} %`);
    setText('profile-xp-value', `${state.xp} XP`);
    setText('profile-level-badge', level.name);

    const bar = document.getElementById('profile-progress-bar');
    if (bar) bar.style.width = `${pct}%`;

    const exerciseCount = Object.keys(state.exercises || {}).length;
    setText('profile-exercises-count', `${exerciseCount}`);
    setText('profile-prompts-count', `${(state.copiedPrompts || []).length}`);

    // Bouton "Reprendre" : pointe vers le premier module non terminé, ou le dernier si tout est fait
    const nextModule = MODULES.find(m => !completed.has(m.id));
    const resumeBtn = document.getElementById('profile-resume-btn');
    if (resumeBtn) {
      if (nextModule) {
        resumeBtn.textContent = `Reprendre : Module ${String(nextModule.num).padStart(2, '0')} →`;
        resumeBtn.href = nextModule.href;
      } else {
        resumeBtn.textContent = 'Voir mon certificat →';
        resumeBtn.href = 'certificat.html';
      }
    }
  }

  function renderModuleGrid(state) {
    const container = document.getElementById('profile-modules-grid');
    if (!container) return;
    const completed = getCompletedSet(state);

    container.innerHTML = MODULES.map(m => {
      const done = completed.has(m.id);
      return `
        <a href="${m.href}" class="metric-box" style="text-decoration:none; display:block; ${done ? 'border-color: rgba(16,185,129,0.4);' : ''}">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px;">
            <span style="font-family: var(--font-heading); font-weight:800; color: var(--accent-gold); font-size: 0.8rem;">MODULE ${String(m.num).padStart(2, '0')}</span>
            <span style="font-size:1.1rem; color: ${done ? 'var(--accent-green)' : 'var(--text-muted)'};">${done ? '✓' : '○'}</span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 0.95rem; color: #FFFFFF; line-height:1.3;">${m.title}</h3>
        </a>
      `;
    }).join('');
  }

  function renderBadges(state) {
    const completed = getCompletedSet(state);
    const doneCount = MODULES.filter(m => completed.has(m.id)).length;
    const exerciseCount = Object.keys(state.exercises || {}).length;
    const level = AppStorage.getLevel(state.xp);

    const badges = [
      {
        icon: '🎯', title: 'Premier Pas',
        desc: 'Terminer votre premier module.',
        unlocked: doneCount >= 1,
        progressLabel: doneCount >= 1 ? 'Débloqué ✓' : 'Verrouillé 🔒',
      },
      {
        icon: '💡', title: 'Exercice validé',
        desc: 'Sauvegarder votre premier exercice pratique.',
        unlocked: exerciseCount >= 1,
        progressLabel: exerciseCount >= 1 ? 'Débloqué ✓' : 'Verrouillé 🔒',
      },
      {
        icon: '⚡', title: 'Sur la lancée',
        desc: 'Terminer 5 modules de la formation.',
        unlocked: doneCount >= 5,
        progressLabel: doneCount >= 5 ? 'Débloqué ✓' : `En cours (${Math.min(doneCount,5)}/5)`,
      },
      {
        icon: '🚀', title: 'Mi-parcours',
        desc: 'Terminer 13 modules — plus de la moitié du programme.',
        unlocked: doneCount >= 13,
        progressLabel: doneCount >= 13 ? 'Débloqué ✓' : `En cours (${Math.min(doneCount,13)}/13)`,
      },
      {
        icon: '👑', title: level.name.replace(/^\S+\s/, ''),
        desc: 'Atteindre ce niveau grâce à votre XP cumulé.',
        unlocked: true,
        progressLabel: `${state.xp} XP`,
      },
      {
        icon: '🏆', title: 'YouTube Business 360°',
        desc: 'Compléter l\'intégralité des 25 modules.',
        unlocked: doneCount >= MODULES.length,
        progressLabel: doneCount >= MODULES.length ? 'Débloqué ✓ — Certificat disponible' : `En cours (${doneCount}/${MODULES.length})`,
        link: doneCount >= MODULES.length ? 'certificat.html' : null,
      },
    ];

    const container = document.getElementById('profile-badges-grid');
    if (!container) return;

    container.innerHTML = badges.map(b => `
      <div class="metric-box" style="${b.unlocked ? '' : 'opacity: 0.6;'}">
        <div style="font-size: 2rem; margin-bottom: 8px;">${b.icon}</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #FFFFFF;">${b.title}</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">${b.desc}</p>
        ${b.link
          ? `<a href="${b.link}" class="badge badge-completed" style="margin-top: 12px; text-decoration:none;">${b.progressLabel}</a>`
          : `<span class="badge ${b.unlocked ? 'badge-completed' : 'badge-locked'}" style="margin-top: 12px;">${b.progressLabel}</span>`
        }
      </div>
    `).join('');
  }

  function init() {
    const state = AppStorage.getState();
    renderHero(state);
    renderModuleGrid(state);
    renderBadges(state);
  }

  return { init, MODULES };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (typeof AppStorage !== 'undefined') {
    ProfileEngine.init();
  }
});
