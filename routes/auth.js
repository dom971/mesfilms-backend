const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const transporter = require('../config/mailer');

// POST inscription
router.post('/register', async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    // Vérifier si l'email existe déjà
    const existant = await User.findOne({ email });
    if (existant) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hash = await bcrypt.hash(password, 10);

    // Générer un token de validation
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({ nom, email, password: hash, verificationToken });
    await user.save();

    // Envoyer l'email de validation
    const lienValidation = `https://mesfilms-backend.onrender.com/auth/verify/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎬 MesFilms - Validez votre compte',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; background: #141414; color: #fff; padding: 30px; border-radius: 12px;">
          <h1 style="color: #e50914; text-align: center;">🎬 MES FILMS</h1>
          <h2 style="text-align: center;">Bonjour ${nom} !</h2>
          <p style="text-align: center; color: #888;">Cliquez sur le bouton ci-dessous pour valider votre compte.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${lienValidation}" style="background-color: #e50914; color: #fff; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Valider mon compte</a>
          </div>
          <p style="text-align: center; color: #888; font-size: 12px;">Ce lien expire dans 24h.</p>
        </div>
      `
    });

    res.json({ message: 'Inscription réussie ! Vérifiez votre email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET validation email
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).send('Token invalide ou expiré.');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; text-align: center;">
        <h1 style="color: #e50914;">🎬 MES FILMS</h1>
        <h2>Compte validé avec succès !</h2>
        <p>Vous pouvez maintenant vous connecter.</p>
        <a href="https://mesfilms-frontend-pi.vercel.app/login" style="background-color: #e50914; color: #fff; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Se connecter</a>
      </div>
    `);
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

    // Vérifier si le compte est validé
    if (!user.isVerified) {
      return res.status(400).json({ error: 'Veuillez valider votre email avant de vous connecter' });
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