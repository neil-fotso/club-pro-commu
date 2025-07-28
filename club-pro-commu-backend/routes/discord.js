const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Endpoint pour recevoir les webhooks Discord
router.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook Discord reçu:', req.body);
    
    // Vérification Discord - répondre immédiatement au ping
    if (req.body.type === 'PING') {
      console.log('Ping Discord reçu, réponse PONG');
      return res.status(200).json({ type: 'PONG' });
    }
    
    // Traiter les différents types d'événements Discord
    const { type, data } = req.body;
    
    switch (type) {
      case 'MESSAGE_CREATE':
        // Traiter les nouveaux messages
        console.log('Nouveau message Discord:', data);
        break;
        
      case 'GUILD_MEMBER_ADD':
        // Nouveau membre sur le serveur
        console.log('Nouveau membre Discord:', data);
        break;
        
      default:
        console.log('Événement Discord non géré:', type);
    }
    
    // Réponse par défaut pour les autres événements
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur webhook Discord:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour vérifier la santé du webhook
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Webhook Discord opérationnel',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 