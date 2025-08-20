const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Vérifier si l'admin existe
    const admin = await User.findOne({ email: 'admin@clubpro.com' });
    if (!admin) {
      console.log('❌ Admin non trouvé dans la base de données');
      await mongoose.connection.close();
      return;
    }

    console.log('✅ Admin trouvé:');
    console.log(`  - Email: ${admin.email}`);
    console.log(`  - Pseudo: ${admin.pseudo}`);
    console.log(`  - Rôle: ${admin.role}`);
    console.log(`  - ID: ${admin._id}`);

    // Tester la connexion avec le mot de passe
    const password = 'admin123';
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (isValidPassword) {
      console.log('✅ Mot de passe correct');
    } else {
      console.log('❌ Mot de passe incorrect');
    }

    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Exécuter le script
checkAdmin(); 