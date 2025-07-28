const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['tournoi', 'championnat', 'coupe', 'friendly'],
    default: 'tournoi'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  dateDebut: {
    type: Date,
    required: true
  },
  dateFin: {
    type: Date
  },
  nombreEquipes: {
    type: Number,
    required: true,
    min: 2,
    max: 64,
    default: 8
  },
  niveau: {
    type: String,
    enum: ['Tous niveaux', 'Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
    default: 'Tous niveaux'
  },
  plateforme: {
    type: String,
    enum: ['PS5', 'PS4', 'Xbox', 'PC', 'Cross-Platform'],
    default: 'PS5'
  },
  statut: {
    type: String,
    enum: ['Ouvert', 'Fermé', 'En cours', 'Terminé'],
    default: 'Ouvert'
  },
  inscriptionGratuite: {
    type: Boolean,
    default: true
  },
  montantInscription: {
    type: Number,
    min: 0,
    default: 0
  },
  recompense: {
    type: String,
    maxlength: 500
  },
  reglement: {
    type: String,
    maxlength: 2000
  },
  createurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipesInscrites: [{
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    dateInscription: {
      type: Date,
      default: Date.now
    },
    statut: {
      type: String,
      enum: ['Inscrit', 'Confirmé', 'Eliminé', 'Gagnant'],
      default: 'Inscrit'
    }
  }],
  matchs: [{
    equipe1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    equipe2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    score1: {
      type: Number,
      default: null
    },
    score2: {
      type: Number,
      default: null
    },
    dateMatch: {
      type: Date
    },
    statut: {
      type: String,
      enum: ['Programmé', 'En cours', 'Terminé', 'Annulé'],
      default: 'Programmé'
    },
    phase: {
      type: String,
      enum: ['Groupe', 'Huitième', 'Quart', 'Demi', 'Finale'],
      default: 'Groupe'
    }
  }],
  gagnant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

// Index pour améliorer les performances
competitionSchema.index({ statut: 1, dateDebut: 1 });
competitionSchema.index({ createurId: 1 });
competitionSchema.index({ plateforme: 1 });

module.exports = mongoose.model('Competition', competitionSchema); 