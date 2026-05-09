const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
  id: Number,
  boite: Number,
  asset: String,
  upc: String,
  titre: String
});

module.exports = mongoose.model('Film', filmSchema);