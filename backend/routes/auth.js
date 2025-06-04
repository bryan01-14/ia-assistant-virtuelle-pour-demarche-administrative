const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Route pour obtenir le profil de l'utilisateur
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('Requête profile reçue, userId:', req.user.id); // Debug log
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            console.log('Utilisateur non trouvé'); // Debug log
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        console.log('Profil trouvé:', user); // Debug log
        res.json(user);
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour mettre à jour le profil
router.put('/profile', auth, async (req, res) => {
    try {
        const { nom, prenom, email, password } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
        }

        // Mettre à jour les informations de base
        user.nom = nom || user.nom;
        user.prenom = prenom || user.prenom;
        user.email = email || user.email;

        // Mettre à jour le mot de passe si fourni
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        // Retourner l'utilisateur mis à jour sans le mot de passe
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        const { nom, prenom, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
        }

        // Créer un nouvel utilisateur
        user = new User({
            nom,
            prenom,
            email,
            password
        });

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Sauvegarder l'utilisateur
        await user.save();

        // Créer le token JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, nom, prenom, email } });
            }
        );
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        // Créer le token JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email
                    }
                });
            }
        );
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 