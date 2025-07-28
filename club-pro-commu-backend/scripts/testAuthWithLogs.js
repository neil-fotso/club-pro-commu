const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

const testAuthWithLogs = async () => {
  try {
    console.log('🔍 Test d\'authentification avec logs détaillés...');
    
    const timestamp = Date.now();
    const testUser = {
      pseudo: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'password123',
      plateforme: 'PS5',
      postePrincipal: 'BU',
      age: '25',
      pays: 'France'
    };

    console.log('\n1️⃣ Inscription...');
    console.log('Données envoyées:', JSON.stringify(testUser, null, 2));
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      console.log('✅ Inscription réussie');
      console.log('Réponse:', JSON.stringify(registerResponse.data, null, 2));
      
      // Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('\n2️⃣ Connexion avec pseudo...');
      const loginData1 = {
        email: testUser.pseudo,
        password: testUser.password
      };
      console.log('Données de connexion:', JSON.stringify(loginData1, null, 2));
      
      try {
        const loginResponse1 = await axios.post(`${API_BASE_URL}/auth/login`, loginData1);
        console.log('✅ Connexion réussie avec pseudo');
        console.log('Réponse:', JSON.stringify(loginResponse1.data, null, 2));
      } catch (error) {
        console.log('❌ Échec connexion avec pseudo');
        console.log('Erreur:', error.response?.data || error.message);
      }
      
      console.log('\n3️⃣ Connexion avec email...');
      const loginData2 = {
        email: testUser.email,
        password: testUser.password
      };
      console.log('Données de connexion:', JSON.stringify(loginData2, null, 2));
      
      try {
        const loginResponse2 = await axios.post(`${API_BASE_URL}/auth/login`, loginData2);
        console.log('✅ Connexion réussie avec email');
        console.log('Réponse:', JSON.stringify(loginResponse2.data, null, 2));
      } catch (error) {
        console.log('❌ Échec connexion avec email');
        console.log('Erreur:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.log('❌ Échec inscription');
      console.log('Erreur:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
};

// Exécuter le script
testAuthWithLogs(); 