const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function fixAdmin() {
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

    console.log('👤 Utilisateur trouvé:', {
      _id: admin._id,
      pseudo: admin.pseudo,
      email: admin.email,
      isAdmin: admin.isAdmin
    });

    // Vérifier si isAdmin est défini
    if (admin.isAdmin === undefined || admin.isAdmin === null) {
      console.log('🔧 Correction du champ isAdmin...');
      admin.isAdmin = true;
      await admin.save();
      console.log('✅ isAdmin défini à true');
    } else {
      console.log('✅ isAdmin déjà défini:', admin.isAdmin);
    }

    // Vérifier après correction
    const updatedAdmin = await User.findById(admin._id);
    console.log('👤 Utilisateur après correction:', {
      _id: updatedAdmin._id,
      pseudo: updatedAdmin.pseudo,
      email: updatedAdmin.email,
      isAdmin: updatedAdmin.isAdmin
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

fixAdmin(); 