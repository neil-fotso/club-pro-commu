const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  pseudo: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  plateforme: { 
    type: String, 
    required: true,
    enum: ['PS5', 'PS4', 'Xbox Series X/S', 'Xbox One', 'PC'],
    default: 'PS5'
  },
  postePrincipal: { type: String },
  postesSecondaires: [{ type: String }],
  age: { type: String },
  langues: [{ type: String }],
  pays: { type: String }
});

module.exports = mongoose.model('User', UserSchema); 