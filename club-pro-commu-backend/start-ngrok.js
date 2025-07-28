const ngrok = require('ngrok');

async function startNgrok() {
  try {
    console.log('🚀 Démarrage du tunnel ngrok...');
    
    const url = await ngrok.connect({
      addr: 3001, // Port du serveur backend
      authtoken: process.env.NGROK_AUTH_TOKEN // Optionnel, pour plus de stabilité
    });
    
    console.log('✅ Tunnel ngrok actif !');
    console.log('🌐 URL publique:', url);
    console.log('🔗 Endpoint Discord:', `${url}/api/discord/webhook`);
    console.log('🏥 Health check:', `${url}/api/discord/health`);
    console.log('');
    console.log('📋 Copie cette URL dans Discord Developer Portal :');
    console.log('   → Onglet "Webhooks"');
    console.log('   → "New Webhook"');
    console.log('   → Endpoint URL:', `${url}/api/discord/webhook`);
    console.log('');
    console.log('⚠️  Garde cette fenêtre ouverte pour maintenir le tunnel actif');
    
  } catch (error) {
    console.error('❌ Erreur ngrok:', error);
  }
}

startNgrok(); 