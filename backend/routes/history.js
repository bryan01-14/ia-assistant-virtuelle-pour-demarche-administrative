const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const History = require('../models/History');

// Récupérer l'historique d'un utilisateur
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.userData.userId;
        const history = await History.find({ userId })
            .sort({ date: -1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique', error: error.message });
    }
});

// Récupérer une conversation spécifique
router.get('/:id', auth, async (req, res) => {
    try {
        const conversation = await History.findOne({
            _id: req.params.id,
            userId: req.userData.userId
        });
        
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation non trouvée' });
        }
        
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la conversation', error: error.message });
    }
});

// Supprimer une conversation
router.delete('/:id', auth, async (req, res) => {
    try {
        const conversation = await History.findOneAndDelete({
            _id: req.params.id,
            userId: req.userData.userId
        });
        
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation non trouvée' });
        }
        
        res.json({ message: 'Conversation supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la conversation', error: error.message });
    }
});

module.exports = router; 