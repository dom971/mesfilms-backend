require('dotenv').config();

const dns = require('node:dns');
dns.setServers(['8.8.8.8']);

const mongoose = require('mongoose');
const Film = require('./models/Film');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connecté');

  const result = await Film.updateOne(
    { titre: 'Appollo 13' },
    { $set: { titre: 'Apollo 13' } }
  );

  console.log('Films modifiés :', result.modifiedCount);
  process.exit();
}).catch(err => {
  console.error('Erreur :', err);
  process.exit(1);
});