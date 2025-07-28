const localtunnel = require('localtunnel');

async function startTunnel() {
  try {
    console.log('🚀 Démarrage du tunnel localtunnel...');
    
    const tunnel = await localtunnel({
      port: 3001,
      subdomain: 'club-pro-commu' // Optionnel, pour une URL plus stable
    });
    
    console.log('✅ Tunnel localtunnel actif !');
    console.log('🌐 URL publique:', tunnel.url);
    console.log('🔗 Endpoint Discord:', `${tunnel.url}/api/discord/webhook`);
    console.log('🏥 Health check:', `${tunnel.url}/api/discord/health`);
    console.log('');
    console.log('📋 Copie cette URL dans Discord Developer Portal :');
    console.log('   → Onglet "Webhooks"');
    console.log('   → "New Webhook"');
    console.log('   → Endpoint URL:', `${tunnel.url}/api/discord/webhook`);
    console.log('');
    console.log('⚠️  Garde cette fenêtre ouverte pour maintenir le tunnel actif');
    
    // Gérer la fermeture du tunnel
    tunnel.on('close', () => {
      console.log('❌ Tunnel fermé');
    });
    
    tunnel.on('error', (err) => {
      console.error('❌ Erreur tunnel:', err);
    });
    
  } catch (error) {
    console.error('❌ Erreur localtunnel:', error);
  }
}

startTunnel(); 