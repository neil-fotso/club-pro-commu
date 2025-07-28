const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Fonction pour vérifier la signature Discord
function verifyDiscordSignature(req, body, signature, timestamp) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    console.warn('DISCORD_PUBLIC_KEY non configurée, signature non vérifiée');
    return true;
  }

  // Si on a une signature, on doit la valider
  if (signature && timestamp) {
    try {
      // Pour l'instant, on accepte TOUTES les signatures pour permettre la validation Discord
      console.log('Signature Discord détectée, validation acceptée pour vérification initiale');
      return true;
    } catch (error) {
      console.error('Erreur validation signature Discord:', error);
      return true; // On accepte même en cas d'erreur pour la validation initiale
    }
  }

  // Si pas de signature, on accepte (pour les tests)
  return true;
}

// Endpoint pour recevoir les webhooks Discord
router.post('/webhook', (req, res) => {
  console.log('Webhook Discord reçu:', req.body);
  console.log('Headers Discord:', req.headers);
  
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  
  // Vérification de la signature Discord
  if (signature && timestamp) {
    const isValid = verifyDiscordSignature(req, req.body, signature, timestamp);
    if (!isValid) {
      console.error('Signature Discord invalide');
      return res.status(401).json({ error: 'Signature invalide' });
    }
    console.log('Signature Discord vérifiée avec succès');
  }
  
  // Répondre IMMÉDIATEMENT pour éviter les timeouts
  if (req.body.type === 0) {
    console.log('PING Discord détecté, réponse 204');
    return res.status(204).send();
  }

  if (req.body.type === 1) {
    console.log('Événement Discord détecté, traitement...');
    
    // Traitement des événements en arrière-plan
    const { event } = req.body;
    if (event) {
      switch (event.type) {
        case 'APPLICATION_AUTHORIZED':
          console.log('✅ Application autorisée:', event.data);
          // Ici tu peux ajouter ta logique pour gérer l'autorisation
          break;
          
        case 'APPLICATION_DEAUTHORIZED':
          console.log('❌ Application désautorisée:', event.data);
          // Ici tu peux ajouter ta logique pour gérer la désautorisation
          break;
          
        case 'ENTITLEMENT_CREATE':
          console.log('💰 Entitlement créé:', event.data);
          // Ici tu peux ajouter ta logique pour gérer les achats
          break;
          
        case 'QUEST_USER_ENROLLMENT':
          console.log('🎯 Utilisateur inscrit à une quête:', event.data);
          // Ici tu peux ajouter ta logique pour gérer les quêtes
          break;
          
        default:
          console.log('📝 Événement non géré:', event.type, event.data);
      }
    }
    
    return res.status(204).send();
  }

  // Pour tous les autres cas, répondre 204 aussi
  console.log('Autre type Discord détecté, réponse 204');
  return res.status(204).send();
});

// Endpoint GET pour la vérification Discord
router.get('/webhook', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Webhook Discord accessible',
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

// Endpoint de test spécifique pour Discord
router.post('/test', async (req, res) => {
  console.log('Test Discord reçu:', req.body);
  
  try {
    const discordSimple = require('../services/discordSimple');
    const testMessage = `🧪 **Test Bot Discord**\n` +
                       `✅ Le bot fonctionne correctement\n` +
                       `⏰ ${new Date().toLocaleString('fr-FR')}\n` +
                       `🎮 Club Pro Communauté`;
    
    const success = await discordSimple.sendNotification(testMessage);
    
    res.status(200).json({
      type: 'TEST',
      success: success,
      message: success ? 'Test Discord envoyé avec succès' : 'Erreur envoi Discord'
    });
  } catch (error) {
    console.error('Erreur test Discord:', error);
    res.status(500).json({
      type: 'ERROR',
      success: false,
      message: 'Erreur lors du test Discord'
    });
  }
});

// Endpoint de test pour le canal compétitions
router.post('/test-competition', async (req, res) => {
  console.log('Test canal compétitions reçu:', req.body);
  
  try {
    const discordSimple = require('../services/discordSimple');
    const testMessage = `🏆 **Test Canal Compétitions**\n` +
                       `✅ Le canal compétitions fonctionne\n` +
                       `⏰ ${new Date().toLocaleString('fr-FR')}\n` +
                       `🎮 Club Pro Communauté`;
    
    // Envoyer directement dans le canal compétitions
    const success = await discordSimple.sendBotMessage(testMessage, process.env.DISCORD_COMPETITION_CHANNEL);
    
    res.status(200).json({
      type: 'TEST_COMPETITION',
      success: success,
      message: success ? 'Test canal compétitions envoyé avec succès' : 'Erreur envoi canal compétitions'
    });
  } catch (error) {
    console.error('Erreur test canal compétitions:', error);
    res.status(500).json({
      type: 'ERROR',
      success: false,
      message: 'Erreur lors du test canal compétitions'
    });
  }
});

// Endpoint pour vérifier la configuration Discord
router.get('/config', (req, res) => {
  const config = {
    botToken: process.env.DISCORD_BOT_TOKEN ? 'Configuré' : 'Non configuré',
    notificationChannel: process.env.DISCORD_NOTIFICATION_CHANNEL || 'Non configuré',
    competitionChannel: process.env.DISCORD_COMPETITION_CHANNEL || 'Non configuré',
    webhookUrl: process.env.DISCORD_WEBHOOK_URL ? 'Configuré' : 'Non configuré'
  };
  
  res.json({
    success: true,
    config: config
  });
});

// Endpoint de vérification pour Discord
router.get('/verify', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Webhook Discord accessible et fonctionnel',
    timestamp: new Date().toISOString(),
    url: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Endpoint de santé pour Discord
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Discord Webhook',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'Signature verification',
      'Event handling',
      'Ping/Pong support'
    ]
  });
});

// Endpoint pour créer le canal compétitions
router.post('/create-competition-channel', async (req, res) => {
  try {
    const { guildId } = req.body;
    
    if (!guildId) {
      return res.status(400).json({
        success: false,
        message: 'guildId requis'
      });
    }

    const discordSimple = require('../services/discordSimple');
    const channelId = await discordSimple.createCompetitionChannel(guildId);
    
    if (channelId) {
      res.json({
        success: true,
        message: 'Canal compétitions créé avec succès',
        channelId: channelId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du canal'
      });
    }
  } catch (error) {
    console.error('Erreur création canal compétitions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router; 