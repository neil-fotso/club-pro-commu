require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createTestAdmin = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('👤 CRÉATION D\'UN ADMINISTRATEUR DE TEST\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // Données de l'administrateur
    const adminData = {
      nom: 'Admin',
      prenom: 'Dashboard',
      pseudo: 'AdminDashboard',
      email: 'admin.dashboard@clubprocommu.fr',
      password: 'AdminTest123!',
      isAdmin: true,
      pays: 'France',
      telephoneProfessionnel: '+33 1 23 45 67 89',
      telephonePersonnel: '+33 6 12 34 56 78',
      ville: 'Paris'
    };

    // Vérifier si l'admin existe déjà
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Administrateur déjà existant !');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Pseudo: ${existingAdmin.pseudo}`);
      console.log(`🔐 Password: AdminTest123!`);
      console.log(`🛡️  isAdmin: ${existingAdmin.isAdmin}`);
      
      // Mettre à jour le mot de passe sans hacher manuellement
      existingAdmin.password = 'AdminTest123!';
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      
      console.log('\n✅ Mot de passe et droits admin mis à jour !');
      return;
    }

    // Créer l'administrateur sans hacher manuellement (le pre('save') de User s'en charge)
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !');
    console.log('┌─────────────────────────────────────────────────────────────────────────┐');
    console.log('│                          🛡️  ACCÈS ADMINISTRATEUR                        │');
    console.log('├─────────────────────────────────────────────────────────────────────────┤');
    console.log(`│ 📧 Email:      ${adminData.email.padEnd(40)} │`);
    console.log(`│ 🔐 Password:   AdminTest123!${' '.repeat(28)} │`);
    console.log(`│ 👤 Pseudo:     ${adminData.pseudo.padEnd(40)} │`);
    console.log(`│ 🛡️  Admin:      Oui${' '.repeat(37)} │`);
    console.log('└─────────────────────────────────────────────────────────────────────────┘');

    console.log('\n🚀 COMMENT TESTER LE DASHBOARD:');
    console.log('   1. 🌐 Ouvrez http://localhost:3000 (ou le port du frontend)');
    console.log('   2. 🔑 Connectez-vous avec les identifiants ci-dessus');
    console.log('   3. 👆 Cliquez sur votre avatar en haut à droite');
    console.log('   4. 📊 Sélectionnez "Dashboard Admin" dans le menu');
    console.log('   5. 🎮 Explorez les 3 onglets du dashboard !');

    console.log('\n📊 FONCTIONNALITÉS DU DASHBOARD:');
    console.log('   • 📈 Vue d\'ensemble : Statistiques générales');
    console.log('   • 🏆 Compétitions : Gestion et actions admin');
    console.log('   • ⚖️  Litiges : Surveillance des conflits');
    console.log('   • 🔄 Actualisation : Données temps réel');

    console.log('\n🎯 ACTIONS DISPONIBLES:');
    console.log('   • ⏸️  Suspendre une compétition');
    console.log('   • 🏁 Forcer la fin d\'une compétition');
    console.log('   • 🗑️  Supprimer une compétition');
    console.log('   • 🔍 Examiner les litiges');

    console.log('\n💡 TEST SUGGÉRÉ:');
    console.log('   1. Vérifiez les statistiques générales');
    console.log('   2. Examinez la liste des compétitions');
    console.log('   3. Testez une action admin (suspendre/terminer)');
    console.log('   4. Consultez les litiges s\'il y en a');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    if (error.code === 11000) {
      console.log('💡 L\'email existe déjà. Utilisez les identifiants existants.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB\n');
  }
};

if (require.main === module) {
  createTestAdmin();
}

module.exports = createTestAdmin; 