const express = require('express');
const router = express.Router();
const Film = require('../models/Film');

// GET tous les films
router.get('/', async (req, res) => {
  try {
    const films = await Film.find();
    res.json(films);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET toutes les boites distinctes
router.get('/boites', async (req, res) => {
  try {
    const boites = await Film.distinct('boite');
    res.json(boites.sort((a, b) => a - b));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET un film par id
router.get('/:id', async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    res.json(film);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST ajouter film
router.post('/', async (req, res) => {
  try {
    console.log('Body reçu :', req.body);
    const data = { ...req.body, annee: parseInt(req.body.annee) };
    const film = new Film(data);
    await film.save();
    res.json(film);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE supprimer film
router.delete('/:id', async (req, res) => {
  try {
    await Film.findByIdAndDelete(req.params.id);
    res.json({ message: 'Film supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;