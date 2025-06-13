(() => {
  const listEl = document.getElementById('compositions-list');
  const patchStatusEl = document.getElementById('patch-status');
  const updateButton = document.getElementById('update-button');

  // URL du JSON hébergé (généré automatiquement par le backend-scraper via CI)
  const DATA_URL =
    'https://raw.githubusercontent.com/Paradoxollie/tft-speed/main/backend-scraper/public/meta.json';

  /**
   * Determine l'état de jeu de l'utilisateur.
   * Cette version de démonstration génère des données aléatoires.
   * Plus tard, elle sera remplacée par l'OCR en temps réel.
   */
  function getCurrentGameState() {
    // Exemple : on simule 2 champions possédés aléatoirement.
    const sampleChamps = [
      'Akali',
      'Yasuo',
      'Jinx',
      'Vi',
      'Senna',
      'Ekko',
      'Garen',
      'Graves'
    ];

    const playerChampions = sampleChamps
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map((name) => ({ name }));

    return {
      playerChampions,
      opponentCompositions: [],
      stage: 2,
      gold: 10,
      health: 100
    };
  }

  /**
   * Calcule un score simplifié pour chaque composition.
   *   – Bonus si champs déjà possédés (0.3 max)
   *   – Bonus winRate (0.2 max)
   *   – Bonus tier (0.8 S ► 0.2 C)
   */
  function calculateScore(comp, gameState) {
    const tierScores = { S: 0.8, A: 0.6, B: 0.4, C: 0.2 };
    let score = tierScores[comp.tier] || 0;

    const carries = comp.mainCarries || [];
    const owned = carries.concat(comp.supportChampions || [])
      .filter((c) => gameState.playerChampions.some((pc) => pc.name === c.name));

    if (carries.length > 0) {
      score += (owned.length / carries.length) * 0.3;
    }

    score += ((comp.winRate || 50) / 100) * 0.2;

    return Math.min(1, score);
  }

  /**
   * Récupère le JSON distant, calcule les recommandations et met à jour l'UI.
   */
  async function refreshData() {
    try {
      patchStatusEl.textContent = '🔄 Mise à jour…';

      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const meta = await response.json();
      const patch = meta.compositions?.[0]?.patchVersion ?? 'N/A';
      patchStatusEl.textContent = `Patch ${patch} · ${new Date(
        meta.lastUpdated || Date.now()
      ).toLocaleDateString()}`;

      const gameState = getCurrentGameState();

      const compositions = (meta.compositions || []).map((c) => ({
        ...c,
        score: calculateScore(c, gameState)
      }));

      compositions.sort((a, b) => b.score - a.score);

      renderCompositions(compositions, gameState);
    } catch (error) {
      console.error('[Renderer] Erreur lors du chargement des données:', error);
      patchStatusEl.textContent = 'Erreur de mise à jour. 🔄';
      listEl.innerHTML = `<div class="overlay-content"><span class="error">Erreur : ${
        error.message || error
      }</span></div>`;
    }
  }

  let lockedComposition = null;

  /**
   * Affiche les compositions dans la liste.
   * @param {Array<any>} compositions
   */
  function renderCompositions(compositions, gameState) {
    listEl.innerHTML = '';

    const list = lockedComposition ? [lockedComposition] : compositions.slice(0, 3);

    list.forEach((comp) => {
      const card = document.createElement('div');
      card.className = 'overlay-content';
      card.innerHTML = `
        <h3>${comp.name} <span class="tier">${comp.tier}</span> <span class="score">${(comp.score * 100).toFixed(0)}%</span></h3>
        <div class="composition-details">
          <div><span class="winrate">WinRate:</span> ${(comp.winRate || 0).toFixed(
            1
          )}%</div>
          <div><span class="score">Carry:</span> ${comp.mainCarries
            .map((c) => c.name)
            .join(', ')}</div>
          <div><span class="synergies">Traits:</span> ${comp.traits.join(', ')}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (lockedComposition && lockedComposition.name === comp.name) {
          lockedComposition = null; // déverrouille si on re-clique
        } else {
          lockedComposition = comp;
        }
        renderCompositions(compositions, gameState);
      });

      listEl.appendChild(card);
    });
  }

  // Gestionnaire du bouton de mise à jour manuelle
  updateButton?.addEventListener('click', () => {
    refreshData();
  });

  // Chargement initial des données au démarrage de l'overlay
  window.addEventListener('DOMContentLoaded', () => {
    refreshData();
  });
})(); 