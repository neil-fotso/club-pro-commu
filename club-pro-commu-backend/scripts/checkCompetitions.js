require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');

const checkCompetitions = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🔍 VÉRIFICATION DES COMPÉTITIONS\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer toutes les compétitions
    const competitions = await Competition.find({}).populate('createurId', 'pseudo');
    
    console.log(`📊 TOTAL COMPÉTITIONS: ${competitions.length}\n`);
    
    if (competitions.length === 0) {
      console.log('❌ Aucune compétition trouvée');
      console.log('💡 Utilisez le frontend pour créer une compétition');
      return;
    }
    
    competitions.forEach((comp, index) => {
      console.log(`🏆 COMPÉTITION ${index + 1}:`);
      console.log(`   📝 Nom: ${comp.nom}`);
      console.log(`   👤 Créateur: ${comp.createurId?.pseudo || 'Inconnu'}`);
      console.log(`   📅 Créée le: ${comp.dateCreation.toLocaleDateString()}`);
      console.log(`   📊 Statut: ${comp.statut}`);
      console.log(`   🎮 Type: ${comp.type}`);
      console.log(`   👥 Équipes inscrites: ${comp.equipesInscrites?.length || 0}`);
      console.log(`   🏟️ Matchs: ${comp.matchs?.length || 0}`);
      
      if (comp.matchs && comp.matchs.length > 0) {
        console.log(`   📋 Détail des matchs:`);
        comp.matchs.forEach((match, i) => {
          console.log(`      ${i + 1}. ${match.equipe1} vs ${match.equipe2} - ${match.statut}`);
          if (match.statut === 'Terminé') {
            console.log(`         Score: ${match.score1}-${match.score2}`);
            if (match.buteurs?.length > 0) {
              console.log(`         Buteurs: ${JSON.stringify(match.buteurs)}`);
            }
            if (match.passeurs?.length > 0) {
              console.log(`         Passeurs: ${JSON.stringify(match.passeurs)}`);
            }
          }
        });
      }
      
      console.log(`   📈 Statistiques:`);
      if (comp.statistiques && Object.keys(comp.statistiques).length > 0) {
        console.log(`      🥅 Meilleur buteur: ${comp.statistiques.meilleurButeur?.joueur || 'Aucun'}`);
        console.log(`      🎯 Meilleur passeur: ${comp.statistiques.meilleurPasseur?.joueur || 'Aucun'}`);
        console.log(`      🏆 Meilleur joueur: ${comp.statistiques.meilleurJoueur?.joueur || 'Aucun'}`);
      } else {
        console.log(`      ❌ Aucune statistique`);
      }
      
      console.log('   ───────────────────────────────────────────────────\n');
    });
    
    // Recommandations
    const compAvecMatchs = competitions.filter(c => c.matchs && c.matchs.length > 0);
    const compAvecStats = competitions.filter(c => 
      c.matchs && c.matchs.some(m => m.statut === 'Terminé' && (m.buteurs?.length > 0 || m.passeurs?.length > 0))
    );
    
    console.log('📋 RECOMMANDATIONS:');
    if (compAvecMatchs.length === 0) {
      console.log('   1. ✅ Créez des matchs pour vos compétitions');
      console.log('   2. 💡 Allez sur la page de compétition → Calendrier → Générer matchs');
    } else if (compAvecStats.length === 0) {
      console.log('   1. ✅ Ajoutez des scores et statistiques aux matchs');
      console.log('   2. 💡 Allez sur Calendrier → Saisir score → Ajoutez buteurs/passeurs');
    } else {
      console.log('   1. ✅ Testez les statistiques dans l\'onglet "Statistiques"');
      console.log('   2. 🔄 Les nouvelles modifications devraient s\'afficher automatiquement');
    }
    
    console.log('\n🎯 COMPÉTITIONS INTÉRESSANTES POUR LE TEST:');
    const bonnesComp = competitions.filter(c => c.equipesInscrites?.length >= 2);
    if (bonnesComp.length > 0) {
      bonnesComp.forEach(comp => {
        console.log(`   🏆 "${comp.nom}" - ${comp.equipesInscrites.length} équipes`);
      });
    } else {
      console.log('   ❌ Aucune compétition avec assez d\'équipes inscrites');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  checkCompetitions();
}

module.exports = checkCompetitions; 