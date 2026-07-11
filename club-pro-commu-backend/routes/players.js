const express = require('express');
const Player = require('../models/Player');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// GET /api/players - Recherche avancée des joueurs
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      pseudo,
      pseudoPlateforme,
      pays,
      plateforme,
      position,

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
    if (pseudoPlateforme) {
      query.pseudoPlateforme = { $regex: pseudoPlateforme, $options: 'i' };
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

    // Log de la base de données utilisée
    console.log('🔍 Route /api/players - Recherche des joueurs');
    console.log('   Base de données Player:', Player.db.name);
    console.log('   Base de données User:', User.db.name);
    console.log('   Requête:', JSON.stringify(query, null, 2));

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
    // - Disponibilité
    const recommendations = await Player.find({
      userId: { $ne: req.user.id },
      plateforme: currentPlayer.plateforme,
      disponibilite: 'Disponible'
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



// Fonction helper pour calculer le palmarès d'un joueur
async function getPlayerPalmares(player) {
  const Competition = require('../models/Competition');
  
  // 1. Récupérer les trophées collectifs via ses clubs
  const clubIds = player.clubs ? player.clubs.map(c => c.clubId) : [];
  let clubsTrophees = [];
  
  if (clubIds.length > 0) {
    clubsTrophees = await Competition.find({
      statut: 'Terminé',
      $or: [
        { gagnant: { $in: clubIds } },
        { finaliste: { $in: clubIds } },
        { troisieme: { $in: clubIds } }
      ]
    }).populate('gagnant finaliste troisieme', 'nom');
  }

  // 2. Récupérer les récompenses individuelles
  const individuelTrophees = await Competition.find({
    statut: 'Terminé',
    $or: [
      { 'statistiques.meilleurButeur.joueur': player.pseudo },
      { 'statistiques.meilleurPasseur.joueur': player.pseudo },
      { 'statistiques.meilleurJoueur.joueur': player.pseudo }
    ]
  });

  const palmares = {
    clubs: clubsTrophees.map(comp => {
      let typeTrophée = '';
      let clubNom = '';
      if (comp.gagnant && clubIds.some(id => id.toString() === comp.gagnant._id.toString())) {
        typeTrophée = 'vainqueur';
        clubNom = comp.gagnant.nom;
      } else if (comp.finaliste && clubIds.some(id => id.toString() === comp.finaliste._id.toString())) {
        typeTrophée = 'finaliste';
        clubNom = comp.finaliste.nom;
      } else if (comp.troisieme && clubIds.some(id => id.toString() === comp.troisieme._id.toString())) {
        typeTrophée = 'troisieme';
        clubNom = comp.troisieme.nom;
      }
      return {
        _id: comp._id,
        nom: comp.nom,
        type: comp.type,
        typeTrophée,
        clubNom,
        date: comp.dateDebut
      };
    }),
    individuel: []
  };

  individuelTrophees.forEach(comp => {
    if (comp.statistiques?.meilleurButeur?.joueur === player.pseudo) {
      palmares.individuel.push({
        nom: 'Soulier d\'Or ⚽',
        description: `Meilleur Buteur de la compétition "${comp.nom}" avec ${comp.statistiques.meilleurButeur.buts} buts.`,
        date: comp.dateDebut,
        competitionId: comp._id
      });
    }
    if (comp.statistiques?.meilleurPasseur?.joueur === player.pseudo) {
      palmares.individuel.push({
        nom: 'Meilleur Passeur 🅰️',
        description: `Meilleur Passeur de la compétition "${comp.nom}" avec ${comp.statistiques.meilleurPasseur.passes} passes décisives.`,
        date: comp.dateDebut,
        competitionId: comp._id
      });
    }
    if (comp.statistiques?.meilleurJoueur?.joueur === player.pseudo) {
      palmares.individuel.push({
        nom: 'MVP de la Compétition 🌟',
        description: `Élu Meilleur Joueur de la compétition "${comp.nom}".`,
        date: comp.dateDebut,
        competitionId: comp._id
      });
    }
  });

  return palmares;
}

// GET /api/players/me - Récupérer mon profil joueur
router.get('/me', auth, async (req, res) => {
  try {
    const player = await Player.findOne({ userId: req.user.id });
    
    if (!player) {
      return res.status(404).json({ message: 'Profil joueur non trouvé' });
    }

    // Ajouter les statistiques calculées
    const playerObj = player.toObject();
    playerObj.winRate = player.winRate;
    playerObj.goalsPerMatch = player.goalsPerMatch;
    playerObj.assistsPerMatch = player.assistsPerMatch;

    // Ajouter le palmarès
    playerObj.palmares = await getPlayerPalmares(player);

    res.json(playerObj);
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/players/:id - Récupérer un joueur spécifique
router.get('/:id', async (req, res) => {
  try {
    let player;
    
    // D'abord essayer de trouver par ID direct du joueur
    player = await Player.findById(req.params.id)
      .populate('userId', 'pseudo email');

    // Si pas trouvé, essayer de trouver par userId
    if (!player) {
      player = await Player.findOne({ userId: req.params.id })
        .populate('userId', 'pseudo email');
    }

    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé' });
    }

    // Ajouter les statistiques calculées
    const playerObj = player.toObject();
    playerObj.winRate = player.winRate;
    playerObj.goalsPerMatch = player.goalsPerMatch;
    playerObj.assistsPerMatch = player.assistsPerMatch;

    // Ajouter le palmarès
    playerObj.palmares = await getPlayerPalmares(player);

    res.json(playerObj);
  } catch (error) {
    console.error('Erreur récupération joueur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/players/:id - Mettre à jour le profil joueur
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('🔄 Mise à jour profil - ID:', req.params.id);
    console.log('🔄 Données reçues:', req.body);
    console.log('🔄 Utilisateur connecté:', req.user.id);
    
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      console.log('❌ Joueur non trouvé');
      return res.status(404).json({ message: 'Joueur non trouvé' });
    }

    console.log('✅ Joueur trouvé:', player.pseudo);
    console.log('🔍 Vérification autorisation - Player userId:', player.userId.toString());
    console.log('🔍 Vérification autorisation - User connecté:', req.user.id);

    // Vérifier que l'utilisateur modifie son propre profil
    if (player.userId.toString() !== req.user.id) {
      console.log('❌ Non autorisé - userId ne correspond pas');
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Mise à jour des champs autorisés
    const allowedUpdates = [
      'pseudo', 'photoProfil', 'age', 'pays', 'nationalite', 'ville',
      'plateforme', 'position', 'postePrincipal', 'postesSecondaires', 
      'bio', 'description', 'horaires', 'jeux', 'reseauxSociaux', 'preferences',
      'langues', 'rechercheClub'
    ];

    console.log('📝 Mise à jour des champs autorisés...');
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        console.log(`📝 Mise à jour ${field}:`, req.body[field]);
        player[field] = req.body[field];
      }
    });

    // Mettre à jour l'activité
    player.derniereActivite = new Date();
    console.log('📝 Mise à jour dernière activité:', player.derniereActivite);

    console.log('💾 Sauvegarde du joueur...');
    await player.save();
    console.log('✅ Joueur sauvegardé avec succès');
    
    // Calculer automatiquement la disponibilité
    console.log('🔄 Calcul automatique de la disponibilité...');
    await player.calculateDisponibilite();
    console.log('✅ Disponibilité mise à jour:', player.disponibilite);

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

// POST /api/players/recalculate-availability - Recalculer la disponibilité de tous les joueurs
router.post('/recalculate-availability', auth, async (req, res) => {
  try {
    console.log('🔄 Recalcul de la disponibilité pour tous les joueurs...');
    
    const players = await Player.find({});
    let updatedCount = 0;
    
    for (const player of players) {
      const oldDisponibilite = player.disponibilite;
      await player.calculateDisponibilite();
      
      if (oldDisponibilite !== player.disponibilite) {
        updatedCount++;
        console.log(`📝 ${player.pseudo}: ${oldDisponibilite} → ${player.disponibilite}`);
      }
    }
    
    console.log(`✅ ${updatedCount} joueurs mis à jour`);
    res.json({ 
      message: `Disponibilité recalculée pour ${updatedCount} joueurs`,
      updatedCount 
    });
  } catch (error) {
    console.error('Erreur recalcul disponibilité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/players/:id - Supprimer un joueur (admin uniquement)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé' });
    }

    // Supprimer le joueur
    await Player.findByIdAndDelete(req.params.id);
    
    // Optionnel : supprimer aussi l'utilisateur associé
    if (player.userId) {
      await User.findByIdAndDelete(player.userId);
    }

    res.json({ message: 'Joueur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression joueur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 