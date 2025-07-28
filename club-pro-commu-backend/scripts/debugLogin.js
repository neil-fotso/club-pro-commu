const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/clubprocommu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = require('../models/User');

const debugLogin = async () => {
  try {
    console.log('🔍 Débogage de la connexion...');
    
    // Récupérer l'utilisateur testuser123
    const user = await User.findOne({ pseudo: 'testuser123' });
    
    if (!user) {
      console.log('❌ Utilisateur testuser123 non trouvé');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', user.pseudo);
    console.log('📧 Email:', user.email);
    console.log('🔐 Hash stocké:', user.password);
    
    // Test avec le mot de passe
    const testPassword = 'password123';
    console.log('\n🔍 Test de bcrypt.compare...');
    console.log('Mot de passe à tester:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Résultat bcrypt.compare:', isValid);
    
    // Test de hashage du même mot de passe
    console.log('\n🔍 Test de hashage du même mot de passe...');
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('Nouveau hash:', newHash);
    
    const isValid2 = await bcrypt.compare(testPassword, newHash);
    console.log('Comparaison avec nouveau hash:', isValid2);
    
    // Vérifier si les hashes sont identiques
    console.log('\n🔍 Comparaison des hashes...');
    console.log('Hash original:', user.password);
    console.log('Hash nouveau:', newHash);
    console.log('Hashes identiques:', user.password === newHash);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

debugLogin(); 