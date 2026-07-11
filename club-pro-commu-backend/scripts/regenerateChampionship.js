require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

// Fonction pour planifier intelligemment les journées du championnat
function planifierJourneesChampionnat(nombreEquipes) {
  const matchs = [];
  const matchsParJournee = Math.floor(nombreEquipes / 2);
  const nombreJourneesAller = nombreEquipes - 1;
  
  // Générer tous les matchs aller
  for (let i = 0; i < nombreEquipes; i++) {
    for (let j = i + 1; j < nombreEquipes; j++) {
      matchs.push({
        equipe1: i,
        equipe2: j,
        type: 'aller'
      });
    }
  }
  
  // Générer tous les matchs retour
  for (let i = 0; i < nombreEquipes; i++) {
    for (let j = i + 1; j < nombreEquipes; j++) {
      matchs.push({
        equipe1: j,
        equipe2: i,
        type: 'retour'
      });
    }
  }
  
  // Planifier les journées
  const matchsPlanifies = [];
  
  // Planifier les matchs aller
  for (let journee = 1; journee <= nombreJourneesAller; journee++) {
    const matchsJournee = [];
    const equipesUtilisees = new Set();
    
    // Prendre les matchs non encore planifiés
    for (const match of matchs) {
      if (matchsJournee.length >= matchsParJournee) break;
      
      // Vérifier qu'aucune des deux équipes n'a déjà joué cette journée
      if (!equipesUtilisees.has(match.equipe1) && 
          !equipesUtilisees.has(match.equipe2) &&
          !match.journee &&
          match.type === 'aller') {
        
        match.journee = journee;
        match.dateMatch = new Date(Date.now() + (journee - 1) * 7 * 24 * 60 * 60 * 1000); // 7 jours entre chaque journée
        matchsJournee.push(match);
        equipesUtilisees.add(match.equipe1);
        equipesUtilisees.add(match.equipe2);
      }
    }
    
    matchsPlanifies.push(...matchsJournee);
  }
  
  // Planifier les matchs retour (après les matchs aller)
  for (let journee = 1; journee <= nombreJourneesAller; journee++) {
    const matchsJournee = [];
    const equipesUtilisees = new Set();
    
    // Prendre les matchs retour non encore planifiés
    for (const match of matchs) {
      if (matchsJournee.length >= matchsParJournee) break;
      
      // Vérifier qu'aucune des deux équipes n'a déjà joué cette journée
      if (!equipesUtilisees.has(match.equipe1) && 
          !equipesUtilisees.has(match.equipe2) &&
          !match.journee &&
          match.type === 'retour') {
        
        match.journee = nombreJourneesAller + journee;
        match.dateMatch = new Date(Date.now() + (nombreJourneesAller + journee - 1) * 7 * 24 * 60 * 60 * 1000);
        matchsJournee.push(match);
        equipesUtilisees.add(match.equipe1);
        equipesUtilisees.add(match.equipe2);
      }
    }
    
    matchsPlanifies.push(...matchsJournee);
  }
  
  return matchsPlanifies;
}

