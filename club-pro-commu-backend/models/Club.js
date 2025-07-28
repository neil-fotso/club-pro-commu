const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true
  },
  createurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plateforme: {
    type: String,
    required: true,
    enum: ['PS5', 'Xbox', 'PC']
  },
  pays: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  recrute: {
    type: Boolean,
    default: true
  },
  niveauRecherche: {
    type: String,
    enum: ['Tous niveaux', 'Intermédiaire+', 'Avancé+', 'Expert uniquement'],
    default: 'Tous niveaux'
  },
  postesRecherches: [{
    type: String,
    enum: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien']
  }],
  effectifMax: {
    type: Number,
    default: 11
  },
  effectifActuel: {
    type: Number,
    default: 0
  },
  membres: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Admin', 'Capitaine', 'Joueur'],
      default: 'Joueur'
    },
    dateAdhesion: {
      type: Date,
      default: Date.now
    }
  }],
  langues: [{
    type: String
  }],
  horaires: {
    type: String
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Club', clubSchema); 