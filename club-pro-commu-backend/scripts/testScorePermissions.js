require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');
const Competition = require('../models/Competition');

const testScorePermissions = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🧪 TEST DES PERMISSIONS DE SAISIE DE SCORE\n');
    console.log('═══════════════════════════════════════════════\n');
    
    // 1. Vérifier qu'il y a des compétitions
    const competitions = await Competition.find().populate('createurId', 'pseudo email').limit(3);
    console.log(`📊 Compétitions trouvées: ${competitions.length}`);
    
    if (competitions.length === 0) {
      console.log('❌ Aucune compétition trouvée pour tester les permissions');
      return;
    }
    
    // 2. Afficher les compétitions avec leurs créateurs
    console.log('\n🏆 COMPÉTITIONS DISPONIBLES:');
    for (const comp of competitions) {
      console.log(`\n   📍 ${comp.nom}:`);
      console.log(`      👑 Créateur: ${comp.createurId?.pseudo || 'N/A'} (${comp.createurId?.email || 'N/A'})`);
      console.log(`      📅 Statut: ${comp.statut}`);
      console.log(`      🎮 Plateforme: ${comp.plateforme}`);
      console.log(`      👥 Équipes inscrites: ${comp.equipesInscrites?.length || 0}`);
    }
    
    // 3. Vérifier les types d'utilisateurs
    console.log('\n\n👥 TYPES D\'UTILISATEURS ET PERMISSIONS:');
    
    // Admin du site
    const adminUser = await User.findOne({ isAdmin: true });
    if (adminUser) {
      console.log(`\n   👑 ADMIN DU SITE: ${adminUser.pseudo}`);
      console.log(`      📧 Email: ${adminUser.email}`);
      console.log(`      ✅ Peut modifier TOUS les scores de matchs`);
    } else {
      console.log('\n   ❌ Aucun admin du site trouvé');
    }
    
    // Créateurs de compétitions
    console.log('\n   🎯 CRÉATEURS DE COMPÉTITIONS:');
    for (const comp of competitions) {
      if (comp.createurId) {
        console.log(`      📍 ${comp.createurId.pseudo} - Peut modifier les scores de "${comp.nom}"`);
      }
    }
    
    // Admins de clubs
    console.log('\n   🏆 ADMINS DE CLUBS:');
    const clubs = await Club.find()
      .populate('membres.userId', 'pseudo email')
      .limit(5);
    
    for (const club of clubs) {
      const admins = club.membres.filter(m => m.role === 'Admin');
      if (admins.length > 0) {
        console.log(`\n      📍 Club "${club.nom}":`);
        for (const admin of admins) {
          console.log(`         👑 Admin: ${admin.userId?.pseudo || 'N/A'}`);
          console.log(`            ✅ Peut modifier les scores des matchs de ce club`);
        }
      }
    }
    
    // 4. Simuler des vérifications de permissions
    console.log('\n\n🔐 SIMULATION DE VÉRIFICATIONS DE PERMISSIONS:');
    
    if (competitions.length > 0 && clubs.length > 0) {
      const comp = competitions[0];
      const club1 = clubs[0];
      const club2 = clubs[1] || clubs[0];
      
      console.log(`\n   🎮 Scénario: Match entre "${club1.nom}" vs "${club2.nom}" dans "${comp.nom}"`);
      
      // Simuler un match
      const mockMatch = {
        equipe1: club1._id,
        equipe2: club2._id,
        score1: null,
        score2: null,
        statut: 'Programmé'
      };
      
      console.log('\n   👥 Utilisateurs autorisés à modifier ce score:');
      
      // 1. Admin du site
      if (adminUser) {
        console.log(`      ✅ ${adminUser.pseudo} (Admin du site)`);
      }
      
      // 2. Créateur de la compétition
      if (comp.createurId) {
        console.log(`      ✅ ${comp.createurId.pseudo} (Créateur de la compétition)`);
      }
      
      // 3. Admins des clubs du match
      const club1Admins = club1.membres.filter(m => m.role === 'Admin');
      const club2Admins = club2.membres.filter(m => m.role === 'Admin');
      
      for (const admin of club1Admins) {
        if (admin.userId) {
          console.log(`      ✅ ${admin.userId.pseudo} (Admin de ${club1.nom})`);
        }
      }
      
      if (club2._id.toString() !== club1._id.toString()) {
        for (const admin of club2Admins) {
          if (admin.userId) {
            console.log(`      ✅ ${admin.userId.pseudo} (Admin de ${club2.nom})`);
          }
        }
      }
      
      // 4. Utilisateurs NON autorisés
      console.log('\n   ❌ Utilisateurs NON autorisés:');
      const randomUsers = await User.find({ isAdmin: false }).limit(3);
      for (const user of randomUsers) {
        const isClubAdmin = [...club1Admins, ...club2Admins].some(
          admin => admin.userId && admin.userId._id.toString() === user._id.toString()
        );
        const isCompCreator = comp.createurId && comp.createurId._id.toString() === user._id.toString();
        
        if (!isClubAdmin && !isCompCreator) {
          console.log(`      ❌ ${user.pseudo} (Joueur lambda)`);
        }
      }
    }
    
    // 5. Recommandations de sécurité
    console.log('\n\n🔒 RECOMMANDATIONS DE SÉCURITÉ:');
    console.log('   1. ✅ Frontend: Masquer les boutons selon les permissions');
    console.log('   2. ✅ Backend: Vérifier les permissions avant toute modification');
    console.log('   3. ✅ Logs: Enregistrer toutes les modifications de scores');
    console.log('   4. ✅ Validation: Vérifier la cohérence des données');
    
    console.log('\n🎉 Test des permissions terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testScorePermissions();
}

module.exports = testScorePermissions; 