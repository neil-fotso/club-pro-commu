const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  pseudo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  photoProfil: {
    type: String,
    default: ''
  },
  age: {
    type: Number,
    min: 13,
    max: 100
  },
  pays: {
    type: String,
    required: true
  },
  nationalite: {
    type: String,
    default: ''
  },
  ville: {
    type: String,
    default: ''
  },
  plateforme: {
    type: String,
    enum: ['PC', 'PS5', 'Xbox', 'Switch', 'Mobile'],
    required: true
  },
  position: {
    type: String,
    enum: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien', 'Polyvalent'],
    required: true
  },
  niveau: {
    type: String,
    enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert', 'Pro'],
    default: 'Intermédiaire'
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  // Nouvelles améliorations
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  disponibilite: {
    type: String,
    enum: ['Disponible', 'Occupé', 'Absent', 'Recherche équipe'],
    default: 'Disponible'
  },
  horaires: {
    lundi: { type: String, default: '' },
    mardi: { type: String, default: '' },
    mercredi: { type: String, default: '' },
    jeudi: { type: String, default: '' },
    vendredi: { type: String, default: '' },
    samedi: { type: String, default: '' },
    dimanche: { type: String, default: '' }
  },
  jeux: [{
    nom: { type: String, required: true },
    niveau: { type: String, enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'], default: 'Intermédiaire' },
    tempsJeu: { type: Number, default: 0 }, // en heures
    favori: { type: Boolean, default: false }
  }],
  statistiques: {
    matchsJoues: { type: Number, default: 0 },
    victoires: { type: Number, default: 0 },
    defaites: { type: Number, default: 0 },
    nuls: { type: Number, default: 0 },
    butsMarques: { type: Number, default: 0 },
    butsEncaisses: { type: Number, default: 0 },
    passesDecisives: { type: Number, default: 0 },
    cleanSheets: { type: Number, default: 0 }
  },
  recompenses: [{
    nom: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Trophée', 'Médaille', 'Certificat', 'Autre'] }
  }],
  reseauxSociaux: {
    discord: { type: String, default: '' },
    twitter: { type: String, default: '' },
    twitch: { type: String, default: '' },
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  preferences: {
    langue: { type: String, default: 'Français' },
    fuseauHoraire: { type: String, default: 'Europe/Paris' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      discord: { type: Boolean, default: true }
    },
    visibilite: {
      profil: { type: String, enum: ['Public', 'Amis', 'Privé'], default: 'Public' },
      statistiques: { type: String, enum: ['Public', 'Amis', 'Privé'], default: 'Public' },
      disponibilite: { type: String, enum: ['Public', 'Amis', 'Privé'], default: 'Public' }
    }
  },
  derniereActivite: {
    type: Date,
    default: Date.now
  },
  statutVerification: {
    type: String,
    enum: ['Non vérifié', 'Vérifié', 'Premium'],
    default: 'Non vérifié'
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
playerSchema.index({ pseudo: 1 });
playerSchema.index({ pays: 1, plateforme: 1, position: 1 });
playerSchema.index({ disponibilite: 1 });
playerSchema.index({ 'statistiques.matchsJoues': -1 });
playerSchema.index({ derniereActivite: -1 });

// Méthodes virtuelles
playerSchema.virtual('winRate').get(function() {
  if (this.statistiques.matchsJoues === 0) return 0;
  return Math.round((this.statistiques.victoires / this.statistiques.matchsJoues) * 100);
});

playerSchema.virtual('goalsPerMatch').get(function() {
  if (this.statistiques.matchsJoues === 0) return 0;
  return (this.statistiques.butsMarques / this.statistiques.matchsJoues).toFixed(2);
});

playerSchema.virtual('assistsPerMatch').get(function() {
  if (this.statistiques.matchsJoues === 0) return 0;
  return (this.statistiques.passesDecisives / this.statistiques.matchsJoues).toFixed(2);
});

// Méthodes d'instance
playerSchema.methods.updateActivity = function() {
  this.derniereActivite = new Date();
  return this.save();
};

playerSchema.methods.addStatistic = function(type, value = 1) {
  if (this.statistiques[type] !== undefined) {
    this.statistiques[type] += value;
  }
  return this.save();
};

playerSchema.methods.addReward = function(reward) {
  this.recompenses.push(reward);
  return this.save();
};

module.exports = mongoose.model('Player', playerSchema); 