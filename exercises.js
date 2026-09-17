/* ==========================================================================
   YOUTUBE BUSINESS 360° — exercises.js
   Logique des exercices interactifs (pages/exercice.html) : sauvegarde des
   réponses, déblocage du corrigé, restauration au chargement.
   Nécessite main.js (AppStorage, AppToast) chargé avant ce fichier.
   ========================================================================== */

const ExerciseEngine = (() => {
  const XP_PER_EXERCISE = 20;

  function saveExercise(exerciseId, formEl) {
    const data = {};
    new FormData(formEl).forEach((value, key) => { data[key] = value; });

    const already = AppStorage.getExercise(exerciseId);
    AppStorage.saveExercise(exerciseId, data);

    if (!already) {
      AppStorage.addXP(XP_PER_EXERCISE, 'Exercice sauvegardé');
    } else {
      AppToast.show('Exercice mis à jour ✓', 'success');
    }
  }

  function revealSolution(solutionBoxId) {
    const box = document.getElementById(solutionBoxId);
    if (!box) return;

    const isVisible = box.classList.contains('solution-visible');
    if (isVisible) {
      box.classList.remove('solution-visible');
      setTimeout(() => { box.style.display = 'none'; }, 500);
    } else {
      box.style.display = 'block';
      // reflow avant d'ajouter la classe pour permettre la transition CSS
      requestAnimationFrame(() => box.classList.add('solution-visible'));
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const btn = document.getElementById(`btn-solution-${solutionBoxId.replace('solution-', '')}`);
    if (btn) {
      const label = btn.querySelector('span') || btn;
      label.textContent = isVisible
        ? '💡 Débloquer le corrigé de Gaston N3'
        : '🙈 Masquer le corrigé';
    }
  }

  function loadExercise(exerciseId, formEl) {
    if (!formEl) return;
    const saved = AppStorage.getExercise(exerciseId);
    if (!saved) return;

    Object.keys(saved).forEach(key => {
      const field = formEl.elements.namedItem(key);
      if (field) field.value = saved[key];
    });
  }

  return { saveExercise, revealSolution, loadExercise };
})();
