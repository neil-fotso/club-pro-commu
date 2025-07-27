const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Player = require('../models/Player');

const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { pseudo, email, password, plateforme } = req.body;

    // Validation des champs obligatoires
    if (!pseudo || !email || !password || !plateforme) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { pseudo }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? 'Cet email est déjà utilisé.' 
          : 'Ce pseudo est déjà utilisé.' 
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur
    const user = new User({
      pseudo,
      email,
      password: hashedPassword,
      plateforme,
      date: new Date()
    });

    await user.save();

    // Créer automatiquement un profil joueur
    const player = new Player({
      pseudo: user.pseudo,
      userId: user._id,
      postePrincipal: 'Milieu', // Poste par défaut
      postesSecondaires: [],
      age: 25, // Âge par défaut
      pays: 'France', // Pays par défaut
      plateforme: user.plateforme,
      langues: ['Français'],
      description: 'Joueur FIFA Pro Clubs',
      niveau: 'Intermédiaire',
      rechercheClub: true // Par défaut, recherche un club
    });

    await player.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { emailOrPseudo, password } = req.body;

    // Validation des champs obligatoires
    if (!emailOrPseudo || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Chercher l'utilisateur par email ou pseudo
    const user = await User.findOne({
      $or: [
        { email: emailOrPseudo },
        { pseudo: emailOrPseudo }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Email/pseudo ou mot de passe incorrect.' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email/pseudo ou mot de passe incorrect.' });
    }

    // Créer le token JWT
    const payload = {
      id: user._id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            pseudo: user.pseudo,
            email: user.email,
            plateforme: user.plateforme
          }
        });
      }
    );
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router; 