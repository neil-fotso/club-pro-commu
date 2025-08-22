require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const debugLogin = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    console.log('✅ Connexion établie');

    // Test avec le premier utilisateur de la liste
    const testEmail = 'clémentrobert5@test.com';
    const testPassword = 'TestPassword123!';

    console.log('\n🔍 Debug de connexion:');
    console.log(`📧 Email testé: ${testEmail}`);
    console.log(`🔑 Mot de passe testé: ${testPassword}`);

    // Rechercher l'utilisateur
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé !');
      
      // Lister les premiers utilisateurs pour debug
      console.log('\n📋 Premiers utilisateurs en base:');
      const users = await User.find().limit(5);
      users.forEach((u, i) => {
        console.log(`${i+1}. Email: ${u.email}, Pseudo: ${u.pseudo}`);
      });
      
      return;
    }

    console.log('✅ Utilisateur trouvé:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Pseudo: ${user.pseudo}`);
    console.log(`   Hash du mot de passe: ${user.password}`);
    console.log(`   Admin: ${user.isAdmin}`);

    // Tester le mot de passe
    console.log('\n🔐 Test du mot de passe:');
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`   Mot de passe correct: ${isMatch ? '✅ OUI' : '❌ NON'}`);

    if (!isMatch) {
      // Tester le hash directement
      console.log('\n🔧 Test de hash direct:');
      const testHash = await bcrypt.hash(testPassword, 10);
      console.log(`   Nouveau hash: ${testHash}`);
      
      const directMatch = await bcrypt.compare(testPassword, testHash);
      console.log(`   Test direct: ${directMatch ? '✅ OK' : '❌ FAIL'}`);
    }

    // Compter tous les utilisateurs
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total utilisateurs en base: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

debugLogin(); 