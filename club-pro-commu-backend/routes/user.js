const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Récupérer le profil de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer tous les utilisateurs (TEMPORAIRE - pour debug)
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      count: users.length,
      users: users
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router; 