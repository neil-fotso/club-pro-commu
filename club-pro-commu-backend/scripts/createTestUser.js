const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createTestUser = async () => {
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

    // Données de test
    const testUser = {
      pseudo: 'testuser5',
      email: 'test5@example.com',
      password: 'password123',
      plateforme: 'PS5',
      position: 'BU',
      pays: 'France',
      age: '25'
    };

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);
    console.log('🔐 Mot de passe original:', testUser.password);
    console.log('🔐 Mot de passe hashé:', hashedPassword.substring(0, 20) + '...');

    // Créer l'utilisateur
    const user = new User({
      pseudo: testUser.pseudo,
      email: testUser.email.toLowerCase(),
      password: hashedPassword,
      dateCreation: new Date()
    });

    await user.save();
    console.log('✅ Utilisateur créé:', user.pseudo);

    // Créer le profil joueur
    const player = new Player({
      userId: user._id,
      pseudo: testUser.pseudo,
      age: parseInt(testUser.age),
      pays: testUser.pays,
      plateforme: testUser.plateforme,
      position: 'Attaquant', // Mapping automatique
      postePrincipal: testUser.position,
      niveau: 'Intermédiaire',
      disponibilite: 'Disponible',
      derniereActivite: new Date()
    });

    await player.save();
    console.log('✅ Profil joueur créé:', player.pseudo);

    console.log('\n🎯 Identifiants de test:');
    console.log('Pseudo:', testUser.pseudo);
    console.log('Email:', testUser.email);
    console.log('Mot de passe:', testUser.password);

    // Test de vérification immédiat
    console.log('\n🔐 Test de vérification immédiat:');
    const isPasswordValid = await bcrypt.compare(testUser.password, hashedPassword);
    console.log('Mot de passe valide:', isPasswordValid);

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
createTestUser(); 