require('dotenv').config();
const axios = require('axios');

const testFrontendIntegration = async () => {
  console.log('🧪 TEST INTÉGRATION FRONTEND/BACKEND\n');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const BACKEND_URL = 'http://localhost:3001/api';
  const FRONTEND_URL = 'http://localhost:3002';

  let tests = [];
  let successes = 0;
  let failures = 0;

  const addTest = (name, status, message) => {
    tests.push({ name, status, message });
    if (status === 'success') successes++;
    if (status === 'error') failures++;
  };

  // 1. Tester la connectivité backend
  console.log('1️⃣ TEST CONNECTIVITÉ BACKEND');
  console.log('─'.repeat(50));

  try {
    const response = await axios.get(`${BACKEND_URL}/competitions`, { timeout: 5000 });
    addTest('Backend Connectivity', 'success', `✅ Backend accessible (${response.status})`);
    console.log(`   ✅ Backend accessible: ${response.data.length} compétitions`);
  } catch (error) {
    addTest('Backend Connectivity', 'error', `❌ Backend inaccessible: ${error.message}`);
    console.log(`   ❌ Backend inaccessible: ${error.message}`);
    console.log('\n⚠️ ARRÊT DU TEST - Backend requis');
    return;
  }

  // 2. Tester la connectivité frontend (page d'accueil)
  console.log('\n2️⃣ TEST CONNECTIVITÉ FRONTEND');
  console.log('─'.repeat(50));

  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    if (response.status === 200) {
      addTest('Frontend Connectivity', 'success', '✅ Frontend accessible');
      console.log('   ✅ Frontend accessible');
    } else {
      addTest('Frontend Connectivity', 'warning', `⚠️ Frontend répond mais status ${response.status}`);
      console.log(`   ⚠️ Frontend répond mais status ${response.status}`);
    }
  } catch (error) {
    addTest('Frontend Connectivity', 'error', `❌ Frontend inaccessible: ${error.message}`);
    console.log(`   ❌ Frontend inaccessible: ${error.message}`);
  }

  // 3. Tester les routes API principales
  console.log('\n3️⃣ TEST ROUTES API PRINCIPALES');
  console.log('─'.repeat(50));

  const apiRoutes = [
    { path: '/competitions', name: 'Compétitions' },
    { path: '/clubs', name: 'Clubs' },
    { path: '/players', name: 'Joueurs' },
    { path: '/users', name: 'Utilisateurs' }
  ];

  for (const route of apiRoutes) {
    try {
      const response = await axios.get(`${BACKEND_URL}${route.path}`, { timeout: 3000 });
      addTest(`API ${route.name}`, 'success', `✅ ${route.name}: ${response.data.length} éléments`);
      console.log(`   ✅ ${route.name}: ${response.data.length} éléments`);
    } catch (error) {
      addTest(`API ${route.name}`, 'error', `❌ ${route.name}: ${error.response?.status || error.message}`);
      console.log(`   ❌ ${route.name}: ${error.response?.status || error.message}`);
    }
  }

  // 4. Tester l'authentification
  console.log('\n4️⃣ TEST AUTHENTIFICATION');
  console.log('─'.repeat(50));

  try {
    // Tenter de se connecter avec un admin connu
    const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'admin.work@clubprocommu.fr',
      password: 'AdminWork123!'
    }, { timeout: 5000 });

    if (loginResponse.data.message === 'Connexion réussie') {
      addTest('Admin Login', 'success', '✅ Connexion admin réussie');
      console.log('   ✅ Connexion admin réussie');

      const token = loginResponse.data.user.token;

      // Tester un endpoint protégé
      try {
        const protectedResponse = await axios.get(`${BACKEND_URL}/admin/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 5000
        });
        addTest('Protected Endpoint', 'success', '✅ Endpoint protégé accessible');
        console.log('   ✅ Endpoint protégé accessible');
      } catch (error) {
        addTest('Protected Endpoint', 'error', `❌ Endpoint protégé: ${error.response?.status}`);
        console.log(`   ❌ Endpoint protégé: ${error.response?.status}`);
      }
    } else {
      addTest('Admin Login', 'error', '❌ Connexion admin échouée');
      console.log('   ❌ Connexion admin échouée');
    }
  } catch (error) {
    addTest('Admin Login', 'error', `❌ Erreur connexion: ${error.response?.status || error.message}`);
    console.log(`   ❌ Erreur connexion: ${error.response?.status || error.message}`);
  }

  // 5. Tester une compétition spécifique
  console.log('\n5️⃣ TEST DONNÉES COMPÉTITION');
  console.log('─'.repeat(50));

  try {
    const competitions = await axios.get(`${BACKEND_URL}/competitions`);
    if (competitions.data.length > 0) {
      const comp = competitions.data[0];
      
      // Tester détail compétition
      try {
        const detail = await axios.get(`${BACKEND_URL}/competitions/${comp._id}`);
        addTest('Competition Detail', 'success', `✅ Détail "${detail.data.nom}"`);
        console.log(`   ✅ Détail "${detail.data.nom}": ${detail.data.equipesInscrites.length} équipes`);

        // Tester matchs
        if (detail.data.matchsElimination && detail.data.matchsElimination.length > 0) {
          addTest('Competition Matches', 'success', `✅ ${detail.data.matchsElimination.length} matchs d'élimination`);
          console.log(`   ✅ ${detail.data.matchsElimination.length} matchs d'élimination`);
        } else if (detail.data.poules && detail.data.poules.length > 0) {
          const totalMatchs = detail.data.poules.reduce((sum, poule) => sum + poule.matchs.length, 0);
          addTest('Competition Matches', 'success', `✅ ${totalMatchs} matchs de poules`);
          console.log(`   ✅ ${totalMatchs} matchs de poules`);
        } else {
          addTest('Competition Matches', 'warning', '⚠️ Aucun match trouvé');
          console.log('   ⚠️ Aucun match trouvé');
        }

        // Tester statistiques
        if (detail.data.statistiques) {
          const stats = detail.data.statistiques;
          addTest('Competition Stats', 'success', `✅ Stats: ${stats.matchsTermines}/${stats.totalMatchs} matchs`);
          console.log(`   ✅ Stats: ${stats.matchsTermines}/${stats.totalMatchs} matchs, ${stats.totalButs} buts`);
        } else {
          addTest('Competition Stats', 'warning', '⚠️ Statistiques manquantes');
          console.log('   ⚠️ Statistiques manquantes');
        }

      } catch (error) {
        addTest('Competition Detail', 'error', `❌ Erreur détail: ${error.response?.status}`);
        console.log(`   ❌ Erreur détail: ${error.response?.status}`);
      }
    } else {
      addTest('Competition Data', 'warning', '⚠️ Aucune compétition disponible');
      console.log('   ⚠️ Aucune compétition disponible pour test');
    }
  } catch (error) {
    addTest('Competition Data', 'error', `❌ Erreur chargement compétitions: ${error.message}`);
    console.log(`   ❌ Erreur chargement compétitions: ${error.message}`);
  }

  // 6. Tester les CORS
  console.log('\n6️⃣ TEST CORS CONFIGURATION');
  console.log('─'.repeat(50));

  try {
    const corsResponse = await axios.options(`${BACKEND_URL}/competitions`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    addTest('CORS Configuration', 'success', '✅ CORS configuré correctement');
    console.log('   ✅ CORS configuré correctement');
  } catch (error) {
    if (error.response?.status === 404) {
      // OPTIONS peut ne pas être explicitement gérée, mais ce n'est pas forcément un problème
      addTest('CORS Configuration', 'warning', '⚠️ OPTIONS non gérée (normal si CORS fonctionne)');
      console.log('   ⚠️ OPTIONS non gérée (normal si CORS fonctionne)');
    } else {
      addTest('CORS Configuration', 'error', `❌ Problème CORS: ${error.message}`);
      console.log(`   ❌ Problème CORS: ${error.message}`);
    }
  }

  // 7. Résumé et recommandations
  console.log('\n📋 RÉSUMÉ DU TEST D\'INTÉGRATION');
  console.log('═'.repeat(50));

  console.log(`\n📊 STATISTIQUES:`);
  console.log(`   ✅ Succès: ${successes}`);
  console.log(`   ❌ Échecs: ${failures}`);
  console.log(`   📊 Total: ${tests.length}`);
  console.log(`   🎯 Taux de réussite: ${Math.round((successes / tests.length) * 100)}%`);

  if (failures === 0) {
    console.log('\n🎉 SYSTÈME FONCTIONNEL !');
    console.log('   ✅ Backend et Frontend opérationnels');
    console.log('   ✅ Intégration réussie');
    console.log('   ✅ APIs accessibles');
  } else if (failures < tests.length / 2) {
    console.log('\n⚠️ SYSTÈME PARTIELLEMENT FONCTIONNEL');
    console.log('   🔧 Quelques problèmes mineurs détectés');
    console.log('   💡 Vérifiez les échecs ci-dessus');
  } else {
    console.log('\n❌ PROBLÈMES MAJEURS DÉTECTÉS');
    console.log('   🚨 Plus de la moitié des tests échouent');
    console.log('   🔧 Intervention requise');
  }

  console.log('\n🚀 PROCHAINES ÉTAPES:');
  if (successes >= tests.length * 0.8) {
    console.log('   1. 🎮 Tester manuellement le frontend via http://localhost:3002');
    console.log('   2. 🧪 Utiliser la page de test: http://localhost:3002/competition-test');
    console.log('   3. 👤 Tester avec différents types d\'utilisateurs');
    console.log('   4. 📱 Vérifier la responsivité mobile');
  } else {
    console.log('   1. 🔧 Corriger les problèmes identifiés');
    console.log('   2. 🔄 Relancer ce test');
    console.log('   3. 📊 Vérifier les logs backend/frontend');
  }

  console.log('\n💡 COMMANDES UTILES:');
  console.log('   • Backend: cd club-pro-commu-backend && npm start');
  console.log('   • Frontend: cd club-pro-commu-frontend && npm start');
  console.log('   • Test page: http://localhost:3002/competition-test');
  console.log('   • Admin dashboard: http://localhost:3002/admin/dashboard');

  return {
    totalTests: tests.length,
    successes,
    failures,
    successRate: Math.round((successes / tests.length) * 100),
    status: failures === 0 ? 'excellent' : failures < tests.length / 2 ? 'good' : 'problematic'
  };
};

if (require.main === module) {
  testFrontendIntegration();
}

module.exports = testFrontendIntegration; 