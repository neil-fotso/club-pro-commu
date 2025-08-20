const axios = require('axios');

const RENDER_API_URL = 'https://club-pro-commu.onrender.com/api'; // URL de votre backend Render

const clearRenderDatabase = async () => {
  try {
    console.log('🌐 Connexion à l\'API Render...');
    console.log('🔗 URL cible :', RENDER_API_URL);

    // Test de connexion
    console.log('\n🔍 Test de connexion...');
    const testResponse = await axios.get(`${RENDER_API_URL}/test`, {
      timeout: 10000
    });
    console.log('✅ Connexion réussie !');

    // Compter les données existantes
    console.log('\n📊 Analyse de la base de données de production...');
    
    const [
      usersResponse,
      playersResponse,
      clubsResponse,
      competitionsResponse
    ] = await Promise.all([
      axios.get(`${RENDER_API_URL}/users`).catch(() => ({ data: [] })),
      axios.get(`${RENDER_API_URL}/players`).catch(() => ({ data: [] })),
      axios.get(`${RENDER_API_URL}/clubs`).catch(() => ({ data: [] })),
      axios.get(`${RENDER_API_URL}/competitions`).catch(() => ({ data: [] }))
    ]);

    const counts = {
      users: Array.isArray(usersResponse.data) ? usersResponse.data.length : 0,
      players: Array.isArray(playersResponse.data) ? playersResponse.data.length : 0,
      clubs: Array.isArray(clubsResponse.data) ? clubsResponse.data.length : 0,
      competitions: Array.isArray(competitionsResponse.data) ? competitionsResponse.data.length : 0
    };

    console.log('📈 État actuel de la base Render :');
    console.log(`   👤 Utilisateurs : ${counts.users}`);
    console.log(`   ⚽ Joueurs : ${counts.players}`);
    console.log(`   🏆 Clubs : ${counts.clubs}`);
    console.log(`   🏅 Compétitions : ${counts.competitions}`);

    const totalDocs = counts.users + counts.players + counts.clubs + counts.competitions;

    if (totalDocs === 0) {
      console.log('\n✅ La base de données Render est déjà vide !');
      return;
    }

    console.log(`\n🗑️  Total de ${totalDocs} documents détectés sur Render`);
    console.log('\n⚠️  ATTENTION : Cette action va supprimer TOUTES les données de PRODUCTION !');
    console.log('❌ CETTE FONCTIONNALITÉ N\'EST PAS IMPLÉMENTÉE PAR SÉCURITÉ');
    console.log('\n💡 Pour vider la base Render, utilisez une de ces méthodes :');
    console.log('');
    console.log('🔧 Méthode 1 - Directe depuis MongoDB Atlas :');
    console.log('   1. Connectez-vous à MongoDB Atlas');
    console.log('   2. Accédez à votre cluster');
    console.log('   3. Cliquez sur "Collections"');
    console.log('   4. Supprimez les collections une par une');
    console.log('');
    console.log('🔧 Méthode 2 - Script local avec URI de production :');
    console.log('   1. Récupérez l\'URI MongoDB depuis Render Dashboard');
    console.log('   2. Ajoutez-la dans .env : MONGODB_URI_PRODUCTION=...');
    console.log('   3. Exécutez : node scripts/clearRemoteDatabase.js');
    console.log('');
    console.log('🔧 Méthode 3 - Redéploiement Render :');
    console.log('   1. Créez un script de nettoyage dans votre app');
    console.log('   2. Déployez temporairement sur Render');
    console.log('   3. Appelez le script via une route protégée');
    console.log('   4. Supprimez le script après usage');

  } catch (error) {
    console.error('❌ Erreur lors de la connexion à Render :', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Le backend Render pourrait être en veille');
      console.log('   Visitez https://club-pro-commu.onrender.com pour le réveiller');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Vérifiez l\'URL du backend Render');
    }
  }
};

// Instructions d'utilisation
console.log('🌐 SCRIPT D\'ANALYSE DE LA BASE RENDER');
console.log('📊 Ce script analyse mais ne supprime PAS les données');
console.log('🔒 Pour des raisons de sécurité, la suppression doit être faite manuellement');
console.log('');

// Exécuter le script
if (require.main === module) {
  clearRenderDatabase();
}

module.exports = clearRenderDatabase; 