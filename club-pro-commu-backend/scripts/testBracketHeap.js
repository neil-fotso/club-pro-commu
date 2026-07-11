// Test algorithm for single-elimination bracket generation and progression

function generateEliminationBracket(equipesConfirmees) {
  const N = equipesConfirmees.length;
  if (N < 2) return [];

  // Déterminer la taille du heap (prochaine puissance de 2 >= N)
  const M = Math.pow(2, Math.ceil(Math.log2(N)));
  
  // Mélanger aléatoirement les équipes (ici on ne mélange pas pour garder l'ordre déterministe dans le test)
  const equipesShuffled = [...equipesConfirmees];
  
  // Initialiser le tableau heap de taille 2M - 1
  const heap = new Array(2 * M - 1).fill(null);
  
  // Remplir les feuilles du heap
  for (let i = 0; i < M; i++) {
    heap[M - 1 + i] = (i < N) ? equipesShuffled[i] : null;
  }
  
  const matchsElimination = [];
  
  // Helper pour trouver le nom de la phase
  const getPhaseName = (index, M) => {
    if (index === 0) return 'Finale';
    if (index >= 1 && index <= 2) return 'Demi';
    if (index >= 3 && index <= 6) return 'Quart';
    if (index >= 7 && index <= 14) return 'Huitième';
    if (index >= 15 && index <= 30) return 'Seizième';
    if (index >= 31 && index <= 62) return 'Trente-deuxième';
    return 'Éliminatoire';
  };
  
  // Tableau pour suivre si un match a été créé à un index donné
  const matchCreatedAtIndex = new Array(M - 1).fill(false);
  
  // Parcourir de bas en haut (de M-2 à 0)
  for (let p = M - 2; p >= 0; p--) {
    const c1 = 2 * p + 1;
    const c2 = 2 * p + 2;
    
    const active1 = (heap[c1] !== null) || (c1 < M - 1 && matchCreatedAtIndex[c1]);
    const active2 = (heap[c2] !== null) || (c2 < M - 1 && matchCreatedAtIndex[c2]);
    
    if (active1 && active2) {
      matchCreatedAtIndex[p] = true;
      const phase = getPhaseName(p, M);
      matchsElimination.push({
        _id: `match_${p}`,
        equipe1: heap[c1],
        equipe2: heap[c2],
        score1: null,
        score2: null,
        statut: 'Programmé',
        phase: phase,
        tour: p // index heap
      });
      heap[p] = null;
    } else if (active1) {
      heap[p] = heap[c1];
    } else if (active2) {
      heap[p] = heap[c2];
    } else {
      heap[p] = null;
    }
  }
  
  if (M >= 4) {
    matchsElimination.push({
      _id: 'petite_finale',
      equipe1: null,
      equipe2: null,
      score1: null,
      score2: null,
      statut: 'Programmé',
      phase: 'Petite finale',
      tour: -2
    });
  }
  
  return matchsElimination;
}

// Fonction de simulation de progression
function simulateProgression(matchsElimination, completedMatch, winner, loser) {
  console.log(`\nMatch terminé: [${completedMatch.phase} (tour ${completedMatch.tour})] ${completedMatch.equipe1} vs ${completedMatch.equipe2}`);
  console.log(`-> Gagnant: ${winner}, Perdant: ${loser}`);
  
  if (completedMatch.phase === 'Finale') {
    console.log(`🏆 CHAMPION: ${winner}!`);
    return;
  }
  
  if (completedMatch.phase === 'Petite finale') {
    console.log(`🥉 Troisième place: ${winner}`);
    return;
  }
  
  const currentHeapIndex = completedMatch.tour;
  const parentHeapIndex = Math.floor((currentHeapIndex - 1) / 2);
  
  let nextMatch = matchsElimination.find(m => m.tour === parentHeapIndex);
  
  if (nextMatch) {
    const isLeftChild = (currentHeapIndex % 2 !== 0);
    if (isLeftChild) {
      nextMatch.equipe1 = winner;
      console.log(`  Placé ${winner} en equipe1 du match parent ${nextMatch._id} (${nextMatch.phase})`);
    } else {
      nextMatch.equipe2 = winner;
      console.log(`  Placé ${winner} en equipe2 du match parent ${nextMatch._id} (${nextMatch.phase})`);
    }
  } else {
    console.log(`  Attention: match parent ${parentHeapIndex} introuvable`);
  }
  
  if (completedMatch.phase === 'Demi') {
    let pf = matchsElimination.find(m => m.tour === -2);
    if (pf) {
      const isLeftChild = (currentHeapIndex % 2 !== 0);
      if (isLeftChild) {
        pf.equipe1 = loser;
        console.log(`  Placé perdant ${loser} en equipe1 de la Petite finale`);
      } else {
        pf.equipe2 = loser;
        console.log(`  Placé perdant ${loser} en equipe2 de la Petite finale`);
      }
    }
  }
}

// --- Scénario 1 : 3 équipes ---
console.log('--- TEST 3 EQUIPES ---');
const teams3 = ['PSG', 'OM', 'OL'];
const matches3 = generateEliminationBracket(teams3);
console.log('Matchs générés :');
matches3.forEach(m => console.log(`[${m.phase}] index=${m.tour}: ${m.equipe1 || 'TBD'} vs ${m.equipe2 || 'TBD'}`));

// Simuler Demi : PSG vs OM (OM gagne)
const demiMatch3 = matches3.find(m => m.phase === 'Demi');
simulateProgression(matches3, demiMatch3, 'OM', 'PSG');

// Simuler Finale : OL vs OM (OL gagne)
const finaleMatch3 = matches3.find(m => m.phase === 'Finale');
simulateProgression(matches3, finaleMatch3, 'OL', 'OM');


// --- Scénario 2 : 5 équipes ---
console.log('\n--- TEST 5 EQUIPES ---');
const teams5 = ['PSG', 'OM', 'OL', 'LOSC', 'Rennes'];
const matches5 = generateEliminationBracket(teams5);
console.log('Matchs générés :');
matches5.forEach(m => console.log(`[${m.phase}] index=${m.tour}: ${m.equipe1 || 'TBD'} vs ${m.equipe2 || 'TBD'}`));

// Simuler Quart 1: PSG vs OM (PSG gagne)
const q1 = matches5.find(m => m.tour === 3);
simulateProgression(matches5, q1, 'PSG', 'OM');

// Simuler Quart 2: OL vs LOSC (OL gagne)
const q2 = matches5.find(m => m.tour === 4);
simulateProgression(matches5, q2, 'OL', 'LOSC');

// Rennes (exempté en Quart) attend en Finale. Les deux gagnants jouent en Demi
const demi5 = matches5.find(m => m.phase === 'Demi');
simulateProgression(matches5, demi5, 'PSG', 'OL'); // PSG gagne, OL perd (va en Petite finale)

// Petite finale : OL vs null ? Wait, since Rennnes went directly to Finale, who does OL play in Petite finale?
// In a 5 team tournament, only 1 team loses in Demi (the other slot didn't play). So Petite finale is OL vs null.
// Let's check how it behaves:
const pf5 = matches5.find(m => m.phase === 'Petite finale');
console.log(`Petite finale après Demi : ${pf5.equipe1} vs ${pf5.equipe2}`);

// Finale : Rennes vs PSG (PSG gagne)
const finale5 = matches5.find(m => m.phase === 'Finale');
simulateProgression(matches5, finale5, 'PSG', 'Rennes');
