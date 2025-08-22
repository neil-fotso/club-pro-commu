require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const testAndFixPasswords = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    const correctPassword = 'TestPassword123!';
    console.log(`🔐 Mot de passe correct: ${correctPassword}`);
    
    // Tester les premiers utilisateurs
    const users = await User.find().limit(5);
    console.log(`\n📋 Test de ${users.length} utilisateurs:\n`);
    
    for (const user of users) {
      console.log(`👤 ${user.pseudo} (${user.email})`);
      
      // Tester le mot de passe actuel
      const isValid = await bcrypt.compare(correctPassword, user.password);
      console.log(`   Mot de passe valide: ${isValid ? '✅' : '❌'}`);
      
      if (!isValid) {
        console.log('   🔧 Correction du mot de passe...');
        
        // Créer un nouveau hash correct
        const newHash = await bcrypt.hash(correctPassword, 10);
        
        // Mettre à jour l'utilisateur
        await User.findByIdAndUpdate(user._id, { password: newHash });
        
        // Vérifier que ça marche maintenant
        const isNowValid = await bcrypt.compare(correctPassword, newHash);
        console.log(`   Après correction: ${isNowValid ? '✅ CORRIGÉ' : '❌ ÉCHEC'}`);
      }
      console.log('');
    }
    
    console.log('🎉 Test et correction terminés !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion MongoDB');
  }
};

testAndFixPasswords(); 