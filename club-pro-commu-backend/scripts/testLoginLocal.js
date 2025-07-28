const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testLoginLocal = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Importer les modèles
    const User = require('../models/User');
    const Player = require('../models/Player');

    // Test avec un utilisateur existant
    const testEmail = 'test4@example.com';
    const testPassword = 'testpassword123';

    console.log('\n🔍 Test de recherche utilisateur...');
    
    // Rechercher l'utilisateur par email
    let user = await User.findOne({ email: testEmail.toLowerCase() });
    console.log('Recherche par email:', testEmail.toLowerCase(), 'Résultat:', user ? 'Trouvé' : 'Non trouvé');

    // Si pas trouvé par email, essayer par pseudo
    if (!user) {
      user = await User.findOne({ pseudo: testEmail });
      console.log('Recherche par pseudo:', testEmail, 'Résultat:', user ? 'Trouvé' : 'Non trouvé');
    }

    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:', user.pseudo);
    console.log('📧 Email:', user.email);
    console.log('🔐 Mot de passe hashé:', user.password.substring(0, 20) + '...');

    // Vérifier le mot de passe
    console.log('\n🔐 Test de vérification du mot de passe...');
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('Mot de passe valide:', isPasswordValid);

    if (isPasswordValid) {
      console.log('✅ Connexion réussie !');
    } else {
      console.log('❌ Mot de passe incorrect');
    }

    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

// Exécuter le script
testLoginLocal(); 