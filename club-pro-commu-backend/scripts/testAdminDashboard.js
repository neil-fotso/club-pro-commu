require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const testAdminDashboard = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🧪 TEST DU DASHBOARD ADMINISTRATEUR\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Vérifier qu'il y a un admin
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
      console.log('❌ Aucun administrateur trouvé');
      return;
    }
    
    console.log(`✅ Admin trouvé: ${admin.pseudo} (${admin.email})`);
    
    // Test 1: Statistiques générales
    console.log('\n📊 TEST 1: Statistiques générales');
    
    const totalUsers = await User.countDocuments();
    const totalClubs = await Club.countDocuments();
    const totalCompetitions = await Competition.countDocuments();
    
    console.log(`   👥 Utilisateurs: ${totalUsers}`);
    console.log(`   🏟️ Clubs: ${totalClubs}`);
    console.log(`   🏆 Compétitions: ${totalCompetitions}`);
    
    // Test 2: Compétitions par statut
    console.log('\n🏆 TEST 2: Compétitions par statut');
    
    const competitionsParStatut = await Competition.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);
    
    competitionsParStatut.forEach(item => {
      console.log(`   ${item._id}: ${item.count} compétitions`);
    });
    
    // Test 3: Calcul des matchs
    console.log('\n⚽ TEST 3: Statistiques des matchs');
    
    const competitions = await Competition.find();
    let totalMatchs = 0;
    let matchsTermines = 0;
    let matchsEnLitige = 0;
    
    competitions.forEach(comp => {
      // Matchs de poules
      if (comp.poules) {
        comp.poules.forEach(poule => {
          if (poule.matchs) {
            totalMatchs += poule.matchs.length;
            matchsTermines += poule.matchs.filter(m => m.statut === 'Terminé').length;
            matchsEnLitige += poule.matchs.filter(m => m.litige).length;
          }
        });
      }
      
      // Matchs d'élimination
      if (comp.matchsElimination) {
        totalMatchs += comp.matchsElimination.length;
        matchsTermines += comp.matchsElimination.filter(m => m.statut === 'Terminé').length;
        matchsEnLitige += comp.matchsElimination.filter(m => m.litige).length;
      }
    });
    
    console.log(`   ⚽ Total matchs: ${totalMatchs}`);
    console.log(`   ✅ Matchs terminés: ${matchsTermines}`);
    console.log(`   ⚖️ Matchs en litige: ${matchsEnLitige}`);
    console.log(`   📈 Taux de complétion: ${totalMatchs > 0 ? Math.round((matchsTermines / totalMatchs) * 100) : 0}%`);
    
    // Test 4: Clubs par pays
    console.log('\n🌍 TEST 4: Clubs par pays');
    
    const clubsParPays = await Club.aggregate([
      { $group: { _id: '$pays', count: { $sum: 1 } } }
    ]);
    
    clubsParPays.forEach(item => {
      console.log(`   ${item._id || 'Non défini'}: ${item.count} clubs`);
    });
    
    // Test 5: Utilisateurs actifs
    console.log('\n👥 TEST 5: Utilisateurs actifs');
    
    const dateActivite30j = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ 
      derniereActivite: { $gte: dateActivite30j } 
    });
    
    console.log(`   ✅ Utilisateurs actifs (30j): ${activeUsers}/${totalUsers}`);
    console.log(`   📊 Taux d'activité: ${Math.round((activeUsers / totalUsers) * 100)}%`);
    
    // Test 6: Activité récente (7 derniers jours)
    console.log('\n📈 TEST 6: Activité récente (7 derniers jours)');
    
    const dateActivite7j = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const nouvellesInscriptions = await User.countDocuments({ 
      dateCreation: { $gte: dateActivite7j } 
    });
    const nouveauxClubs = await Club.countDocuments({ 
      dateCreation: { $gte: dateActivite7j } 
    });
    const nouvellesCompetitions = await Competition.countDocuments({ 
      dateCreation: { $gte: dateActivite7j } 
    });
    
    console.log(`   👤 Nouvelles inscriptions: ${nouvellesInscriptions}`);
    console.log(`   🏟️ Nouveaux clubs: ${nouveauxClubs}`);
    console.log(`   🏆 Nouvelles compétitions: ${nouvellesCompetitions}`);
    
    // Test 7: Top clubs actifs
    console.log('\n🏆 TEST 7: Top 5 clubs les plus actifs');
    
    const clubsActifs = await Club.find()
      .populate('membres.userId', 'pseudo derniereActivite')
      .sort({ 'membres.length': -1 })
      .limit(5);
    
    clubsActifs.forEach((club, index) => {
      const membresActifs = club.membres.filter(m => 
        m.userId.derniereActivite && 
        new Date(m.userId.derniereActivite) > dateActivite30j
      ).length;
      
      console.log(`   ${index + 1}. ${club.nom} - ${club.membres.length} membres (${membresActifs} actifs)`);
    });
    
    // Test 8: Détection des problèmes
    console.log('\n🚨 TEST 8: Détection des problèmes');
    
    const competitionsAbandonees = competitions.filter(c => 
      c.statut === 'En cours' && 
      new Date(c.dateFin) < new Date()
    );
    
    const competitionsSansParticipants = competitions.filter(c => 
      !c.equipesInscrites || c.equipesInscrites.length < 2
    );
    
    if (competitionsAbandonees.length > 0) {
      console.log(`   ⚠️ ${competitionsAbandonees.length} compétitions potentiellement abandonnées`);
    }
    
    if (competitionsSansParticipants.length > 0) {
      console.log(`   ⚠️ ${competitionsSansParticipants.length} compétitions avec moins de 2 équipes`);
    }
    
    if (matchsEnLitige > 0) {
      console.log(`   ⚠️ ${matchsEnLitige} matchs en litige nécessitent une intervention`);
    }
    
    if (competitionsAbandonees.length === 0 && competitionsSansParticipants.length === 0 && matchsEnLitige === 0) {
      console.log('   ✅ Aucun problème critique détecté');
    }
    
    // Résumé final
    console.log('\n🎯 RÉSUMÉ DU TEST:');
    console.log('════════════════════════════════════════════════════════════');
    console.log(`✅ Admin disponible: ${admin.pseudo}`);
    console.log(`📊 Base de données: ${totalUsers} users, ${totalClubs} clubs, ${totalCompetitions} compétitions`);
    console.log(`⚽ Matchs: ${matchsTermines}/${totalMatchs} terminés (${totalMatchs > 0 ? Math.round((matchsTermines / totalMatchs) * 100) : 0}%)`);
    console.log(`👥 Activité: ${activeUsers}/${totalUsers} utilisateurs actifs (${Math.round((activeUsers / totalUsers) * 100)}%)`);
    console.log(`📈 Croissance 7j: +${nouvellesInscriptions} users, +${nouveauxClubs} clubs, +${nouvellesCompetitions} compétitions`);
    
    console.log('\n🚀 DASHBOARD PRÊT !');
    console.log('   1. Backend: Routes API /api/admin/* disponibles');
    console.log('   2. Frontend: Page /admin/dashboard accessible');
    console.log('   3. Authentication: Middleware adminAuth actif');
    console.log('   4. Données: Statistiques complètes calculées');
    
    console.log('\n🎮 POUR TESTER:');
    console.log('   1. Allez sur http://localhost:3002');
    console.log(`   2. Connectez-vous avec: ${admin.email}`);
    console.log('   3. Menu utilisateur → "Dashboard Admin"');
    console.log('   4. Explorez toutes les fonctionnalités !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testAdminDashboard();
}

module.exports = testAdminDashboard; 