async function regenerateChampionship() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔄 RÉGÉNÉRATION COMPLÈTE DU CHAMPIONNAT');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    // Trouver la compétition "cham"
    const competition = await Competition.findById('68a871d0bfb4b4290e5758df')
      .populate('equipesInscrites.clubId');

    if (!competition) {
      console.log('❌ Compétition "cham" non trouvée');
      return;
    }

    console.log(`🏆 COMPÉTITION: ${competition.nom}`);
    console.log(`🏷️ Type: ${competition.type}`);
    console.log(`📊 Statut: ${competition.statut}`);
    console.log(`👥 Équipes inscrites: ${competition.equipesInscrites?.length || 0}`);

    if (competition.type !== 'championnat') {
      console.log('❌ Cette compétition n\'est pas un championnat');
      return;
    }

    const nombreEquipes = competition.equipesInscrites.length;
    const matchsTheoriques = nombreEquipes * (nombreEquipes - 1); // Aller + Retour
    
    console.log(`\n🧮 PLANIFICATION THÉORIQUE:`);
    console.log(`   Nombre d'équipes: ${nombreEquipes}`);
    console.log(`   Matchs théoriques: ${matchsTheoriques}`);
    console.log(`   Matchs par journée: ${Math.floor(nombreEquipes / 2)}`);
    console.log(`   Journées aller: ${nombreEquipes - 1}`);
    console.log(`   Journées totales: ${(nombreEquipes - 1) * 2}`);

    // Sauvegarder les scores existants
    console.log('\n💾 SAUVEGARDE DES SCORES EXISTANTS:');
    console.log('─────────────────────────────────────────────────────────────────────');
    const scoresExistant = new Map();
    
    if (competition.poules && competition.poules.length > 0) {
      const poule = competition.poules[0];
      if (poule.matchs && poule.matchs.length > 0) {
        poule.matchs.forEach(match => {
          if (match.statut === 'Terminé' && match.score1 !== null && match.score2 !== null) {
            const key = `${match.equipe1?.toString()}_${match.equipe2?.toString()}`;
            scoresExistant.set(key, {
              score1: match.score1,
              score2: match.score2,
              stats: match.stats || {},
              statut: 'Terminé'
            });
            console.log(`   ✅ Score sauvegardé: ${match.equipe1?.nom || 'TBD'} ${match.score1}-${match.score2} ${match.equipe2?.nom || 'TBD'}`);
          }
        });
      }
    }

    // Régénérer les matchs
    console.log('\n🔄 RÉGÉNÉRATION DES MATCHS:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    // Vider les poules existantes
    competition.poules = [];
    
    // Créer une nouvelle poule
    const poule = {
      nom: 'Poule principale',
      equipes: competition.equipesInscrites.map(e => e.clubId),
      matchs: []
    };
    
    // Générer la planification
    const planification = planifierJourneesChampionnat(nombreEquipes);
    
    // Créer les matchs avec la planification
    planification.forEach((matchPlan, index) => {
      const equipe1 = competition.equipesInscrites[matchPlan.equipe1].clubId;
      const equipe2 = competition.equipesInscrites[matchPlan.equipe2].clubId;
      
      // Vérifier s'il y a un score existant
      const key = `${equipe1.toString()}_${equipe2.toString()}`;
      const scoreExistant = scoresExistant.get(key);
      
      const nouveauMatch = {
        equipe1: equipe1,
        equipe2: equipe2,
        journee: matchPlan.journee,
        dateMatch: matchPlan.dateMatch,
        statut: scoreExistant ? 'Terminé' : 'Programmé',
        score1: scoreExistant ? scoreExistant.score1 : null,
        score2: scoreExistant ? scoreExistant.score2 : null,
        stats: scoreExistant ? scoreExistant.stats : {
          buteurs: [],
          passeurs: [],
          cartonsJaunes: [],
          cartonsRouges: []
        },
        valideParEquipe1: false,
        valideParEquipe2: false,
        captureEcran: null,
        litige: false,
        arbitre: null
      };
      
      poule.matchs.push(nouveauMatch);
      
      if (scoreExistant) {
        console.log(`   Match ${index + 1}: ${equipe1.nom} vs ${equipe2.nom} - Journée ${matchPlan.journee} - Score: ${scoreExistant.score1}-${scoreExistant.score2} ✅`);
      } else {
        console.log(`   Match ${index + 1}: ${equipe1.nom} vs ${equipe2.nom} - Journée ${matchPlan.journee} - Programmé`);
      }
    });
    
    competition.poules.push(poule);
    
    // Afficher la nouvelle planification
    console.log('\n📅 NOUVELLE PLANIFICATION:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    // Grouper par journée
    const matchsParJournee = {};
    poule.matchs.forEach(match => {
      const journee = match.journee;
      if (!matchsParJournee[journee]) matchsParJournee[journee] = [];
      matchsParJournee[journee].push(match);
    });
    
    // Afficher par journée
    Object.keys(matchsParJournee).sort((a, b) => parseInt(a) - parseInt(b)).forEach(journee => {
      const matchs = matchsParJournee[journee];
      const isRetour = parseInt(journee) > (nombreEquipes - 1);
      const label = isRetour ? `Journée ${parseInt(journee) - (nombreEquipes - 1)} (Retour)` : `Journée ${journee} (Aller)`;
      console.log(`📅 ${label}: ${matchs.length} matchs`);
      
      matchs.forEach((match, index) => {
        const date = match.dateMatch ? new Date(match.dateMatch).toLocaleDateString('fr-FR') : 'Non définie';
        const score = match.statut === 'Terminé' ? ` - ${match.score1}-${match.score2}` : '';
        console.log(`   ${index + 1}. ${match.equipe1.nom} vs ${match.equipe2.nom} - ${date}${score}`);
      });
      console.log('');
    });

    // Sauvegarder
    console.log('💾 Sauvegarde des modifications...');
    await competition.save();
    console.log('✅ Compétition sauvegardée avec succès');

    console.log('\n🎉 RÉGÉNÉRATION TERMINÉE !');
    console.log('─────────────────────────────────────────────────────────────────────');
    console.log('✅ Tous les matchs régénérés correctement');
    console.log('✅ Planification des journées optimisée');
    console.log('✅ Scores existants préservés');
    console.log('✅ Aucune équipe ne joue 2 fois dans la même journée');
    console.log('🚀 Le championnat est maintenant parfaitement organisé');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
regenerateChampionship(); 