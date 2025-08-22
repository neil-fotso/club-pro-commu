require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const generateEliminationFromGroups = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🏆 GÉNÉRATION ÉLIMINATION DIRECTE DEPUIS GROUPES\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Récupérer la compétition Champions League Simulator
    const competition = await Competition.findOne({ nom: 'Champions League Simulator' })
      .populate('equipesInscrites.clubId', 'nom');
    
    if (!competition) {
      console.log('❌ Compétition "Champions League Simulator" non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`👥 Équipes: ${competition.equipesInscrites.length}`);
    
    // Récupérer les équipes qualifiées (statut 'Confirmé')
    const equipesQualifiees = competition.equipesInscrites.filter(e => e.statut === 'Confirmé');
    
    console.log(`\n🟢 ÉQUIPES QUALIFIÉES: ${equipesQualifiees.length}`);
    equipesQualifiees.forEach((equipe, index) => {
      console.log(`   ${index + 1}. ${equipe.clubId.nom} (${equipe.points} pts, ${equipe.differenceButs >= 0 ? '+' : ''}${equipe.differenceButs})`);
    });
    
    if (equipesQualifiees.length < 2) {
      console.log('❌ Pas assez d\'équipes qualifiées pour l\'élimination directe');
      return;
    }
    
    // Déterminer la phase de départ selon le nombre d'équipes
    let phaseDepart = '';
    let nombreMatchs = 0;
    
    if (equipesQualifiees.length === 4) {
      phaseDepart = 'Demi';
      nombreMatchs = 2;
    } else if (equipesQualifiees.length === 8) {
      phaseDepart = 'Quart';
      nombreMatchs = 4;
    } else if (equipesQualifiees.length === 16) {
      phaseDepart = 'Huitième';
      nombreMatchs = 8;
    } else {
      console.log(`⚠️ Nombre d'équipes non standard: ${equipesQualifiees.length}. Utilisation de "Quart" par défaut.`);
      phaseDepart = 'Quart';
      nombreMatchs = Math.floor(equipesQualifiees.length / 2);
    }
    
    console.log(`\n🎯 PHASE DE DÉPART: ${phaseDepart} (${nombreMatchs} matchs)`);
    console.log('🔀 TIRAGE AU SORT DES MATCHS...');
    
    // Mélanger aléatoirement les équipes qualifiées
    const equipesPourtTirage = [...equipesQualifiees];
    for (let i = equipesPourtTirage.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [equipesPourtTirage[i], equipesPourtTirage[j]] = [equipesPourtTirage[j], equipesPourtTirage[i]];
    }
    
    // Générer les matchs d'élimination
    console.log('\n⚽ GÉNÉRATION DES MATCHS:');
    console.log('━'.repeat(50));
    
    const matchsElimination = [];
    
    for (let i = 0; i < nombreMatchs; i++) {
      const equipe1 = equipesPourtTirage[i * 2];
      const equipe2 = equipesPourtTirage[i * 2 + 1];
      
      if (!equipe1 || !equipe2) {
        console.log(`⚠️ Pas assez d'équipes pour le match ${i + 1}`);
        continue;
      }
      
      const match = {
        equipe1: equipe1.clubId._id,
        equipe2: equipe2.clubId._id,
        score1: null,
        score2: null,
        dateMatch: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Un match par jour
        statut: 'Programmé',
        phase: phaseDepart,
        tour: 1,
        valideParEquipe1: false,
        valideParEquipe2: false,
        captureEcran: null,
        stats: {
          buteurs: [],
          passeurs: [],
          cartonsJaunes: [],
          cartonsRouges: []
        },
        litige: false,
        arbitre: null
      };
      
      matchsElimination.push(match);
      console.log(`   Match ${i + 1}: ${equipe1.clubId.nom} vs ${equipe2.clubId.nom}`);
    }
    
    // Ajouter les matchs à la compétition
    competition.matchsElimination = matchsElimination;
    
    // Sauvegarder
    await competition.save();
    
    console.log('\n✅ ÉLIMINATION DIRECTE GÉNÉRÉE !');
    console.log('\n📊 RÉSUMÉ:');
    console.log(`   🏟️ Phase de départ: ${phaseDepart}`);
    console.log(`   ⚽ Matchs générés: ${matchsElimination.length}`);
    console.log(`   👥 Équipes participantes: ${equipesQualifiees.length}`);
    
    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('   1. Simuler les matchs d\'élimination directe');
    console.log('   2. Tester la progression automatique');
    console.log('   3. Vérifier l\'affichage frontend complet');
    
    console.log('\n🚀 POUR VOIR LA COMPÉTITION:');
    console.log('   1. Allez sur http://localhost:3002');
    console.log('   2. Ouvrez "Champions League Simulator"');
    console.log('   3. Onglet "Groupes" → Voir les classements finaux');
    console.log('   4. Onglet "Calendrier" → Voir les matchs d\'élimination');
    
    console.log('\n🎮 STRUCTURE FINALE:');
    console.log(`   📊 Phases de groupes: ✅ Terminées (12 matchs)`);
    console.log(`   🏆 Élimination directe: 🆕 Générée (${matchsElimination.length} matchs)`);
    console.log(`   👑 Champions: 🔜 À déterminer`);
    
    return competition._id;
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  generateEliminationFromGroups();
}

module.exports = generateEliminationFromGroups; 