const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function debugAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    console.log('✅ Connecté à MongoDB');

    // Rechercher l'utilisateur admin
    const admin = await User.findOne({ email: 'admin2@site.com' });
    
    if (!admin) {
      console.log('❌ Utilisateur admin non trouvé');
      return;
    }

    console.log('👤 Utilisateur complet:', JSON.stringify(admin.toObject(), null, 2));
    console.log('🔍 Champ isAdmin:', admin.isAdmin);
    console.log('🔍 Type de isAdmin:', typeof admin.isAdmin);
    console.log('🔍 hasOwnProperty isAdmin:', admin.hasOwnProperty('isAdmin'));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

debugAdmin(); 