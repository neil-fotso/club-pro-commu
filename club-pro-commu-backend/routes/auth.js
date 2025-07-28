const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Player = require('../models/Player');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - Inscription avec création automatique du profil joueur
router.post('/register', async (req, res) => {
  try {
    const {
      pseudo,
      email,
      password,
      age,
      pays,
      nationalite,
      ville,
      plateforme,
      position,
      niveau = 'Intermédiaire',
      bio = ''
    } = req.body;

    // Validation des champs obligatoires
    if (!pseudo || !email || !password || !pays || !plateforme || !position) {
      return res.status(400).json({
        message: 'Pseudo, email, mot de passe, pays, plateforme et position sont obligatoires'
      });
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Format d\'email invalide'
      });
    }

    // Validation de l'âge
    if (age && (age < 13 || age > 100)) {
      return res.status(400).json({
        message: 'L\'âge doit être entre 13 et 100 ans'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Vérifier si le pseudo existe déjà
    const existingPlayer = await Player.findOne({ pseudo });
    if (existingPlayer) {
      return res.status(400).json({
        message: 'Ce pseudo est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const user = new User({
      pseudo,
      email: email.toLowerCase(),
      password: hashedPassword,
      dateCreation: new Date()
    });

    await user.save();

    // Créer automatiquement le profil joueur
    const player = new Player({
      userId: user._id,
      pseudo,
      age: age ? parseInt(age) : undefined,
      pays,
      nationalite: nationalite || '',
      ville: ville || '',
      plateforme,
      position,
      niveau,
      bio,
      disponibilite: 'Disponible',
      derniereActivite: new Date(),
      preferences: {
        langue: 'Français',
        fuseauHoraire: 'Europe/Paris',
        notifications: {
          email: true,
          push: true,
          discord: true
        },
        visibilite: {
          profil: 'Public',
          statistiques: 'Public',
          disponibilite: 'Public'
        }
      },
      statistiques: {
        matchsJoues: 0,
        victoires: 0,
        defaites: 0,
        nuls: 0,
        butsMarques: 0,
        butsEncaisses: 0,
        passesDecisives: 0,
        cleanSheets: 0
      }
    });

    await player.save();

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, pseudo: user.pseudo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner les données utilisateur (sans mot de passe)
    const userResponse = {
      _id: user._id,
      pseudo: user.pseudo,
      email: user.email,
      dateCreation: user.dateCreation,
      token
    };

    res.status(201).json({
      message: 'Inscription réussie',
      user: userResponse,
      player: {
        _id: player._id,
        pseudo: player.pseudo,
        plateforme: player.plateforme,
        position: player.position,
        niveau: player.niveau,
        disponibilite: player.disponibilite
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Récupérer le profil joueur
    const player = await Player.findOne({ userId: user._id });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, pseudo: user.pseudo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Mettre à jour la dernière activité
    if (player) {
      player.derniereActivite = new Date();
      await player.save();
    }

    // Retourner les données utilisateur
    const userResponse = {
      _id: user._id,
      pseudo: user.pseudo,
      email: user.email,
      dateCreation: user.dateCreation,
      token
    };

    res.json({
      message: 'Connexion réussie',
      user: userResponse,
      player: player ? {
        _id: player._id,
        pseudo: player.pseudo,
        plateforme: player.plateforme,
        position: player.position,
        niveau: player.niveau,
        disponibilite: player.disponibilite
      } : null
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/auth/me - Récupérer les données de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer le profil joueur
    const player = await Player.findOne({ userId: req.user.id });

    res.json({
      user,
      player: player ? {
        _id: player._id,
        pseudo: player.pseudo,
        plateforme: player.plateforme,
        position: player.position,
        niveau: player.niveau,
        disponibilite: player.disponibilite,
        derniereActivite: player.derniereActivite
      } : null
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/auth/change-password - Changer le mot de passe
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Ancien et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier l'ancien mot de passe
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Ancien mot de passe incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 