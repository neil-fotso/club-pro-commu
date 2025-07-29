const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Configuration de la base de données
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clubprocommu';

// Données des utilisateurs de test
const testUsers = [
  {
    email: 'alex.dupont@test.com',
    password: 'password123',
    pseudo: 'AlexDupont',
    dateCreation: new Date('2024-01-15'),
    derniereConnexion: new Date('2024-02-20')
  },
  {
    email: 'marie.martin@test.com',
    password: 'password123',
    pseudo: 'MarieMartin',
    dateCreation: new Date('2024-01-20'),
    derniereConnexion: new Date('2024-02-19')
  },
  {
    email: 'thomas.bernard@test.com',
    password: 'password123',
    pseudo: 'ThomasBernard',
    dateCreation: new Date('2024-01-25'),
    derniereConnexion: new Date('2024-02-18')
  },
  {
    email: 'sophie.petit@test.com',
    password: 'password123',
    pseudo: 'SophiePetit',
    dateCreation: new Date('2024-02-01'),
    derniereConnexion: new Date('2024-02-17')
  },
  {
    email: 'lucas.robert@test.com',
    password: 'password123',
    pseudo: 'LucasRobert',
    dateCreation: new Date('2024-02-05'),
    derniereConnexion: new Date('2024-02-16')
  },
  {
    email: 'julie.richard@test.com',
    password: 'password123',
    pseudo: 'JulieRichard',
    dateCreation: new Date('2024-02-10'),
    derniereConnexion: new Date('2024-02-15')
  },
  {
    email: 'pierre.durand@test.com',
    password: 'password123',
    pseudo: 'PierreDurand',
    dateCreation: new Date('2024-02-12'),
    derniereConnexion: new Date('2024-02-14')
  },
  {
    email: 'camille.moreau@test.com',
    password: 'password123',
    pseudo: 'CamilleMoreau',
    dateCreation: new Date('2024-02-14'),
    derniereConnexion: new Date('2024-02-13')
  },
  {
    email: 'antoine.simon@test.com',
    password: 'password123',
    pseudo: 'AntoineSimon',
    dateCreation: new Date('2024-02-16'),
    derniereConnexion: new Date('2024-02-12')
  },
  {
    email: 'laura.michel@test.com',
    password: 'password123',
    pseudo: 'LauraMichel',
    dateCreation: new Date('2024-02-18'),
    derniereConnexion: new Date('2024-02-11')
  }
];

const seedUsers = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB établie');

    // Supprimer les utilisateurs existants (optionnel)
    const existingUsers = await User.find({ email: { $regex: /@test\.com$/ } });
    if (existingUsers.length > 0) {
      await User.deleteMany({ email: { $regex: /@test\.com$/ } });
      console.log(`🗑️ ${existingUsers.length} utilisateurs de test supprimés`);
    }

    // Créer les nouveaux utilisateurs
    const createdUsers = await User.insertMany(testUsers);
    console.log(`✅ ${createdUsers.length} utilisateurs de test créés avec succès !`);

    // Afficher les utilisateurs créés
    console.log('\n📋 Utilisateurs créés :');
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.pseudo} (${user.email})`);
    });

    console.log('\n🔑 Informations de connexion :');
    console.log('Email: [email]@test.com');
    console.log('Mot de passe: password123');
    console.log('\n💡 Exemple de connexion :');
    console.log('Email: alex.dupont@test.com');
    console.log('Mot de passe: password123');

  } catch (error) {
    console.error('❌ Erreur lors du seeding des utilisateurs:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

// Exécuter le script
seedUsers(); 