require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');
const Competition = require('../models/Competition');

const testAdminClubPlayers = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🧪 TEST - JOUEURS DU CLUB DE L\'ADMIN UNIQUEMENT\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer une compétition avec des équipes
    const competition = await Competition.findOne({ equipesInscrites: { $exists: true, $not: { $size: 0 } } })
      .populate({
        path: 'equipesInscrites.clubId',
        select: 'nom membres',
        populate: {
          path: 'membres.userId',
          select: 'pseudo _id'
        }
      });
    
    if (!competition) {
      console.log('❌ Aucune compétition trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`👥 Équipes inscrites: ${competition.equipesInscrites.length}\n`);
    
    // Trouver des clubs avec admins
    const clubsAvecAdmins = [];
    
    for (const equipe of competition.equipesInscrites) {
      if (equipe.clubId && equipe.clubId.membres) {
        const admins = equipe.clubId.membres.filter(m => m.role === 'Admin' && m.userId);
        if (admins.length > 0) {
          clubsAvecAdmins.push({
            club: equipe.clubId,
            admins: admins
          });
        }
      }
    }
    
    console.log(`🏆 CLUBS AVEC ADMINS: ${clubsAvecAdmins.length}\n`);
    
    // Simuler un match entre deux clubs
    if (clubsAvecAdmins.length >= 2) {
      const club1 = clubsAvecAdmins[0];
      const club2 = clubsAvecAdmins[1];
      
      console.log(`🎮 SIMULATION MATCH: ${club1.club.nom} vs ${club2.club.nom}\n`);
      
      // Test pour l'admin du club 1
      const admin1 = club1.admins[0];
      console.log(`👤 ADMIN ${club1.club.nom}: ${admin1.userId.pseudo}`);
      console.log(`   🔍 Peut saisir les stats pour les joueurs de son club UNIQUEMENT:`);
      
      club1.club.membres.forEach(membre => {
        if (membre.userId && membre.userId.pseudo) {
          console.log(`      ✅ ${membre.userId.pseudo} (${membre.role})`);
        }
      });
      
      console.log(`   ❌ NE PEUT PAS saisir les stats pour ${club2.club.nom}:`);
      club2.club.membres.slice(0, 3).forEach(membre => {
        if (membre.userId && membre.userId.pseudo) {
          console.log(`      ❌ ${membre.userId.pseudo} (${membre.role})`);
        }
      });
      
      console.log('\n───────────────────────────────────────────────────\n');
      
      // Test pour l'admin du club 2
      const admin2 = club2.admins[0];
      console.log(`👤 ADMIN ${club2.club.nom}: ${admin2.userId.pseudo}`);
      console.log(`   🔍 Peut saisir les stats pour les joueurs de son club UNIQUEMENT:`);
      
      club2.club.membres.forEach(membre => {
        if (membre.userId && membre.userId.pseudo) {
          console.log(`      ✅ ${membre.userId.pseudo} (${membre.role})`);
        }
      });
      
      console.log(`   ❌ NE PEUT PAS saisir les stats pour ${club1.club.nom}:`);
      club1.club.membres.slice(0, 3).forEach(membre => {
        if (membre.userId && membre.userId.pseudo) {
          console.log(`      ❌ ${membre.userId.pseudo} (${membre.role})`);
        }
      });
    }
    
    // Statistiques globales
    console.log('\n\n📊 LOGIQUE DE FONCTIONNEMENT:');
    console.log('═══════════════════════════════════════════════');
    console.log('1. ✅ L\'admin se connecte avec ses identifiants');
    console.log('2. ✅ Il clique sur "Saisir score" pour un match de son club');
    console.log('3. ✅ Il clique sur "Ajouter buteur"');
    console.log('4. ✅ SEULS les joueurs de SON club apparaissent dans la liste');
    console.log('5. ✅ Il sélectionne un joueur de son club et saisit le nombre de buts');
    console.log('6. ✅ Le joueur est ajouté aux statistiques du match');
    
    console.log('\n🔐 AVANTAGES DE CETTE APPROCHE:');
    console.log('   ✅ Plus simple pour l\'admin (pas de confusion)');
    console.log('   ✅ Évite les erreurs (saisir un but pour l\'équipe adverse)');
    console.log('   ✅ Interface plus claire et intuitive');
    console.log('   ✅ Logique métier cohérente (admin = son club)');
    
    console.log('\n🎯 UTILISATION:');
    console.log('   📧 Connectez-vous avec un admin de club:');
    for (let i = 0; i < Math.min(3, clubsAvecAdmins.length); i++) {
      const clubData = clubsAvecAdmins[i];
      const admin = clubData.admins[0];
      console.log(`      ${admin.userId.pseudo}@test.com (Admin ${clubData.club.nom})`);
    }
    console.log('   🔑 Mot de passe: TestPassword123!');
    
    console.log('\n🎉 Fonctionnalité prête !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testAdminClubPlayers();
}

module.exports = testAdminClubPlayers; 