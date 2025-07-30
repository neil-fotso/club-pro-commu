const mongoose = require('mongoose');
require('dotenv').config();

const clearDatabase = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Supprimer toutes les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('🗑️  Suppression de toutes les collections...');
    
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`✅ Collection "${collection.name}" supprimée`);
    }

    console.log('🎉 Base de données complètement vidée !');
    
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression :', error);
    process.exit(1);
  }
};

// Exécuter le script
clearDatabase(); 