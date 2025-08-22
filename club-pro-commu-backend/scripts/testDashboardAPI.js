require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');

const testDashboardAPI = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🧪 TEST DES API DU DASHBOARD ADMINISTRATEUR\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // Récupérer l'admin
    const admin = await User.findOne({ email: 'admin.work@clubprocommu.fr' });
    if (!admin) {
      console.log('❌ Admin non trouvé ! Relancez createCorrectAdmin.js');
      return;
    }

    console.log(`✅ Admin trouvé: ${admin.email} (${admin.pseudo})`);

    // Tester d'abord la connexion pour récupérer le token
    console.log('\n1️⃣ TEST DE CONNEXION...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: admin.email,
        password: 'AdminWork123!'
      });
      
      if (loginResponse.data.message === 'Connexion réussie') {
        const token = loginResponse.data.user.token;
        console.log('   ✅ Connexion réussie !');
        console.log(`   🔑 Token: ${token.substring(0, 20)}...`);

        // Headers d'authentification
        const authHeaders = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // 2️⃣ Tester l'API des statistiques
        console.log('\n2️⃣ TEST API STATISTIQUES...');
        try {
          const statsResponse = await axios.get('http://localhost:3001/api/admin/dashboard/stats', {
            headers: authHeaders
          });
          console.log('   ✅ API Stats accessible !');
          console.log('   📊 Données reçues:', JSON.stringify(statsResponse.data, null, 2));
        } catch (error) {
          console.log('   ❌ Erreur API Stats:', error.response?.status, error.response?.data?.message || error.message);
        }

        // 3️⃣ Tester l'API des compétitions
        console.log('\n3️⃣ TEST API COMPÉTITIONS...');
        try {
          const compsResponse = await axios.get('http://localhost:3001/api/admin/dashboard/competitions', {
            headers: authHeaders
          });
          console.log('   ✅ API Compétitions accessible !');
          console.log('   🏆 Données reçues:', JSON.stringify(compsResponse.data, null, 2));
        } catch (error) {
          console.log('   ❌ Erreur API Compétitions:', error.response?.status, error.response?.data?.message || error.message);
        }

        // 4️⃣ Tester l'API des litiges
        console.log('\n4️⃣ TEST API LITIGES...');
        try {
          const litigesResponse = await axios.get('http://localhost:3001/api/admin/dashboard/litiges', {
            headers: authHeaders
          });
          console.log('   ✅ API Litiges accessible !');
          console.log('   ⚖️ Données reçues:', JSON.stringify(litigesResponse.data, null, 2));
        } catch (error) {
          console.log('   ❌ Erreur API Litiges:', error.response?.status, error.response?.data?.message || error.message);
        }

        // 5️⃣ Vérifier que le backend a bien les routes
        console.log('\n5️⃣ VÉRIFICATION DES ROUTES...');
        console.log('   📍 Routes attendues:');
        console.log('     • GET /api/admin/dashboard/stats');
        console.log('     • GET /api/admin/dashboard/competitions');
        console.log('     • GET /api/admin/dashboard/litiges');

      } else {
        console.log('   ❌ Échec de connexion:', loginResponse.data);
      }
    } catch (error) {
      console.log('   ❌ Erreur de connexion:', error.response?.status, error.response?.data || error.message);
    }

    // 6️⃣ Vérifier les données dans la base
    console.log('\n6️⃣ VÉRIFICATION DES DONNÉES BASE...');
    const Competition = require('../models/Competition');
    const Club = require('../models/Club');
    
    const competitions = await Competition.countDocuments();
    const clubs = await Club.countDocuments();
    const users = await User.countDocuments();
    
    console.log(`   📊 Données disponibles:`);
    console.log(`     • ${users} utilisateurs`);
    console.log(`     • ${clubs} clubs`);
    console.log(`     • ${competitions} compétitions`);

    if (competitions === 0) {
      console.log('\n⚠️  AUCUNE COMPÉTITION TROUVÉE !');
      console.log('   💡 Solution: Créez des données de test');
      console.log('   🚀 Commande: node scripts/createTestCompetitions.js');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testDashboardAPI();
}

module.exports = testDashboardAPI; 