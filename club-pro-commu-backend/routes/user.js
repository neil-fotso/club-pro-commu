const express = require('express');
const User = require('../models/User');
const Player = require('../models/Player');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/user/profile - Récupérer le profil utilisateur
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const player = await Player.findOne({ userId: req.user.id });
    
    res.json({
      user,
      player
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/user/exercise-data-rights - Exercer les droits RGPD
router.post('/exercise-data-rights', auth, async (req, res) => {
  try {
    const { requestType, reason } = req.body;
    
    if (!requestType || !reason) {
      return res.status(400).json({ 
        message: 'Le type de demande et le motif sont requis' 
      });
    }

    // Enregistrer la demande dans les logs (en production, utiliser une base de données)
    console.log(`Demande RGPD - Utilisateur: ${req.user.id}, Type: ${requestType}, Motif: ${reason}`);
    
    // Traitement selon le type de demande
    switch (requestType) {
      case 'access':
        // Droit d'accès - Retourner les données de l'utilisateur
        const user = await User.findById(req.user.id).select('-password');
        const player = await Player.findOne({ userId: req.user.id });
        
        return res.json({
          message: 'Voici vos données personnelles',
          data: {
            user,
            player,
            requestDate: new Date().toISOString(),
            requestType: 'access'
          }
        });

      case 'rectification':
        // Droit de rectification - L'utilisateur peut modifier ses données via les autres endpoints
        return res.json({
          message: 'Vous pouvez modifier vos données via votre profil',
          requestType: 'rectification'
        });

      case 'erasure':
        // Droit d'effacement - Marquer pour suppression (pas de suppression immédiate)
        await User.findByIdAndUpdate(req.user.id, { 
          markedForDeletion: true,
          deletionRequestDate: new Date()
        });
        
        return res.json({
          message: 'Votre demande de suppression a été enregistrée. Vos données seront supprimées dans 30 jours.',
          requestType: 'erasure'
        });

      case 'portability':
        // Droit à la portabilité - Exporter les données
        const userForExport = await User.findById(req.user.id).select('-password');
        const playerForExport = await Player.findOne({ userId: req.user.id });
        
        return res.json({
          message: 'Voici vos données au format JSON pour portabilité',
          data: {
            user: userForExport,
            player: playerForExport,
            exportDate: new Date().toISOString(),
            requestType: 'portability'
          }
        });

      case 'opposition':
        // Droit d'opposition - Limiter le traitement
        await User.findByIdAndUpdate(req.user.id, { 
          processingOpposed: true,
          oppositionDate: new Date()
        });
        
        return res.json({
          message: 'Votre opposition au traitement a été enregistrée.',
          requestType: 'opposition'
        });

      case 'limitation':
        // Limitation du traitement
        await User.findByIdAndUpdate(req.user.id, { 
          processingLimited: true,
          limitationDate: new Date()
        });
        
        return res.json({
          message: 'La limitation du traitement a été appliquée.',
          requestType: 'limitation'
        });

      default:
        return res.status(400).json({ 
          message: 'Type de demande non reconnu' 
        });
    }

  } catch (error) {
    console.error('Erreur exercice droits RGPD:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/user/data-rights-status - Vérifier le statut des droits RGPD
router.get('/data-rights-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('markedForDeletion processingOpposed processingLimited deletionRequestDate oppositionDate limitationDate');
    
    res.json({
      markedForDeletion: user.markedForDeletion || false,
      processingOpposed: user.processingOpposed || false,
      processingLimited: user.processingLimited || false,
      deletionRequestDate: user.deletionRequestDate,
      oppositionDate: user.oppositionDate,
      limitationDate: user.limitationDate
    });
  } catch (error) {
    console.error('Erreur statut droits RGPD:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 