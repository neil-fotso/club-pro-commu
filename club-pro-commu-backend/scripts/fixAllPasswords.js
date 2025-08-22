require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const fixAllPasswords = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    const correctPassword = 'TestPassword123!';
    console.log(`🔐 Correction du mot de passe pour tous: ${correctPassword}`);
    
    // Récupérer tous les utilisateurs
    const users = await User.find();
    console.log(`📊 Total utilisateurs trouvés: ${users.length}`);
    
    console.log('\n🔧 Correction en cours...');
    
    // Créer le nouveau hash une seule fois pour l'efficacité
    const newHash = await bcrypt.hash(correctPassword, 10);
    console.log('✅ Nouveau hash généré');
    
    // Mettre à jour tous les utilisateurs en une seule requête
    const result = await User.updateMany(
      {}, // Tous les utilisateurs
      { password: newHash }
    );
    
    console.log(`✅ ${result.modifiedCount} utilisateurs mis à jour`);
    
    // Vérifier avec quelques utilisateurs
    console.log('\n🔍 Vérification sur 3 utilisateurs...');
    const testUsers = await User.find().limit(3);
    
    for (const user of testUsers) {
      const isValid = await bcrypt.compare(correctPassword, user.password);
      console.log(`   ${user.pseudo}: ${isValid ? '✅ OK' : '❌ ÉCHEC'}`);
    }
    
    console.log('\n🎉 Tous les mots de passe ont été corrigés !');
    console.log('🔐 Mot de passe universel: TestPassword123!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

fixAllPasswords(); 