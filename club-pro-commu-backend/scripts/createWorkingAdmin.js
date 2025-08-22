require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createWorkingAdmin = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('👤 CRÉATION D\'UN ADMINISTRATEUR FONCTIONNEL\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const adminEmail = 'admin.test@clubprocommu.fr';
    const adminPassword = 'TestPassword123!';

    // Supprimer l'ancien admin s'il existe
    await User.deleteOne({ email: adminEmail });
    await User.deleteOne({ email: 'admin.dashboard@clubprocommu.fr' });

    console.log('🗑️  Anciens admins supprimés');

    // Créer le hash CORRECTEMENT
    console.log('🔐 Création du hash de mot de passe...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    console.log(`   🧂 Salt rounds: ${saltRounds}`);
    console.log(`   🔐 Hash créé: ${hashedPassword.substring(0, 30)}...`);

    // Tester immédiatement le hash
    const testMatch = await bcrypt.compare(adminPassword, hashedPassword);
    console.log(`   ✅ Test immédiat: ${testMatch ? 'SUCCÈS' : 'ÉCHEC'}`);

    if (!testMatch) {
      throw new Error('Le hash ne fonctionne pas immédiatement !');
    }

    // Créer l'admin avec toutes les données requises
    const adminData = {
      nom: 'Admin',
      prenom: 'Test',
      pseudo: 'AdminTest',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      pays: 'France',
      ville: 'Paris',
      telephoneProfessionnel: '+33123456789',
      telephonePersonnel: '+33612345678'
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !');

    // Vérifier immédiatement en relisant de la DB
    const savedAdmin = await User.findOne({ email: adminEmail });
    const finalTest = await bcrypt.compare(adminPassword, savedAdmin.password);
    
    console.log('\n🔍 VÉRIFICATION POST-SAUVEGARDE:');
    console.log(`   📧 Email: ${savedAdmin.email}`);
    console.log(`   👤 Pseudo: ${savedAdmin.pseudo}`);
    console.log(`   🛡️  isAdmin: ${savedAdmin.isAdmin}`);
    console.log(`   🔐 Test password: ${finalTest ? 'SUCCÈS' : 'ÉCHEC'}`);

    if (finalTest) {
      console.log('\n🎉 IDENTIFIANTS VALIDÉS:');
      console.log('┌─────────────────────────────────────────────────────────────────────────┐');
      console.log('│                          🛡️  ACCÈS ADMINISTRATEUR                        │');
      console.log('├─────────────────────────────────────────────────────────────────────────┤');
      console.log(`│ 📧 Email:      ${adminEmail.padEnd(40)} │`);
      console.log(`│ 🔐 Password:   ${adminPassword.padEnd(40)} │`);
      console.log(`│ 👤 Pseudo:     ${savedAdmin.pseudo.padEnd(40)} │`);
      console.log(`│ 🛡️  Admin:      Oui${' '.repeat(37)} │`);
      console.log('└─────────────────────────────────────────────────────────────────────────┘');

      console.log('\n🚀 CONNEXION:');
      console.log('   1. 🌐 Allez sur http://localhost:3002');
      console.log('   2. 🔑 Connectez-vous avec les identifiants ci-dessus');
      console.log('   3. 👆 Menu utilisateur → "Dashboard Admin"');
      console.log('   4. 🎮 Testez le dashboard !');
    } else {
      console.log('\n❌ PROBLÈME PERSISTANT avec le mot de passe !');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  createWorkingAdmin();
}

module.exports = createWorkingAdmin; 