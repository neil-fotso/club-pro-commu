const express = require('express');
const Competition = require('../models/Competition');
const Club = require('../models/Club');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const discordSimple = require('../services/discordSimple');

const router = express.Router();

// GET /api/competitions - Récupérer toutes les compétitions
router.get('/', async (req, res) => {
  try {
    const { statut, plateforme, type, visibilite, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (statut) query.statut = statut;
    if (plateforme) query.plateforme = plateforme;
    if (type) query.type = type;
    if (visibilite) query.visibilite = visibilite;

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
      .populate('demandesInscription.clubId', 'nom')
      .populate('matchs.equipe1', 'nom')
      .populate('matchs.equipe2', 'nom')
      .populate('matchs.statsJoueurs.joueurId', 'pseudo')
      .populate('matchs.statsJoueurs.clubId', 'nom')
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
      formatCoupe,
      visibilite,
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
    if (!nom || !type || !dateDebut || !nombreEquipes || !visibilite) {
      return res.status(400).json({ 
        message: 'Nom, type, visibilité, date de début et nombre d\'équipes sont obligatoires' 
      });
    }

    // Validation spécifique pour les coupes
    if (type === 'coupe' && !formatCoupe) {
      return res.status(400).json({ 
        message: 'Format de coupe obligatoire pour les compétitions de type coupe' 
      });
    }

    const competition = new Competition({
      nom,
      type,
      formatCoupe: type === 'coupe' ? formatCoupe : undefined,
      visibilite,
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

    // Notification Discord
    try {
      await discordSimple.sendMessage(
        `🏆 **Nouvelle compétition créée !**\n` +
        `**${nom}** (${type})\n` +
        `Par ${req.user.pseudo}\n` +
        `Début: ${new Date(dateDebut).toLocaleDateString('fr-FR')}\n` +
        `Équipes: ${nombreEquipes} • ${visibilite === 'publique' ? 'Publique' : 'Privée'}`
      );
    } catch (discordError) {
      console.error('Erreur notification Discord:', discordError);
    }

    res.status(201).json(competition);
  } catch (error) {
    console.error('Erreur création compétition:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la compétition' });
  }
});

// POST /api/competitions/:id/inscription - S'inscrire à une compétition
router.post('/:id/inscription', auth, async (req, res) => {
  try {
    const { clubId, message } = req.body;
    const competitionId = req.params.id;

    if (!clubId) {
      return res.status(400).json({ message: 'ID du club obligatoire' });
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier si le club est déjà inscrit
    const dejaInscrit = competition.equipesInscrites.some(
      equipe => equipe.clubId.toString() === clubId
    );
    if (dejaInscrit) {
      return res.status(400).json({ message: 'Club déjà inscrit à cette compétition' });
    }

    // Vérifier si le club a déjà fait une demande
    const demandeExistante = competition.demandesInscription.find(
      demande => demande.clubId.toString() === clubId
    );
    if (demandeExistante) {
      return res.status(400).json({ message: 'Demande d\'inscription déjà en cours' });
    }

    // Vérifier que l'utilisateur est admin du club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé' });
    }

    // Vérifier que l'utilisateur est admin du club
    const membre = club.membres.find(m => m.userId.toString() === req.user.id);
    const estAdmin = membre && membre.role === 'Admin';
    if (!estAdmin) {
      return res.status(403).json({ message: 'Seuls les admins peuvent inscrire un club' });
    }

    if (competition.visibilite === 'publique') {
      // Inscription directe pour les compétitions publiques
      competition.equipesInscrites.push({
        clubId,
        statut: 'Inscrit'
      });
    } else {
      // Demande d'inscription pour les compétitions privées
      competition.demandesInscription.push({
        clubId,
        message: message || ''
      });

      // Notification au créateur de la compétition
      const notification = new Notification({
        userId: competition.createurId,
        type: 'demande_inscription_competition',
        titre: 'Demande d\'inscription à une compétition',
        message: `${club.nom} souhaite rejoindre votre compétition "${competition.nom}"`,
        donnees: {
          competitionId: competition._id,
          clubId: club._id,
          demandeurId: req.user.id
        }
      });
      await notification.save();
    }

    await competition.save();
    res.json({ message: competition.visibilite === 'publique' ? 'Inscription réussie' : 'Demande envoyée' });
  } catch (error) {
    console.error('Erreur inscription compétition:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

// PUT /api/competitions/:id/demandes/:demandeId - Traiter une demande d'inscription
router.put('/:id/demandes/:demandeId', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'accepter' ou 'refuser'
    const { id: competitionId, demandeId } = req.params;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que l'utilisateur est le créateur de la compétition
    if (competition.createurId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const demande = competition.demandesInscription.id(demandeId);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    if (action === 'accepter') {
      // Accepter la demande
      demande.statut = 'Acceptée';
      competition.equipesInscrites.push({
        clubId: demande.clubId,
        statut: 'Inscrit'
      });

      // Notification au club
      const notification = new Notification({
        userId: demande.clubId, // On notifie le club (à adapter selon votre logique)
        type: 'inscription_competition_acceptee',
        titre: 'Inscription acceptée',
        message: `Votre demande d'inscription à "${competition.nom}" a été acceptée`,
        donnees: {
          competitionId: competition._id
        }
      });
      await notification.save();

    } else if (action === 'refuser') {
      // Refuser la demande
      demande.statut = 'Refusée';

      // Notification au club
      const notification = new Notification({
        userId: demande.clubId,
        type: 'inscription_competition_refusee',
        titre: 'Inscription refusée',
        message: `Votre demande d'inscription à "${competition.nom}" a été refusée`,
        donnees: {
          competitionId: competition._id
        }
      });
      await notification.save();
    }

    await competition.save();
    res.json({ message: `Demande ${action === 'accepter' ? 'acceptée' : 'refusée'}` });
  } catch (error) {
    console.error('Erreur traitement demande:', error);
    res.status(500).json({ message: 'Erreur lors du traitement de la demande' });
  }
});

// PUT /api/competitions/:id/lancer - Lancer une compétition
router.put('/:id/lancer', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que l'utilisateur est le créateur
    if (competition.createurId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (competition.statut !== 'Ouvert') {
      return res.status(400).json({ message: 'La compétition ne peut plus être lancée' });
    }

    // Générer les matchs selon le type de compétition
    if (competition.type === 'championnat') {
      // Générer tous les matchs aller-retour
      const equipes = competition.equipesInscrites.filter(e => e.statut === 'Inscrit');
      for (let i = 0; i < equipes.length; i++) {
        for (let j = i + 1; j < equipes.length; j++) {
          // Match aller
          competition.matchs.push({
            equipe1: equipes[i].clubId,
            equipe2: equipes[j].clubId,
            phase: 'Groupe'
          });
          // Match retour
          competition.matchs.push({
            equipe1: equipes[j].clubId,
            equipe2: equipes[i].clubId,
            phase: 'Groupe'
          });
        }
      }
    } else if (competition.type === 'coupe') {
      // Générer les matchs selon le format
      const equipes = competition.equipesInscrites.filter(e => e.statut === 'Inscrit');
      if (competition.formatCoupe === 'elimination_directe') {
        // Générer les matchs d'élimination directe
        for (let i = 0; i < equipes.length; i += 2) {
          if (i + 1 < equipes.length) {
            competition.matchs.push({
              equipe1: equipes[i].clubId,
              equipe2: equipes[i + 1].clubId,
              phase: 'Huitième'
            });
          }
        }
      } else {
        // Format avec phases de poules + élimination directe
        // Logique à implémenter selon vos besoins
      }
    }

    competition.statut = 'En cours';
    await competition.save();

    res.json({ message: 'Compétition lancée avec succès' });
  } catch (error) {
    console.error('Erreur lancement compétition:', error);
    res.status(500).json({ message: 'Erreur lors du lancement' });
  }
});

// PUT /api/competitions/:id/matchs/:matchId/score - Mettre à jour le score d'un match
router.put('/:id/matchs/:matchId/score', auth, async (req, res) => {
  try {
    const { score1, score2, statsJoueurs } = req.body;
    const { id: competitionId, matchId } = req.params;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    const match = competition.matchs.id(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    // Vérifier que l'utilisateur est admin d'une des équipes
    const estAdminEquipe1 = await Club.findOne({ _id: match.equipe1, admins: req.user.id });
    const estAdminEquipe2 = await Club.findOne({ _id: match.equipe2, admins: req.user.id });
    
    if (!estAdminEquipe1 && !estAdminEquipe2) {
      return res.status(403).json({ message: 'Seuls les admins des équipes peuvent modifier les scores' });
    }

    // Mettre à jour le score
    match.score1 = score1;
    match.score2 = score2;
    match.statut = 'Terminé';
    match.statsJoueurs = statsJoueurs || [];
    match.validePar = req.user.id;
    match.dateValidation = new Date();

    // Mettre à jour les statistiques des équipes
    const equipe1 = competition.equipesInscrites.find(e => e.clubId.toString() === match.equipe1.toString());
    const equipe2 = competition.equipesInscrites.find(e => e.clubId.toString() === match.equipe2.toString());

    if (equipe1 && equipe2) {
      equipe1.matchsJoues++;
      equipe2.matchsJoues++;
      equipe1.butsMarques += score1;
      equipe1.butsEncaisses += score2;
      equipe2.butsMarques += score2;
      equipe2.butsEncaisses += score1;

      if (score1 > score2) {
        equipe1.victoires++;
        equipe2.defaites++;
        if (competition.type === 'championnat') {
          equipe1.points += 3;
        }
      } else if (score1 < score2) {
        equipe2.victoires++;
        equipe1.defaites++;
        if (competition.type === 'championnat') {
          equipe2.points += 3;
        }
      } else {
        equipe1.nuls++;
        equipe2.nuls++;
        if (competition.type === 'championnat') {
          equipe1.points += 1;
          equipe2.points += 1;
        }
      }
    }

    await competition.save();
    res.json({ message: 'Score mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour score:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du score' });
  }
});

// DELETE /api/competitions/:id - Supprimer une compétition
router.delete('/:id', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    if (competition.createurId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await Competition.findByIdAndDelete(req.params.id);
    res.json({ message: 'Compétition supprimée' });
  } catch (error) {
    console.error('Erreur suppression compétition:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

module.exports = router; 