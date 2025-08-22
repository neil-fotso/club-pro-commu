const express = require('express');
const router = express.Router();
const Competition = require('../models/Competition');
const Club = require('../models/Club');
const User = require('../models/User');
const Player = require('../models/Player');
const Notification = require('../models/Notification');
const adminAuth = require('../middleware/adminAuth');

// 📊 Dashboard principal - Statistiques générales
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    console.log('📊 Récupération des statistiques dashboard admin');

    // Statistiques générales
    const totalUsers = await User.countDocuments();
    const totalClubs = await Club.countDocuments();
    const totalPlayers = await Player.countDocuments();
    const totalCompetitions = await Competition.countDocuments();

    // Utilisateurs par statut
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const activeUsers = await User.countDocuments({ 
      derniereActivite: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    // Compétitions par statut
    const competitionsParStatut = await Competition.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    // Compétitions par type
    const competitionsParType = await Competition.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Clubs par pays
    const clubsParPays = await Club.aggregate([
      { $group: { _id: '$pays', count: { $sum: 1 } } }
    ]);

    // Matchs totaux et terminés
    const competitions = await Competition.find();
    let totalMatchs = 0;
    let matchsTermines = 0;
    let matchsEnLitige = 0;

    competitions.forEach(comp => {
      // Matchs de poules
      if (comp.poules) {
        comp.poules.forEach(poule => {
          if (poule.matchs) {
            totalMatchs += poule.matchs.length;
            matchsTermines += poule.matchs.filter(m => m.statut === 'Terminé').length;
            matchsEnLitige += poule.matchs.filter(m => m.litige).length;
          }
        });
      }
      
      // Matchs d'élimination
      if (comp.matchsElimination) {
        totalMatchs += comp.matchsElimination.length;
        matchsTermines += comp.matchsElimination.filter(m => m.statut === 'Terminé').length;
        matchsEnLitige += comp.matchsElimination.filter(m => m.litige).length;
      }
    });

    // Notifications non lues
    const notificationsNonLues = await Notification.countDocuments({ lu: false });

    // Activité récente (7 derniers jours)
    const dateActivite = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const nouvellesInscriptions = await User.countDocuments({ 
      dateCreation: { $gte: dateActivite } 
    });
    const nouveauxClubs = await Club.countDocuments({ 
      dateCreation: { $gte: dateActivite } 
    });
    const nouvellesCompetitions = await Competition.countDocuments({ 
      dateCreation: { $gte: dateActivite } 
    });

    // Classement des clubs les plus actifs
    const clubsActifs = await Club.find()
      .populate('membres.userId', 'pseudo derniereActivite')
      .sort({ 'membres.length': -1 })
      .limit(10);

    const stats = {
      generales: {
        totalUsers,
        totalClubs,
        totalPlayers,
        totalCompetitions,
        adminUsers,
        activeUsers,
        notificationsNonLues
      },
      matchs: {
        totalMatchs,
        matchsTermines,
        matchsEnCours: totalMatchs - matchsTermines,
        matchsEnLitige,
        tauxCompletion: totalMatchs > 0 ? Math.round((matchsTermines / totalMatchs) * 100) : 0
      },
      repartitions: {
        competitionsParStatut: competitionsParStatut.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        competitionsParType: competitionsParType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        clubsParPays: clubsParPays.reduce((acc, item) => {
          acc[item._id || 'Non défini'] = item.count;
          return acc;
        }, {})
      },
      activiteRecente: {
        nouvellesInscriptions,
        nouveauxClubs,
        nouvellesCompetitions,
        periode: '7 derniers jours'
      },
      clubsActifs: clubsActifs.map(club => ({
        id: club._id,
        nom: club.nom,
        membres: club.membres.length,
        pays: club.pays,
        dateCreation: club.dateCreation
      }))
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// 🏆 Gestion des compétitions - Vue d'ensemble
router.get('/dashboard/competitions', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, statut, type, search } = req.query;
    
    // Construire le filtre
    const filter = {};
    if (statut && statut !== 'all') filter.statut = statut;
    if (type && type !== 'all') filter.type = type;
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Récupérer les compétitions avec pagination
    const competitions = await Competition.find(filter)
      .populate('createurId', 'pseudo email')
      .populate('equipesInscrites.clubId', 'nom')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCompetitions = await Competition.countDocuments(filter);

    // Enrichir avec les statistiques de matchs
    const competitionsEnrichies = competitions.map(comp => {
      let totalMatchs = 0;
      let matchsTermines = 0;
      let matchsEnLitige = 0;

      // Compter les matchs de poules
      if (comp.poules) {
        comp.poules.forEach(poule => {
          if (poule.matchs) {
            totalMatchs += poule.matchs.length;
            matchsTermines += poule.matchs.filter(m => m.statut === 'Terminé').length;
            matchsEnLitige += poule.matchs.filter(m => m.litige).length;
          }
        });
      }

      // Compter les matchs d'élimination
      if (comp.matchsElimination) {
        totalMatchs += comp.matchsElimination.length;
        matchsTermines += comp.matchsElimination.filter(m => m.statut === 'Terminé').length;
        matchsEnLitige += comp.matchsElimination.filter(m => m.litige).length;
      }

      return {
        ...comp.toObject(),
        statistiques: {
          totalMatchs,
          matchsTermines,
          matchsEnCours: totalMatchs - matchsTermines,
          matchsEnLitige,
          tauxCompletion: totalMatchs > 0 ? Math.round((matchsTermines / totalMatchs) * 100) : 0,
          nombreEquipes: comp.equipesInscrites.length
        }
      };
    });

    res.json({
      success: true,
      data: {
        competitions: competitionsEnrichies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCompetitions / limit),
          totalItems: totalCompetitions,
          hasNext: page < Math.ceil(totalCompetitions / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des compétitions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des compétitions'
    });
  }
});

// 🏟️ Gestion des clubs
router.get('/dashboard/clubs', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, pays, search } = req.query;
    
    const filter = {};
    if (pays && pays !== 'all') filter.pays = pays;
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const clubs = await Club.find(filter)
      .populate('membres.userId', 'pseudo email derniereActivite')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalClubs = await Club.countDocuments(filter);

    // Enrichir avec les statistiques
    const clubsEnrichis = clubs.map(club => ({
      ...club.toObject(),
      statistiques: {
        nombreMembres: club.membres.length,
        nombreAdmins: club.membres.filter(m => m.role === 'Admin').length,
        membresActifs: club.membres.filter(m => 
          m.userId.derniereActivite && 
          new Date(m.userId.derniereActivite) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length
      }
    }));

    res.json({
      success: true,
      data: {
        clubs: clubsEnrichis,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalClubs / limit),
          totalItems: totalClubs,
          hasNext: page < Math.ceil(totalClubs / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des clubs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clubs'
    });
  }
});

