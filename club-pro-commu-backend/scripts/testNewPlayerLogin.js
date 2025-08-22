require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const testNewPlayerLogin = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    console.log('✅ Connexion établie\n');

    // Tester avec un des nouveaux joueurs
    const testEmails = [
      'maximegarcia46@test.com',
      'sophieandré47@test.com', 
      'tomleblond48@test.com'
    ];
    
    const testPassword = 'TestPassword123!';
    
    console.log('🔍 Test des nouveaux joueurs:\n');
    
    for (const email of testEmails) {
      console.log(`📧 Test: ${email}`);
      
      const user = await User.findOne({ email });
      if (!user) {
        console.log('   ❌ Utilisateur non trouvé\n');
        continue;
      }
      
      console.log(`   ✅ Utilisateur trouvé: ${user.pseudo}`);
      console.log(`   🔑 Hash: ${user.password}`);
      
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   🔐 Mot de passe correct: ${isMatch ? '✅ OUI' : '❌ NON'}`);
      
      if (!isMatch) {
        // Tenter de corriger le mot de passe
        console.log('   🔧 Correction du mot de passe...');
        const newHash = await bcrypt.hash(testPassword, 10);
        await User.findByIdAndUpdate(user._id, { password: newHash });
        console.log('   ✅ Mot de passe corrigé');
      }
      
      console.log('');
    }
    
    // Vérifier combien d'utilisateurs ont été créés récemment
    const recentUsers = await User.find({
      email: { $regex: /@test\.com$/ },
      dateCreation: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Dernières 24h
    });
    
    console.log(`📊 Utilisateurs créés récemment: ${recentUsers.length}`);
    console.log('\n🔐 MOT DE PASSE À UTILISER: TestPassword123!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testNewPlayerLogin();
}

module.exports = testNewPlayerLogin; 