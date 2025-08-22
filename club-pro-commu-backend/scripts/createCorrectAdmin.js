require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createCorrectAdmin = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('👤 CRÉATION D\'UN ADMINISTRATEUR CORRECT\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const adminEmail = 'admin.work@clubprocommu.fr';
    const adminPassword = 'AdminWork123!';

    // Supprimer les anciens admins de test
    await User.deleteMany({ 
      email: { 
        $in: [
          adminEmail, 
          'admin.test@clubprocommu.fr', 
          'admin.dashboard@clubprocommu.fr'
        ] 
      } 
    });

    console.log('🗑️  Anciens admins de test supprimés');

    // IMPORTANT: Laisser le password en clair !
    // Le middleware pre('save') va automatiquement le hasher
    const adminData = {
      nom: 'Admin',
      prenom: 'Working',
      pseudo: 'AdminWorking',
      email: adminEmail,
      password: adminPassword, // ⚠️ EN CLAIR ! Le middleware va le hasher
      isAdmin: true,
      pays: 'France',
      ville: 'Paris',
      telephoneProfessionnel: '+33123456789',
      telephonePersonnel: '+33612345678'
    };

    console.log('💡 STRATÉGIE: Laisser le middleware pre(\'save\') hasher automatiquement');
    console.log(`   🔤 Password en clair: ${adminPassword}`);

    // Créer et sauvegarder (le middleware va hasher automatiquement)
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !');

    // Vérifier immédiatement avec la méthode du modèle
    const savedAdmin = await User.findOne({ email: adminEmail });
    const testWithMethod = await savedAdmin.comparePassword(adminPassword);
    const testWithBcrypt = await bcrypt.compare(adminPassword, savedAdmin.password);
    
    console.log('\n🔍 VÉRIFICATIONS:');
    console.log(`   📧 Email: ${savedAdmin.email}`);
    console.log(`   👤 Pseudo: ${savedAdmin.pseudo}`);
    console.log(`   🛡️  isAdmin: ${savedAdmin.isAdmin}`);
    console.log(`   🔐 Hash: ${savedAdmin.password.substring(0, 30)}...`);
    console.log(`   ✅ Test avec .comparePassword(): ${testWithMethod ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`   ✅ Test avec bcrypt direct: ${testWithBcrypt ? 'SUCCÈS' : 'ÉCHEC'}`);

    if (testWithMethod && testWithBcrypt) {
      console.log('\n🎉 ADMINISTRATEUR FONCTIONNEL !');
      console.log('┌─────────────────────────────────────────────────────────────────────────┐');
      console.log('│                          🛡️  ACCÈS ADMINISTRATEUR                        │');
      console.log('├─────────────────────────────────────────────────────────────────────────┤');
      console.log(`│ 📧 Email:      ${adminEmail.padEnd(40)} │`);
      console.log(`│ 🔐 Password:   ${adminPassword.padEnd(40)} │`);
      console.log(`│ 👤 Pseudo:     ${savedAdmin.pseudo.padEnd(40)} │`);
      console.log(`│ 🛡️  Admin:      Oui${' '.repeat(37)} │`);
      console.log('└─────────────────────────────────────────────────────────────────────────┘');

      console.log('\n🚀 TEST MAINTENANT:');
      console.log('   1. 🌐 Allez sur http://localhost:3002');
      console.log('   2. 🔑 Connectez-vous avec les identifiants ci-dessus');
      console.log('   3. 👆 Menu utilisateur → "Dashboard Admin"');
      console.log('   4. 🎮 Explorez le dashboard !');

      console.log('\n💡 EXPLICATION DU PROBLÈME:');
      console.log('   • Le modèle User a un middleware pre(\'save\')');
      console.log('   • Il hash automatiquement le password à chaque sauvegarde');
      console.log('   • Nos scripts précédents double-hashaient le password');
      console.log('   • Maintenant on laisse le middleware faire son travail !');

    } else {
      console.log('\n❌ PROBLÈME PERSISTANT !');
      console.log('   • Vérifiez la route de connexion backend');
      console.log('   • Vérifiez que le frontend pointe sur le bon port');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    if (error.code === 11000) {
      console.log('💡 Erreur de duplication, supprimez et relancez');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  createCorrectAdmin();
}

module.exports = createCorrectAdmin; 