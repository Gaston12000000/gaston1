/* ==========================================================================
   YOUTUBE BUSINESS 360° — prompts.js
   Affichage, recherche et filtrage de la bibliothèque de 150 prompts IA
   (pages/prompts.html). Nécessite prompts-data.js et main.js chargés avant.
   ========================================================================== */

const PromptsLibrary = (() => {
  let currentSearch = '';
  let currentCategory = 'all';

  function matchesFilters(prompt) {
    const categoryOk = currentCategory === 'all' || prompt.category === currentCategory;
    if (!categoryOk) return false;

    if (!currentSearch) return true;
    const haystack = `${prompt.title} ${prompt.objective} ${prompt.prompt} ${prompt.category}`.toLowerCase();
    return haystack.includes(currentSearch);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function cardTemplate(prompt) {
    return `
      <div class="prompt-lib-card">
        <span class="prompt-lib-badge">${escapeHtml(prompt.category)}</span>
        <div class="prompt-lib-title">Prompt N°${String(prompt.id).padStart(3, '0')} — ${escapeHtml(prompt.title)}</div>
        <div class="prompt-lib-meta"><strong>Objectif :</strong> ${escapeHtml(prompt.objective)}</div>
        <div class="prompt-lib-meta"><strong>Quand l'utiliser :</strong> ${escapeHtml(prompt.when)}</div>
        <div class="prompt-lib-code">${escapeHtml(prompt.prompt)}</div>
        <div class="prompt-lib-meta"><strong>Variables :</strong> ${escapeHtml(prompt.variables)}</div>
        <div class="prompt-lib-footer">
          <span style="font-size:0.78rem; color: var(--text-muted);">Résultat attendu : ${escapeHtml(prompt.result)}</span>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" style="width:100%;" data-copy-prompt-id="${prompt.id}">
          📋 Copier ce prompt
        </button>
      </div>
    `;
  }

  function render() {
    const container = document.getElementById('prompts-list-container');
    if (!container) return;

    const filtered = PROMPTS_DATA.filter(matchesFilters);

    if (!filtered.length) {
      container.innerHTML = '<div class="prompt-lib-empty">Aucun prompt ne correspond à ta recherche. Essaie un autre mot-clé ou une autre catégorie.</div>';
      return;
    }

    container.innerHTML = filtered.map(cardTemplate).join('');

    container.querySelectorAll('[data-copy-prompt-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-copy-prompt-id'), 10);
        const prompt = PROMPTS_DATA.find(p => p.id === id);
        if (!prompt) return;

        copyTextToClipboard(prompt.prompt).then(() => {
          AppToast.show('Prompt copié dans le presse-papier ✓', 'success');
          if (!AppStorage.hasCopiedPrompt(id)) {
            AppStorage.markPromptCopied(id);
            AppStorage.addXP(2, 'Nouveau prompt exploré');
          }
        });
      });
    });
  }

  function populateCategorySelect() {
    const select = document.getElementById('prompt-category-select');
    if (!select) return;

    const categories = [...new Set(PROMPTS_DATA.map(p => p.category))];
    select.innerHTML = '<option value="all">Toutes les catégories (150 prompts)</option>' +
      categories.map(c => {
        const count = PROMPTS_DATA.filter(p => p.category === c).length;
        return `<option value="${escapeHtml(c)}">${escapeHtml(c)} (${count})</option>`;
      }).join('');
  }

  function init() {
    populateCategorySelect();
    render();

    const searchInput = document.getElementById('prompt-search-input');
    const categorySelect = document.getElementById('prompt-category-select');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.trim().toLowerCase();
        render();
      });
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', () => {
        currentCategory = categorySelect.value;
        render();
      });
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PROMPTS_DATA !== 'undefined') {
    PromptsLibrary.init();
  }
});
