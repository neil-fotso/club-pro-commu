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
    
    // Vérification de la signature Discord (optionnel mais recommandé)
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    
    if (signature && timestamp) {
      console.log('Signature Discord détectée:', { signature, timestamp });
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
        
      case 'GUILD_MEMBER_REMOVE':
        // Membre qui quitte le serveur
        console.log('Membre Discord parti:', data);
        break;
        
      case 'GUILD_ROLE_CREATE':
        // Nouveau rôle créé
        console.log('Nouveau rôle Discord:', data);
        break;
        
      case 'GUILD_ROLE_UPDATE':
        // Rôle modifié
        console.log('Rôle Discord modifié:', data);
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

// Endpoint GET pour la vérification Discord
router.get('/webhook', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Webhook Discord accessible',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 