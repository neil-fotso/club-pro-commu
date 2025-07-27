const express = require('express');
const Player = require('../models/Player');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les joueurs avec filtres
router.get('/', async (req, res) => {
  try {
    const { search, poste, plateforme, age, rechercheClub } = req.query;
    
    let query = {};
    
    // Filtre par recherche (pseudo)
    if (search) {
      query.pseudo = { $regex: search, $options: 'i' };
    }
    
    // Filtre par poste
    if (poste) {
      query.$or = [
        { postePrincipal: poste },
        { postesSecondaires: poste }
      ];
    }
    
    // Filtre par plateforme
    if (plateforme) {
      query.plateforme = plateforme;
    }
    
    // Filtre par âge
    if (age) {
      query.age = { $gte: parseInt(age) };
    }
    
    // Filtre par recherche de club
    if (rechercheClub === 'true') {
      query.rechercheClub = true;
    }
    
    const players = await Player.find(query)
      .populate('userId', 'pseudo email')
      .sort({ dateCreation: -1 });
    
    res.json(players);
  } catch (error) {
    console.error('Erreur recherche joueurs:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer un joueur par ID
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('userId', 'pseudo email plateforme');
    
    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé.' });
    }
    
    res.json(player);
  } catch (error) {
    console.error('Erreur récupération joueur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer le profil joueur de l'utilisateur connecté
router.get('/me/profile', auth, async (req, res) => {
  try {
    let player = await Player.findOne({ userId: req.user.id });
    
    if (!player) {
      // Créer automatiquement un profil joueur basique
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      
      player = new Player({
        pseudo: user.pseudo,
        userId: req.user.id,
        postePrincipal: 'Milieu', // Poste par défaut
        postesSecondaires: [],
        age: 25, // Âge par défaut
        pays: 'France', // Pays par défaut
        plateforme: user.plateforme || 'PS5', // Valeur par défaut si manquante
        langues: ['Français'],
        description: 'Joueur FIFA Pro Clubs',
        niveau: 'Intermédiaire',
        rechercheClub: true // Par défaut, recherche un club
      });
      
      await player.save();
    }
    
    res.json(player);
  } catch (error) {
    console.error('Erreur récupération profil joueur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Créer un profil joueur (pour personnalisation)
router.post('/', auth, async (req, res) => {
  try {
    const { postePrincipal, postesSecondaires, age, pays, langues, description, niveau } = req.body;
    
    // Vérifier si le joueur existe déjà
    const existingPlayer = await Player.findOne({ userId: req.user.id });
    if (existingPlayer) {
      return res.status(400).json({ message: 'Vous avez déjà un profil joueur.' });
    }
    
    // Récupérer les infos de l'utilisateur
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    const player = new Player({
      pseudo: user.pseudo,
      userId: req.user.id,
      postePrincipal,
      postesSecondaires: postesSecondaires || [],
      age,
      pays,
      plateforme: user.plateforme || 'PS5', // Valeur par défaut si manquante
      langues: langues || [],
      description,
      niveau: niveau || 'Intermédiaire'
    });
    
    await player.save();
    
    res.status(201).json(player);
  } catch (error) {
    console.error('Erreur création profil joueur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Mettre à jour un profil joueur
router.put('/:id', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé.' });
    }
    
    // Vérifier que l'utilisateur est propriétaire du profil
    if (player.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }
    
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedPlayer);
  } catch (error) {
    console.error('Erreur mise à jour joueur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router; 