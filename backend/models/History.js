const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    reponse: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    typeDemarche: {
        type: String,
        required: true
    },
    statut: {
        type: String,
        enum: ['en_cours', 'terminee', 'en_attente'],
        default: 'en_cours'
    }
});

module.exports = mongoose.model('History', historySchema); 