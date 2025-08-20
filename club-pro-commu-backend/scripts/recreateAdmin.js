const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Player = require('../models/Player');
require('dotenv').config();

const recreateAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Supprimer l'admin existant
    const existingAdmin = await User.findOne({ email: 'admin@clubpro.com' });
    if (existingAdmin) {
      console.log('🗑️  Suppression de l\'admin existant...');
      await User.deleteOne({ email: 'admin@clubpro.com' });
      await Player.deleteOne({ userId: existingAdmin._id });
      console.log('✅ Admin existant supprimé');
    }

    // Créer le nouveau mot de passe hashé
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Créer l'utilisateur admin
    const adminUser = new User({
      email: 'admin@clubpro.com',
      pseudo: 'clubpro-admin',
      password: 'admin123',
      isAdmin: true
    });

    await adminUser.save();
    console.log('✅ Nouvel utilisateur admin créé');

    // Créer le profil joueur correspondant
    const adminPlayer = new Player({
      userId: adminUser._id,
      pseudo: 'clubpro-admin',
      age: 25,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Milieu',
      postePrincipal: 'MC',
      postesSecondaires: ['MOC', 'MDC'],
      langues: ['Français'],
      niveau: 'Expert',
      description: 'Administrateur du système',
      rechercheClub: false,
      disponibilite: 'Disponible',
      statistiques: {
        matchsJoues: 0,
        victoires: 0,
        defaites: 0,
        nuls: 0,
        butsMarques: 0,
        butsEncaisses: 0,
        passesDecisives: 0,
        cleanSheets: 0
      }
    });

    await adminPlayer.save();
    console.log('✅ Profil joueur admin créé');

    // Vérifier que tout est correct
    const newAdmin = await User.findOne({ email: 'admin@clubpro.com' });
    const isValidPassword = await newAdmin.comparePassword('admin123');
    
    console.log('\n🎉 Admin recréé avec succès !');
    console.log('📧 Email: admin@clubpro.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('👤 Pseudo: clubpro-admin');
    console.log('🎯 Admin: ' + newAdmin.isAdmin);
    console.log('✅ Mot de passe valide: ' + isValidPassword);
    
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la recréation :', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Exécuter le script
recreateAdmin(); 