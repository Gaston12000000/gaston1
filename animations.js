/* ==========================================================================
   YOUTUBE BUSINESS 360° — animations.js
   Révélation au scroll (.reveal) + compteurs animés (data-counter-target)
   + petit effet "live" sur le compteur d'abonnés du hero.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. SCROLL REVEAL — ajoute .is-visible quand un élément .reveal entre
      dans le viewport (voir la règle CSS correspondante dans style.css).
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Repli si IntersectionObserver n'est pas disponible : tout afficher directement.
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  elements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   2. COMPTEURS ANIMÉS — anime les [data-counter-target] de 0 à la valeur
      cible lorsqu'ils deviennent visibles.
   -------------------------------------------------------------------------- */
function animateCounter(el, target, duration = 1400) {
  const start = performance.now();
  const startVal = 0;

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(startVal + (target - startVal) * eased);
    el.textContent = value;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(tick);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter-target]');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(el => {
      const target = parseInt(el.getAttribute('data-counter-target'), 10) || 0;
      el.textContent = target;
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-counter-target'), 10) || 0;
        animateCounter(entry.target, target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   3. COMPTEUR "EN DIRECT" DU HERO — petit effet vivant, purement visuel.
   -------------------------------------------------------------------------- */
function initLiveSubsCounter() {
  const el = document.getElementById('hero-live-subs');
  if (!el) return;

  let base = parseInt(el.textContent.replace(/[^\d]/g, ''), 10) || 124850;

  setInterval(() => {
    base += Math.floor(Math.random() * 3) + 1;
    el.textContent = `+${base.toLocaleString('fr-FR')}`;
  }, 4000);
}

/* --------------------------------------------------------------------------
   4. INITIALISATION
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initLiveSubsCounter();
});
