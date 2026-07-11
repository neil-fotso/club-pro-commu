require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function debugChampionship() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔍 DEBUG DU CHAMPIONNAT');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    // Trouver la compétition "cham"
    const competition = await Competition.findById('68a871d0bfb4b4290e5758df')
      .populate('equipesInscrites.clubId')
      .populate('poules.matchs.equipe1')
      .populate('poules.matchs.equipe2');

    if (!competition) {
      console.log('❌ Compétition "cham" non trouvée');
      return;
    }

    console.log(`🏆 COMPÉTITION: ${competition.nom}`);
    console.log(`🏷️ Type: ${competition.type}`);
    console.log(`📊 Statut: ${competition.statut}`);
    console.log(`👥 Équipes inscrites: ${competition.equipesInscrites?.length || 0}`);

    // Afficher les équipes
    console.log('\n🏟️ ÉQUIPES INSCRITES:');
    console.log('─────────────────────────────────────────────────────────────────────');
    competition.equipesInscrites.forEach((equipe, index) => {
      console.log(`${index + 1}. ${equipe.clubId?.nom || 'Club inconnu'} - Statut: ${equipe.statut}`);
    });

    // Afficher les poules
    console.log('\n📋 POULES:');
    console.log('─────────────────────────────────────────────────────────────────────');
    if (competition.poules && competition.poules.length > 0) {
      competition.poules.forEach((poule, pouleIndex) => {
        console.log(`📋 ${poule.nom}: ${poule.matchs?.length || 0} matchs`);
        
        if (poule.matchs && poule.matchs.length > 0) {
          poule.matchs.forEach((match, matchIndex) => {
            console.log(`   Match ${matchIndex + 1}: ${match.equipe1?.nom || 'TBD'} vs ${match.equipe2?.nom || 'TBD'}`);
            console.log(`   Statut: ${match.statut}, Score: ${match.score1 || '-'} - ${match.score2 || '-'}`);
            console.log(`   Journée: ${match.journee || 'Non définie'}, Date: ${match.dateMatch ? new Date(match.dateMatch).toLocaleDateString('fr-FR') : 'Non définie'}`);
            console.log('');
          });
        }
      });
    } else {
      console.log('❌ Aucune poule trouvée');
    }

    // Calculer le nombre théorique de matchs
    const nombreEquipes = competition.equipesInscrites.length;
    const matchsTheoriques = nombreEquipes * (nombreEquipes - 1); // Aller + Retour
    console.log(`\n🧮 CALCUL THÉORIQUE:`);
    console.log(`   Nombre d'équipes: ${nombreEquipes}`);
    console.log(`   Matchs théoriques: ${matchsTheoriques} (${nombreEquipes - 1} journées aller × ${Math.floor(nombreEquipes / 2)} matchs/journée × 2)`);
    
    const matchsActuels = competition.poules?.[0]?.matchs?.length || 0;
    console.log(`   Matchs actuels: ${matchsActuels}`);
    
    if (matchsActuels !== matchsTheoriques) {
      console.log(`   ⚠️ PROBLÈME: ${matchsActuels} matchs au lieu de ${matchsTheoriques}`);
    } else {
      console.log(`   ✅ Nombre de matchs correct`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
debugChampionship(); 