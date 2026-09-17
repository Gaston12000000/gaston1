/* ==========================================================================
   YOUTUBE BUSINESS 360° — course.js
   Logique de la page de leçon (pages/formation.html) : marquer une leçon
   comme terminée, attribuer l'XP, persister l'état entre les visites.
   Nécessite main.js (AppStorage, AppToast) chargé avant ce fichier.
   ========================================================================== */

const CourseEngine = (() => {
  const XP_PER_LESSON = 25;

  function applyButtonState(btnEl, isComplete) {
    if (!btnEl) return;
    const label = btnEl.querySelector('span') || btnEl;
    if (isComplete) {
      btnEl.classList.add('completed');
      label.textContent = '✓ Leçon terminée — cliquer pour annuler';
    } else {
      btnEl.classList.remove('completed');
      label.textContent = `✓ Marquer la leçon comme terminée (+${XP_PER_LESSON} XP)`;
    }
  }

  function toggleLesson(lessonId, btnEl) {
    const wasComplete = AppStorage.isLessonComplete(lessonId);
    const nowComplete = !wasComplete;

    AppStorage.setLessonComplete(lessonId, nowComplete);
    applyButtonState(btnEl, nowComplete);

    if (nowComplete) {
      AppStorage.addXP(XP_PER_LESSON, 'Leçon validée');
    } else {
      AppStorage.addXP(-XP_PER_LESSON, 'Leçon marquée comme non terminée');
    }

    updateSidebarProgress();
  }

  /* Recalcule le pourcentage affiché dans la sidebar à partir du nombre
     réel de leçons validées, pour que la progression reste cohérente
     avec les actions de l'apprenant plutôt que de rester figée à 42%. */
  function updateSidebarProgress() {
    const state = AppStorage.getState();
    const pct = Math.min(100, Math.round((state.completedLessons.length / state.totalLessons) * 100));

    const valueEl = document.querySelector('.progress-value-text');
    const barEl = document.querySelector('.progress-box .progress-bar-fill');
    if (valueEl) valueEl.textContent = `${pct} %`;
    if (barEl) barEl.style.width = `${pct}%`;
  }

  function init(lessonId) {
    const btn = document.getElementById('btn-toggle-complete');
    if (btn && lessonId) {
      applyButtonState(btn, AppStorage.isLessonComplete(lessonId));
    }
    updateSidebarProgress();
  }

  return { toggleLesson, init };
})();

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-toggle-complete');
  if (!btn) return;
  // Récupère l'identifiant de leçon depuis l'attribut onclick déjà présent dans le HTML
  const match = btn.getAttribute('onclick') ? btn.getAttribute('onclick').match(/toggleLesson\('([^']+)'/) : null;
  const lessonId = match ? match[1] : null;
  CourseEngine.init(lessonId);
});
