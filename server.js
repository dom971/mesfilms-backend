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
const https = require('https');

const app = express();

// 🔌 Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

// 🧱 Middlewares
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://mesfilms-frontend-pi.vercel.app'
  ]
}));
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

  // ⏰ Keep-alive
  setInterval(() => {
    https.get('https://mesfilms-backend.onrender.com', (res) => {
      console.log('Keep-alive ping :', res.statusCode);
    }).on('error', (err) => {
      console.error('Keep-alive erreur :', err.message);
    });
  }, 10 * 60 * 1000); // toutes les 10 minutes
});