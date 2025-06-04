const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Récupérer le token du header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token reçu:', token); // Debug log

    // Vérifier si le token existe
    if (!token) {
        console.log('Token manquant'); // Debug log
        return res.status(401).json({ message: 'Accès non autorisé' });
    }

    try {
        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token décodé:', decoded); // Debug log
        
        // S'assurer que l'ID utilisateur est correctement extrait
        if (decoded.user && decoded.user.id) {
            req.user = { id: decoded.user.id };
        } else {
            throw new Error('Structure du token invalide');
        }
        
        next();
    } catch (error) {
        console.error('Erreur de vérification du token:', error); // Debug log
        res.status(401).json({ message: 'Token invalide' });
    }
}; 