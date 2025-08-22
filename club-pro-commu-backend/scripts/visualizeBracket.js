require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const visualizeBracket = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🏆 VISUALISATION DU BRACKET D\'ÉLIMINATION DIRECTE\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Récupérer la compétition avec population des clubs
    const competition = await Competition.findById('68a591b5eb0106ae145fed19')
      .populate('equipesInscrites.clubId', 'nom')
      .populate('gagnant', 'nom')
      .populate('finaliste', 'nom')
      .populate('troisieme', 'nom');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`📊 Type: ${competition.type}`);
    console.log(`👥 Équipes inscrites: ${competition.equipesInscrites.length}`);
    console.log(`🏟️ Matchs d'élimination: ${competition.matchsElimination.length}\n`);
    
    // Organiser les matchs par phase
    const matchsByPhase = {};
    const phases = ['Huitième', 'Quart', 'Demi', 'Petite finale', 'Finale'];
    
    phases.forEach(phase => {
      matchsByPhase[phase] = competition.matchsElimination.filter(match => 
        match.phase === phase
      );
    });
    
    // Function helper pour obtenir le nom du club
    const getClubName = async (clubId) => {
      if (!clubId) return 'TBD';
      const club = await Club.findById(clubId);
      return club ? club.nom : `Club-${clubId.toString().slice(-4)}`;
    };
    
    // Affichage du bracket
    console.log('🎮 BRACKET ACTUEL:\n');
    console.log('┌─────────────────────────────────────────────────────────────────────────┐');
    console.log('│                         BRACKET D\'ÉLIMINATION DIRECTE                  │');
    console.log('└─────────────────────────────────────────────────────────────────────────┘\n');
    
    for (const phase of phases) {
      const matches = matchsByPhase[phase];
      if (matches.length === 0) continue;
      
      const phaseIcons = {
        'Huitième': '🎯',
        'Quart': '⚡',
        'Demi': '🔥',
        'Petite finale': '🥉',
        'Finale': '🏆'
      };
      
      console.log(`${phaseIcons[phase]} ${phase.toUpperCase()}${' '.repeat(20 - phase.length)}┃`);
      console.log('━'.repeat(40) + '┃');
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        
        // Récupérer les noms des clubs
        const club1 = await getClubName(match.equipe1);
        const club2 = await getClubName(match.equipe2);
        
        const date = match.dateMatch ? 
          new Date(match.dateMatch).toLocaleDateString('fr-FR') : 
          'À programmer';
        
        const statut = match.statut;
        const statusIcon = {
          'Programmé': '📅',
          'En cours': '⚽',
          'Terminé': '✅',
          'Annulé': '❌'
        }[statut] || '❓';
        
        console.log(`┃ Match ${i + 1}:                             ┃`);
        console.log(`┃ ${club1.padEnd(18)} VS ${club2.padEnd(18)}┃`);
        
        if (match.statut === 'Terminé') {
          const score1 = match.score1 || 0;
          const score2 = match.score2 || 0;
          const winner = score1 > score2 ? club1 : club2;
          const winnerIcon = score1 > score2 ? '🏆' : '🏆';
          
          console.log(`┃ Score: ${score1} - ${score2}                        ┃`);
          console.log(`┃ Gagnant: ${winner.padEnd(20)} ${winnerIcon}     ┃`);
          
          // Flèche de progression (sauf pour finale et petite finale)
          if (phase !== 'Finale' && phase !== 'Petite finale') {
            console.log(`┃ ${' '.repeat(35)} ➤ ┃`);
          }
        } else {
          console.log(`┃ ${statusIcon} ${statut} - ${date}           ┃`);
        }
        
        console.log(`┃${' '.repeat(39)}┃`);
        
        if (i < matches.length - 1) {
          console.log('┃' + '─'.repeat(39) + '┃');
        }
      }
      
      console.log('┗'.repeat(40) + '┛\n');
    }
    
    // Affichage du podium final
    if (competition.gagnant || competition.finaliste || competition.troisieme) {
      console.log('🏆 PODIUM FINAL:\n');
      console.log('┌─────────────────────────────────────────┐');
      console.log('│              🏆 CHAMPIONS 🏆            │');
      console.log('├─────────────────────────────────────────┤');
      
      if (competition.gagnant) {
        console.log(`│ 🥇 CHAMPION: ${competition.gagnant.nom.padEnd(23)} │`);
      }
      if (competition.finaliste) {
        console.log(`│ 🥈 FINALISTE: ${competition.finaliste.nom.padEnd(22)} │`);
      }
      if (competition.troisieme) {
        console.log(`│ 🥉 3ÈME PLACE: ${competition.troisieme.nom.padEnd(21)} │`);
      }
      
      console.log('└─────────────────────────────────────────┘\n');
    }
    
    // Statistiques de progression
    const terminedCount = competition.matchsElimination.filter(m => m.statut === 'Terminé').length;
    const totalCount = competition.matchsElimination.length;
    const progressPercent = totalCount > 0 ? Math.round((terminedCount / totalCount) * 100) : 0;
    
    console.log('📊 PROGRESSION:');
    console.log(`   ✅ Matchs terminés: ${terminedCount}/${totalCount} (${progressPercent}%)`);
    console.log(`   🎮 Matchs en attente: ${totalCount - terminedCount}`);
    
    if (competition.statut === 'Terminé') {
      console.log('   🏆 Compétition TERMINÉE !');
    } else {
      console.log('   ⚡ Compétition EN COURS');
    }
    
    console.log('\n🚀 POUR VOIR LE NOUVEAU DESIGN:');
    console.log('   1. Assurez-vous que le frontend est démarré sur http://localhost:3002');
    console.log('   2. Ouvrez la compétition "coupe top"');
    console.log('   3. Cliquez sur "Calendrier"');
    console.log('   4. Admirez le nouveau bracket visuel ! 🎨✨');
    
    console.log('\n💡 NOUVEAU DESIGN INCLUT:');
    console.log('   • 🎨 Cartes visuelles pour chaque match');
    console.log('   • 🏆 Mise en valeur des équipes gagnantes');
    console.log('   • ⚡ Couleurs distinctives par phase');
    console.log('   • 📱 Design responsive');
    console.log('   • 🎯 Lignes de progression entre phases');
    console.log('   • 🏅 Podium final des champions');
    
  } catch (error) {
    console.error('❌ Erreur lors de la visualisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  visualizeBracket();
}

module.exports = visualizeBracket; 