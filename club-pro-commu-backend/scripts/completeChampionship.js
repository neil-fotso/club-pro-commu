require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const completeChampionship = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🏆 FINALISATION DU CHAMPIONNAT\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Récupérer la compétition
    const competition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    
    // Trouver les matchs finaux
    const petiteFinale = competition.matchsElimination.find(m => m.phase === 'Petite finale');
    const finale = competition.matchsElimination.find(m => m.phase === 'Finale');
    
    console.log('\n🎮 SIMULATION DES MATCHS FINAUX...');
    
    // Simuler la petite finale : Fire Legends vs Digital Warriors
    if (petiteFinale && petiteFinale.statut === 'Programmé') {
      console.log('\n🥉 PETITE FINALE:');
      console.log(`   ${petiteFinale.equipe1} vs ${petiteFinale.equipe2}`);
      
      // Fire Legends gagne 2-1
      petiteFinale.score1 = 2;
      petiteFinale.score2 = 1;
      petiteFinale.statut = 'Terminé';
      petiteFinale.valideParEquipe1 = true;
      petiteFinale.valideParEquipe2 = true;
      
      // Ajouter des stats
      petiteFinale.stats = {
        buteurs: [
          { joueur: 'julesmartin14', buts: 1 },
          { joueur: 'alexisvincent15', buts: 1 },
          { joueur: 'nicolasdurand6', buts: 1 }
        ],
        passeurs: [
          { joueur: 'testpseu', passes: 1 },
          { joueur: 'mathismartin21', passes: 1 }
        ],
        cartonsJaunes: [],
        cartonsRouges: []
      };
      
      const winner = petiteFinale.score1 > petiteFinale.score2 ? petiteFinale.equipe1 : petiteFinale.equipe2;
      competition.troisieme = winner;
      
      console.log(`   ✅ Résultat: ${petiteFinale.score1}-${petiteFinale.score2}`);
      console.log(`   🥉 3ème place: ${winner}`);
      
      // Mettre à jour le statut de l'équipe
      const troisiemeEquipe = competition.equipesInscrites.find(e => 
        e.clubId.toString() === winner.toString());
      if (troisiemeEquipe) troisiemeEquipe.statut = 'Troisième';
    }
    
    // Simuler la finale : Titans Gaming vs Shadow Hunters
    if (finale && finale.statut === 'Programmé') {
      console.log('\n🏆 FINALE:');
      console.log(`   ${finale.equipe1} vs ${finale.equipe2}`);
      
      // Shadow Hunters gagne 3-1
      finale.score1 = 1;
      finale.score2 = 3;
      finale.statut = 'Terminé';
      finale.valideParEquipe1 = true;
      finale.valideParEquipe2 = true;
      
      // Ajouter des stats
      finale.stats = {
        buteurs: [
          { joueur: 'lucasmartin31', buts: 2 },
          { joueur: 'sophieandré47', buts: 1 },
          { joueur: 'tomleblond48', buts: 1 }
        ],
        passeurs: [
          { joueur: 'maximegarcia46', passes: 2 },
          { joueur: 'lucasmartin31', passes: 1 }
        ],
        cartonsJaunes: ['testpseu'],
        cartonsRouges: []
      };
      
      const winner = finale.score1 > finale.score2 ? finale.equipe1 : finale.equipe2;
      const loser = finale.score1 > finale.score2 ? finale.equipe2 : finale.equipe1;
      
      competition.gagnant = winner;
      competition.finaliste = loser;
      competition.statut = 'Terminé';
      
      console.log(`   ✅ Résultat: ${finale.score1}-${finale.score2}`);
      console.log(`   🏆 CHAMPION: ${winner}`);
      console.log(`   🥈 Finaliste: ${loser}`);
      
      // Mettre à jour les statuts des équipes
      const gagnantEquipe = competition.equipesInscrites.find(e => 
        e.clubId.toString() === winner.toString());
      const finalisteEquipe = competition.equipesInscrites.find(e => 
        e.clubId.toString() === loser.toString());
      
      if (gagnantEquipe) gagnantEquipe.statut = 'Gagnant';
      if (finalisteEquipe) finalisteEquipe.statut = 'Finaliste';
    }
    
    // Sauvegarder
    await competition.save();
    
    // Afficher le podium final
    console.log('\n🏆 PODIUM FINAL:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│              🏆 CHAMPIONS 🏆            │');
    console.log('├─────────────────────────────────────────┤');
    
    if (competition.gagnant) {
      const champClub = await Club.findById(competition.gagnant);
      console.log(`│ 🥇 CHAMPION: ${champClub ? champClub.nom : 'Champion'} │`);
    }
    if (competition.finaliste) {
      const finClub = await Club.findById(competition.finaliste);
      console.log(`│ 🥈 FINALISTE: ${finClub ? finClub.nom : 'Finaliste'} │`);
    }
    if (competition.troisieme) {
      const troisClub = await Club.findById(competition.troisieme);
      console.log(`│ 🥉 3ÈME PLACE: ${troisClub ? troisClub.nom : '3ème'} │`);
    }
    
    console.log('└─────────────────────────────────────────┘');
    
    // Statistiques finales
    console.log('\n📊 STATISTIQUES FINALES:');
    console.log(`   🏟️ Total matchs joués: ${competition.matchsElimination.length}`);
    console.log(`   ✅ Matchs terminés: ${competition.matchsElimination.filter(m => m.statut === 'Terminé').length}`);
    console.log(`   🏆 Statut compétition: ${competition.statut}`);
    
    console.log('\n🎉 CHAMPIONNAT TERMINÉ !');
    console.log('\n🚀 VÉRIFICATION:');
    console.log('   1. Allez sur http://localhost:3002');
    console.log('   2. Ouvrez la compétition "coupe top"');
    console.log('   3. Cliquez sur "Calendrier"');
    console.log('   4. Vous devriez voir le podium final des champions !');
    console.log('   5. Le design montrera tous les matchs terminés avec progression complète');
    
  } catch (error) {
    console.error('❌ Erreur lors de la finalisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  completeChampionship();
}

module.exports = completeChampionship; 