const express = require('express');
const Player = require('../models/Player');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/players - Recherche avancée des joueurs
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      pseudo,
      pays,
      plateforme,
      position,
      niveau,
      disponibilite,
      ageMin,
      ageMax,
      experienceMin,
      experienceMax,
      matchsMin,
      winRateMin,
      langue,
      tri = 'derniereActivite',
      ordre = 'desc'
    } = req.query;

    // Construction de la requête
    const query = {};

    // Filtres de base
    if (pseudo) {
      query.pseudo = { $regex: pseudo, $options: 'i' };
    }
    if (pays) {
      query.pays = pays;
    }
    if (plateforme) {
      query.plateforme = plateforme;
    }
    if (position) {
      query.position = position;
    }
    if (niveau) {
      query.niveau = niveau;
    }
    if (disponibilite) {
      query.disponibilite = disponibilite;
    }
    if (langue) {
      query['preferences.langue'] = langue;
    }

    // Filtres numériques
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin);
      if (ageMax) query.age.$lte = parseInt(ageMax);
    }

    if (experienceMin || experienceMax) {
      query.experience = {};
      if (experienceMin) query.experience.$gte = parseInt(experienceMin);
      if (experienceMax) query.experience.$lte = parseInt(experienceMax);
    }

    if (matchsMin) {
      query['statistiques.matchsJoues'] = { $gte: parseInt(matchsMin) };
    }

    // Tri
    let sortOptions = {};
    switch (tri) {
      case 'pseudo':
        sortOptions.pseudo = ordre === 'desc' ? -1 : 1;
        break;
      case 'niveau':
        sortOptions.niveau = ordre === 'desc' ? -1 : 1;
        break;
      case 'experience':
        sortOptions.experience = ordre === 'desc' ? -1 : 1;
        break;
      case 'matchsJoues':
        sortOptions['statistiques.matchsJoues'] = ordre === 'desc' ? -1 : 1;
        break;
      case 'winRate':
        // Pour le win rate, on doit calculer après
        break;
      case 'derniereActivite':
      default:
        sortOptions.derniereActivite = ordre === 'desc' ? -1 : 1;
        break;
    }

    // Exécution de la requête
    const players = await Player.find(query)
      .populate('userId', 'pseudo email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Calcul du win rate si demandé
    if (tri === 'winRate') {
      players.sort((a, b) => {
        const winRateA = a.winRate || 0;
        const winRateB = b.winRate || 0;
        return ordre === 'desc' ? winRateB - winRateA : winRateA - winRateB;
      });
    }

    // Filtre par win rate si spécifié
    let filteredPlayers = players;
    if (winRateMin) {
      filteredPlayers = players.filter(player => (player.winRate || 0) >= parseInt(winRateMin));
    }

    // Compter le total
    const total = await Player.countDocuments(query);

    // Ajouter les statistiques calculées
    const playersWithStats = filteredPlayers.map(player => {
      const playerObj = player.toObject();
      playerObj.winRate = player.winRate;
      playerObj.goalsPerMatch = player.goalsPerMatch;
      playerObj.assistsPerMatch = player.assistsPerMatch;
      return playerObj;
    });

    res.json({
      players: playersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPlayers: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Erreur recherche joueurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/players/recommendations - Recommandations de joueurs
router.get('/recommendations', auth, async (req, res) => {
  try {
    console.log('🔍 Recherche de recommandations pour l\'utilisateur:', req.user.id);
    
    const currentPlayer = await Player.findOne({ userId: req.user.id });
    
    if (!currentPlayer) {
      console.log('⚠️ Aucun profil joueur trouvé pour l\'utilisateur:', req.user.id);
      // Retourner des recommandations basiques si pas de profil
      const basicRecommendations = await Player.find({
        userId: { $ne: req.user.id },
        disponibilite: 'Disponible'
      })
      .populate('userId', 'pseudo')
      .limit(10)
      .sort({ derniereActivite: -1 });

      return res.json(basicRecommendations);
    }

    console.log('✅ Profil joueur trouvé:', currentPlayer.pseudo);

    // Logique de recommandation basée sur :
    // - Même plateforme
    // - Positions complémentaires
    // - Niveau similaire
    // - Disponibilité
    const recommendations = await Player.find({
      userId: { $ne: req.user.id },
      plateforme: currentPlayer.plateforme,
      disponibilite: 'Disponible',
      niveau: { $in: [currentPlayer.niveau, ...getNiveauProche(currentPlayer.niveau)] }
    })
    .populate('userId', 'pseudo')
    .limit(10)
    .sort({ derniereActivite: -1 });

    console.log(`✅ ${recommendations.length} recommandations trouvées`);
    res.json(recommendations);
  } catch (error) {
    console.error('❌ Erreur recommandations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Fonction helper pour les niveaux proches
function getNiveauProche(niveau) {
  const niveaux = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert', 'Pro'];
  const index = niveaux.indexOf(niveau);
  const proches = [];
  
  if (index > 0) proches.push(niveaux[index - 1]);
  if (index < niveaux.length - 1) proches.push(niveaux[index + 1]);
  
  return proches;
}

// GET /api/players/:id - Récupérer un joueur spécifique
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('userId', 'pseudo email');

    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé' });
    }

    // Ajouter les statistiques calculées
    const playerObj = player.toObject();
    playerObj.winRate = player.winRate;
    playerObj.goalsPerMatch = player.goalsPerMatch;
    playerObj.assistsPerMatch = player.assistsPerMatch;

    res.json(playerObj);
  } catch (error) {
    console.error('Erreur récupération joueur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/players/:id - Mettre à jour le profil joueur
router.put('/:id', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé' });
    }

    // Vérifier que l'utilisateur modifie son propre profil
    if (player.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Mise à jour des champs autorisés
    const allowedUpdates = [
      'pseudo', 'photoProfil', 'age', 'pays', 'nationalite', 'ville',
      'plateforme', 'position', 'niveau', 'bio', 'disponibilite',
      'horaires', 'jeux', 'reseauxSociaux', 'preferences'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        player[field] = req.body[field];
      }
    });

    // Mettre à jour l'activité
    player.derniereActivite = new Date();

    await player.save();

    // Ajouter les statistiques calculées
    const playerObj = player.toObject();
    playerObj.winRate = player.winRate;
    playerObj.goalsPerMatch = player.goalsPerMatch;
    playerObj.assistsPerMatch = player.assistsPerMatch;

    res.json(playerObj);
  } catch (error) {
    console.error('Erreur mise à jour joueur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/players/:id/statistics - Ajouter des statistiques
router.post('/:id/statistics', auth, async (req, res) => {
  try {
    const { type, value = 1 } = req.body;
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé' });
    }

    await player.addStatistic(type, value);
    res.json({ message: 'Statistique mise à jour' });
  } catch (error) {
    console.error('Erreur mise à jour statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/players/:id/rewards - Ajouter une récompense
router.post('/:id/rewards', auth, async (req, res) => {
  try {
    const { nom, description, type } = req.body;
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé' });
    }

    const reward = { nom, description, type };
    await player.addReward(reward);
    res.json({ message: 'Récompense ajoutée' });
  } catch (error) {
    console.error('Erreur ajout récompense:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 