require('dotenv').config();

// ✅ Fix DNS
const dns = require('node:dns');
dns.setServers(['8.8.8.8']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const fs = require('fs');
const Film = require('./models/Film');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connecté');

  const contenu = fs.readFileSync('./films.csv', 'utf8');
  const lignes = contenu.split('\n').slice(1);

  const films = lignes
    .filter(l => l.trim() !== '')
    .map(l => {
      const [id, boite, asset, upc, titre] = l.split(';');
      return {
        id: parseInt(id),
        boite: parseInt(boite),
        asset: asset?.trim(),
        upc: upc?.trim(),
        titre: titre?.trim()
      };
    });

  await Film.insertMany(films);
  console.log(`${films.length} films importés !`);
  process.exit();
}).catch(err => {
  console.error('Erreur :', err);
  process.exit(1);
});