// 👥 Gestion des utilisateurs
router.get('/dashboard/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, active, search } = req.query;
    
    const filter = {};
    if (role === 'admin') filter.isAdmin = true;
    if (role === 'user') filter.isAdmin = false;
    
    if (active === 'true') {
      filter.derniereActivite = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (active === 'false') {
      filter.$or = [
        { derniereActivite: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        { derniereActivite: { $exists: false } }
      ];
    }
    
    if (search) {
      filter.$or = [
        { pseudo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalItems: totalUsers,
          hasNext: page < Math.ceil(totalUsers / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

// ⚖️ Gestion des litiges
router.get('/dashboard/litiges', adminAuth, async (req, res) => {
  try {
    console.log('⚖️ Récupération des matchs en litige');

    const competitions = await Competition.find()
      .populate('equipesInscrites.clubId', 'nom')
      .populate('createurId', 'pseudo email');

    const litiges = [];

    // Parcourir toutes les compétitions pour trouver les litiges
    competitions.forEach(comp => {
      // Litiges dans les matchs de poules
      if (comp.poules) {
        comp.poules.forEach((poule, pouleIndex) => {
          if (poule.matchs) {
            poule.matchs.forEach((match, matchIndex) => {
              if (match.litige) {
                litiges.push({
                  competitionId: comp._id,
                  competitionNom: comp.nom,
                  competitionCreateur: comp.createurId,
                  type: 'poule',
                  pouleNom: poule.nom,
                  matchIndex: matchIndex,
                  match: {
                    ...match,
                    equipe1Nom: comp.equipesInscrites.find(e => 
                      e.clubId._id.toString() === match.equipe1.toString()
                    )?.clubId.nom || 'Équipe 1',
                    equipe2Nom: comp.equipesInscrites.find(e => 
                      e.clubId._id.toString() === match.equipe2.toString()
                    )?.clubId.nom || 'Équipe 2'
                  }
                });
              }
            });
          }
        });
      }

      // Litiges dans les matchs d'élimination
      if (comp.matchsElimination) {
        comp.matchsElimination.forEach((match, matchIndex) => {
          if (match.litige) {
            litiges.push({
              competitionId: comp._id,
              competitionNom: comp.nom,
              competitionCreateur: comp.createurId,
              type: 'elimination',
              phase: match.phase,
              matchIndex: matchIndex,
              match: {
                ...match,
                equipe1Nom: comp.equipesInscrites.find(e => 
                  e.clubId._id.toString() === match.equipe1.toString()
                )?.clubId.nom || 'Équipe 1',
                equipe2Nom: comp.equipesInscrites.find(e => 
                  e.clubId._id.toString() === match.equipe2.toString()
                )?.clubId.nom || 'Équipe 2'
              }
            });
          }
        });
      }
    });

    res.json({
      success: true,
      data: {
        litiges: litiges.sort((a, b) => new Date(b.match.dateMatch) - new Date(a.match.dateMatch)),
        total: litiges.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des litiges:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des litiges'
    });
  }
});

// 🔧 Actions administratives
router.post('/dashboard/competition/:id/action', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const competition = await Competition.findById(id);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Compétition non trouvée'
      });
    }

    switch (action) {
      case 'suspend':
        competition.statut = 'Archivé';
        break;
      case 'resume':
        competition.statut = 'En cours';
        break;
      case 'delete':
        await Competition.findByIdAndDelete(id);
        return res.json({
          success: true,
          message: 'Compétition supprimée avec succès'
        });
      case 'force_end':
        competition.statut = 'Terminé';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Action non reconnue'
        });
    }

    await competition.save();

    // Log de l'action administrative
    console.log(`🔧 Action admin: ${action} sur compétition ${competition.nom} par ${req.user.pseudo}. Raison: ${reason}`);

    res.json({
      success: true,
      message: `Action ${action} effectuée avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de l\'action administrative:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'action administrative'
    });
  }
});

// 📈 Statistiques d'activité par période
router.get('/dashboard/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Nouvelles inscriptions par jour
    const inscriptionsParJour = await User.aggregate([
      {
        $match: {
          dateCreation: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$dateCreation" 
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Nouveaux clubs par jour
    const clubsParJour = await Club.aggregate([
      {
        $match: {
          dateCreation: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$dateCreation" 
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Nouvelles compétitions par jour
    const competitionsParJour = await Competition.aggregate([
      {
        $match: {
          dateCreation: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$dateCreation" 
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period: `${days} derniers jours`,
        inscriptionsParJour,
        clubsParJour,
        competitionsParJour
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analytics'
    });
  }
});

module.exports = router; 