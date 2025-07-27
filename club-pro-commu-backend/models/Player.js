const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pseudoPlateforme: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photoProfil: {
    type: String,
    default: null // URL de l'image ou null si pas de photo
  },
  postePrincipal: {
    type: String,
    required: true,
    enum: ['BU', 'AG', 'AD', 'MOC', 'MG', 'MD', 'MC', 'MDC', 'DD', 'DG', 'DC', 'DLD', 'DLG']
  },
  postesSecondaires: [{
    type: String,
    enum: ['BU', 'AG', 'AD', 'MOC', 'MG', 'MD', 'MC', 'MDC', 'DD', 'DG', 'DC', 'DLD', 'DLG']
  }],
  age: {
    type: Number,
    min: 16,
    max: 100
  },
  pays: {
    type: String,
    minlength: 2,
    maxlength: 3
  },
  plateforme: {
    type: String,
    required: true,
    enum: ['PS5', 'PS4', 'Xbox Series X/S', 'Xbox One', 'PC']
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

  experience: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema); 