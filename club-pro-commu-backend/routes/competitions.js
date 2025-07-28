const express = require('express');
const Competition = require('../models/Competition');
const Club = require('../models/Club');
const auth = require('../middleware/auth');
const discordService = require('../services/discordService');

const router = express.Router();

// GET /api/competitions - Récupérer toutes les compétitions
router.get('/', async (req, res) => {
  try {
    const { statut, plateforme, type, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (statut) query.statut = statut;
    if (plateforme) query.plateforme = plateforme;
    if (type) query.type = type;

    const competitions = await Competition.find(query)
      .populate('createurId', 'pseudo')
      .populate('equipesInscrites.clubId', 'nom')
      .populate('gagnant', 'nom')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Competition.countDocuments(query);

    res.json({
      competitions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Erreur récupération compétitions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/competitions/mes-competitions - Récupérer les compétitions de l'utilisateur
router.get('/mes-competitions', auth, async (req, res) => {
  try {
    console.log('Recherche compétitions pour user:', req.user.id);
    const competitions = await Competition.find({ createurId: req.user.id })
      .populate('createurId', 'pseudo')
      .populate('equipesInscrites.clubId', 'nom')
      .sort({ dateCreation: -1 });

    console.log('Compétitions trouvées:', competitions.length);
    res.json(competitions);
  } catch (error) {
    console.error('Erreur récupération mes compétitions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/competitions/:id - Récupérer une compétition spécifique
router.get('/:id', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('createurId', 'pseudo')
      .populate('equipesInscrites.clubId', 'nom description')
      .populate('matchs.equipe1', 'nom')
      .populate('matchs.equipe2', 'nom')
      .populate('gagnant', 'nom');

    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    res.json(competition);
  } catch (error) {
    console.error('Erreur récupération compétition:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/competitions - Créer une nouvelle compétition
router.post('/', auth, async (req, res) => {
  try {
    const {
      nom,
      type,
      description,
      dateDebut,
      dateFin,
      nombreEquipes,
      niveau,
      plateforme,
      inscriptionGratuite,
      montantInscription,
      recompense,
      reglement
    } = req.body;

    // Validation des champs obligatoires
    if (!nom || !type || !dateDebut || !nombreEquipes) {
      return res.status(400).json({ 
        message: 'Nom, type, date de début et nombre d\'équipes sont obligatoires' 
      });
    }

    const competition = new Competition({
      nom,
      type,
      description,
      dateDebut,
      dateFin,
      nombreEquipes,
      niveau,
      plateforme,
      inscriptionGratuite,
      montantInscription: inscriptionGratuite ? 0 : montantInscription,
      recompense,
      reglement,
      createurId: req.user.id
    });

    await competition.save();
    
    const competitionPopulated = await Competition.findById(competition._id)
      .populate('createurId', 'pseudo');

    // Envoyer notification Discord
    await discordService.sendNewCompetition(competitionPopulated, competitionPopulated.createurId);

    res.status(201).json(competitionPopulated);
  } catch (error) {
    console.error('Erreur création compétition:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/competitions/:id - Modifier une compétition
router.put('/:id', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que l'utilisateur est le créateur
    if (competition.createurId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Empêcher la modification si la compétition a commencé
    if (competition.statut === 'En cours' || competition.statut === 'Terminé') {
      return res.status(400).json({ 
        message: 'Impossible de modifier une compétition en cours ou terminée' 
      });
    }

    const updatedCompetition = await Competition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createurId', 'pseudo');

    res.json(updatedCompetition);
  } catch (error) {
    console.error('Erreur modification compétition:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/competitions/:id - Supprimer une compétition
router.delete('/:id', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que l'utilisateur est le créateur
    if (competition.createurId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Empêcher la suppression si des équipes sont inscrites
    if (competition.equipesInscrites.length > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer une compétition avec des équipes inscrites' 
      });
    }

    await Competition.findByIdAndDelete(req.params.id);
    res.json({ message: 'Compétition supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression compétition:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/competitions/:id/inscrire - Inscrire un club à une compétition
router.post('/:id/inscrire', auth, async (req, res) => {
  try {
    const { clubId } = req.body;
    
    if (!clubId) {
      return res.status(400).json({ message: 'ID du club requis' });
    }

    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que la compétition est ouverte aux inscriptions
    if (competition.statut !== 'Ouvert') {
      return res.status(400).json({ 
        message: 'Les inscriptions sont fermées pour cette compétition' 
      });
    }

    // Vérifier que le club existe
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé' });
    }

    // Vérifier que le club n'est pas déjà inscrit
    const dejaInscrit = competition.equipesInscrites.find(
      equipe => equipe.clubId.toString() === clubId
    );
    if (dejaInscrit) {
      return res.status(400).json({ message: 'Club déjà inscrit' });
    }

    // Vérifier qu'il y a encore de la place
    if (competition.equipesInscrites.length >= competition.nombreEquipes) {
      return res.status(400).json({ message: 'Compétition complète' });
    }

    competition.equipesInscrites.push({
      clubId,
      dateInscription: new Date(),
      statut: 'Inscrit'
    });

    await competition.save();
    
    const competitionPopulated = await Competition.findById(competition._id)
      .populate('equipesInscrites.clubId', 'nom');

    res.json(competitionPopulated);
  } catch (error) {
    console.error('Erreur inscription club:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/competitions/:id/desinscrire - Désinscrire un club
router.post('/:id/desinscrire', auth, async (req, res) => {
  try {
    const { clubId } = req.body;
    
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que la compétition est ouverte
    if (competition.statut !== 'Ouvert') {
      return res.status(400).json({ 
        message: 'Impossible de se désinscrire d\'une compétition fermée' 
      });
    }

    // Retirer le club de la liste
    competition.equipesInscrites = competition.equipesInscrites.filter(
      equipe => equipe.clubId.toString() !== clubId
    );

    await competition.save();
    
    const competitionPopulated = await Competition.findById(competition._id)
      .populate('equipesInscrites.clubId', 'nom');

    res.json(competitionPopulated);
  } catch (error) {
    console.error('Erreur désinscription club:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 