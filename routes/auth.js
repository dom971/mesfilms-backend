const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST inscription
router.post('/register', async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    const existant = await User.findOne({ email });
    if (existant) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ nom, email, password: hash });
    await user.save();

    res.json({ message: 'Inscription réussie !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }

    const valide = await bcrypt.compare(password, user.password);
    if (!valide) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, nom: user.nom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;