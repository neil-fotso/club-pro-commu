const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postePrincipal: {
    type: String,
    required: true,
    enum: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien']
  },
  postesSecondaires: [{
    type: String,
    enum: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien']
  }],
  age: {
    type: Number,
    required: true,
    min: 16,
    max: 100
  },
  pays: {
    type: String,
    required: true
  },
  plateforme: {
    type: String,
    required: true,
    enum: ['PS5', 'Xbox', 'PC']
  },
  langues: [{
    type: String
  }],
  disponibilite: {
    type: String,
    enum: ['Disponible', 'Occupé', 'Partiellement disponible'],
    default: 'Disponible'
  },
  rechercheClub: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: 500
  },
  niveau: {
    type: String,
    enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
    default: 'Intermédiaire'
  },
  experience: {
    type: Number,
    default: 0
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema); 