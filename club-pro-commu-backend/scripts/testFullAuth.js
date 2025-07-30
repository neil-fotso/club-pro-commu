const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

const testFullAuth = async () => {
  try {
    console.log('🔍 Test complet d\'authentification...');
    
    // Test 1: Vérifier que l'API est accessible
    console.log('\n1️⃣ Test de connectivité...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ API accessible:', healthResponse.data);
    } catch (error) {
      console.log('❌ API non accessible:', error.message);
      return;
    }

    // Test 2: Tester l'inscription via l'API
    console.log('\n2️⃣ Test d\'inscription via l\'API...');
    const timestamp = Date.now();
    const testUser = {
      pseudo: `testuser${timestamp}`,
      pseudoPlateforme: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'password123',
      plateforme: 'PS5',
      postePrincipal: 'BU',
      age: '25',
      pays: 'France'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      console.log('✅ Inscription réussie:', registerResponse.data.message);
      console.log('👤 Nouvel utilisateur:', registerResponse.data.user.pseudo);
      
      // Test 3: Tester la connexion avec le nouvel utilisateur
      console.log('\n3️⃣ Test de connexion avec le nouvel utilisateur...');
      
      // Test avec pseudo
      try {
        const loginResponse1 = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: testUser.pseudo,
          password: testUser.password
        });
        console.log('✅ Connexion réussie avec pseudo:', loginResponse1.data.message);
        console.log('👤 Utilisateur connecté:', loginResponse1.data.user.pseudo);
      } catch (error) {
        console.log('❌ Échec connexion avec pseudo:', error.response?.data?.message || error.message);
      }
      
      // Test avec email
      try {
        const loginResponse2 = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ Connexion réussie avec email:', loginResponse2.data.message);
        console.log('👤 Utilisateur connecté:', loginResponse2.data.user.pseudo);
      } catch (error) {
        console.log('❌ Échec connexion avec email:', error.response?.data?.message || error.message);
      }
      
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
testFullAuth(); 