require('dotenv').config();

// ✅ DNS uniquement en local (corrige problème MongoDB Atlas)
if (process.env.NODE_ENV !== 'production') {
  const dns = require('node:dns');
  dns.setServers(['8.8.8.8']);
  console.log('DNS custom activé (dev)');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// 🔌 Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

// 🧱 Middlewares
app.use(cors());
app.use(express.json());

// 📁 Servir les images statiques
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// 🎬 Routes API
app.use('/films', require('./routes/films'));

// 🧪 Route test
app.get('/', (req, res) => {
  res.send('API MesFilms OK 🎬');
});

// 🚀 Lancement serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur port ${PORT}`);
});