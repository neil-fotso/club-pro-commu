const axios = require('axios');

const API_BASE_URL = 'https://club-pro-commu.onrender.com/api';

const testOnlineAPI = async () => {
  try {
    console.log('🔍 Test de l\'API en ligne...');
    
    // Test 1: Vérifier que l'API est accessible
    console.log('\n1️⃣ Test de connectivité...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ API accessible:', healthResponse.data);
    } catch (error) {
      console.log('❌ API non accessible:', error.message);
      return;
    }

    // Test 2: Tester la connexion avec différents identifiants
    console.log('\n2️⃣ Test de connexion...');
    
    const testCredentials = [
      { email: 'testuser', password: 'testpassword123' },
      { email: 'test@example.com', password: 'testpassword123' },
      { email: 'admin', password: 'admin123' },
      { email: 'user', password: 'password' }
    ];

    for (const cred of testCredentials) {
      try {
        console.log(`\n🔐 Test avec: ${cred.email}`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, cred);
        console.log('✅ Connexion réussie:', loginResponse.data.message);
        console.log('👤 Utilisateur:', loginResponse.data.user.pseudo);
        break; // Arrêter si une connexion réussit
      } catch (error) {
        if (error.response) {
          console.log('❌ Échec:', error.response.data.message);
        } else {
          console.log('❌ Erreur réseau:', error.message);
        }
      }
    }

    // Test 3: Tester l'inscription
    console.log('\n3️⃣ Test d\'inscription...');
    const testUser = {
      pseudo: 'apitestuser',
      pseudoPlateforme: 'apitestuser',
      email: 'apitest@example.com',
      password: 'testpassword123',
      plateforme: 'PS5',
      postePrincipal: 'BU',
      age: '25',
      pays: 'France'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      console.log('✅ Inscription réussie:', registerResponse.data.message);
      console.log('👤 Nouvel utilisateur:', registerResponse.data.user.pseudo);
      
      // Tester la connexion avec le nouvel utilisateur
      console.log('\n🔐 Test de connexion avec le nouvel utilisateur...');
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: testUser.pseudo,
        password: testUser.password
      });
      console.log('✅ Connexion réussie:', loginResponse.data.message);
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Échec inscription:', error.response.data.message);
      } else {
        console.log('❌ Erreur réseau:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
};

// Exécuter le script
testOnlineAPI(); 