const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://club-pro-commu.onrender.com/api';

// Données de test pour les utilisateurs
const usersData = [
  {
    pseudo: 'Zidane10',
    email: 'zidane@test.com',
    password: 'password123',
    plateforme: 'PS5'
  },
  {
    pseudo: 'Mbappe7',
    email: 'mbappe@test.com',
    password: 'password123',
    plateforme: 'PS5'
  },
  {
    pseudo: 'Benzema9',
    email: 'benzema@test.com',
    password: 'password123',
    plateforme: 'Xbox'
  },
  {
    pseudo: 'Kante13',
    email: 'kante@test.com',
    password: 'password123',
    plateforme: 'PC'
  },
  {
    pseudo: 'Varane4',
    email: 'varane@test.com',
    password: 'password123',
    plateforme: 'PS5'
  },
  {
    pseudo: 'Pogba6',
    email: 'pogba@test.com',
    password: 'password123',
    plateforme: 'Xbox'
  },
  {
    pseudo: 'Griezmann7',
    email: 'griezmann@test.com',
    password: 'password123',
    plateforme: 'PC'
  },
  {
    pseudo: 'Lloris1',
    email: 'lloris@test.com',
    password: 'password123',
    plateforme: 'PS5'
  }
];

// Données de test pour les clubs
const clubsData = [
  {
    nom: 'Real Madrid Pro',
    plateforme: 'PS5',
    pays: 'Espagne',
    description: 'Club historique, recherche joueurs de haut niveau pour compétitions',
    effectifMax: 25,
    langues: ['Espagnol', 'Anglais', 'Français'],
    recrute: true
  },
  {
    nom: 'Barcelona FC',
    plateforme: 'PS5',
    pays: 'Espagne',
    description: 'Club basé sur le jeu de possession, recherche milieux créatifs',
    effectifMax: 20,
    langues: ['Espagnol', 'Catalan', 'Anglais'],
    recrute: true
  },
  {
    nom: 'Manchester United',
    plateforme: 'Xbox',
    pays: 'Angleterre',
    description: 'Club légendaire, recherche attaquants et défenseurs',
    effectifMax: 30,
    langues: ['Anglais'],
    recrute: true
  },
  {
    nom: 'Paris Saint-Germain',
    plateforme: 'PC',
    pays: 'France',
    description: 'Club parisien, recherche joueurs pour championnat',
    effectifMax: 22,
    langues: ['Français', 'Anglais'],
    recrute: true
  },
  {
    nom: 'Bayern Munich',
    plateforme: 'PS5',
    pays: 'Allemagne',
    description: 'Club allemand, jeu direct et efficace',
    effectifMax: 18,
    langues: ['Allemand', 'Anglais'],
    recrute: true
  },
  {
    nom: 'Juventus FC',
    plateforme: 'Xbox',
    pays: 'Italie',
    description: 'Club italien, défense solide et contre-attaque',
    effectifMax: 24,
    langues: ['Italien', 'Anglais'],
    recrute: true
  },
  {
    nom: 'Ajax Amsterdam',
    plateforme: 'PC',
    pays: 'Pays-Bas',
    description: 'Club formateur, recherche jeunes talents',
    effectifMax: 16,
    langues: ['Néerlandais', 'Anglais'],
    recrute: true
  },
  {
    nom: 'Porto FC',
    plateforme: 'PS5',
    pays: 'Portugal',
    description: 'Club portugais, jeu technique et offensif',
    effectifMax: 20,
    langues: ['Portugais', 'Anglais'],
    recrute: true
  }
];

// Fonction pour créer un utilisateur
const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.token) {
      console.log(`✅ Utilisateur créé : ${userData.pseudo}`);
      return response.data.token;
    } else {
      console.log(`⚠️  Utilisateur ${userData.pseudo} existe déjà ou erreur`);
      return null;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('existe déjà')) {
      console.log(`⚠️  Utilisateur ${userData.pseudo} existe déjà`);
    } else {
      console.error(`❌ Erreur création utilisateur ${userData.pseudo}:`, error.response?.data?.message || error.message);
    }
    return null;
  }
};

// Fonction pour créer un club
const createClub = async (clubData, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/clubs`, clubData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Club créé : ${clubData.nom}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur création club ${clubData.nom}:`, error.response?.data?.message || error.message);
    return null;
  }
};

// Fonction pour se connecter
const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrPseudo: userData.email,
      password: userData.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.token) {
      console.log(`✅ Connexion réussie : ${userData.pseudo}`);
      return response.data.token;
    }
  } catch (error) {
    console.error(`❌ Erreur connexion ${userData.pseudo}:`, error.response?.data?.message || error.message);
  }
  return null;
};

// Fonction principale
const seedDatabase = async () => {
  console.log('🚀 Début du seeding via API...');
  
  const createdTokens = [];
  
  // D'abord essayer de se connecter avec les utilisateurs existants
  console.log('\n🔐 Tentative de connexion avec les utilisateurs existants...');
  for (const userData of usersData) {
    const token = await loginUser(userData);
    if (token) {
      createdTokens.push({ userData, token });
    }
    // Pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Si aucun utilisateur n'existe, les créer
  if (createdTokens.length === 0) {
    console.log('\n👥 Aucun utilisateur trouvé, création des utilisateurs...');
    for (const userData of usersData) {
      const token = await createUser(userData);
      if (token) {
        createdTokens.push({ userData, token });
      }
      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Créer les clubs avec les tokens des utilisateurs
  console.log('\n🏟️  Création des clubs...');
  for (let i = 0; i < clubsData.length; i++) {
    const clubData = clubsData[i];
    const userIndex = i % createdTokens.length;
    const { token } = createdTokens[userIndex];
    
    if (token) {
      await createClub(clubData, token);
    }
    // Pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ Seeding terminé !');
  
  // Afficher les informations de connexion
  console.log('\n🔑 Informations de connexion pour les tests :');
  console.log('==============================================');
  usersData.forEach((user, index) => {
    console.log(`${index + 1}. ${user.pseudo} - ${user.email} - password123`);
  });
  
  console.log('\n🌐 URL de votre application :');
  console.log('Frontend : https://votre-app.vercel.app');
  console.log('Backend API : https://club-pro-commu.onrender.com/api');
};

// Exécuter le script
if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = { seedDatabase, usersData, clubsData }; 