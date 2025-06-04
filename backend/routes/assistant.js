const express = require('express');
const router = express.Router();
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { administrativeData } = require("./data.js");
const dotenv = require('dotenv');
const auth = require('../middleware/auth');
const History = require('../models/History');

dotenv.config();

// Configuration des embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "models/embedding-001",
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: "v1beta"
});

// Initialisation du vector store (une seule fois au démarrage)
let vectorStore;

async function initializeVectorStore() {
  const texts = administrativeData.map(item => item.answer);
  const metadatas = administrativeData.map((item, index) => ({
    id: index + 1,
    question: item.question,
    tags: item.tags
  }));

  vectorStore = await MemoryVectorStore.fromTexts(
    texts,
    metadatas,
    embeddings
  );
  console.log("Base de connaissances chargée avec", administrativeData.length, "entrées.");
}

// Initialiser le vector store au démarrage
initializeVectorStore().catch(console.error);

// Endpoint pour poser une question
router.post('/ask', auth, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'La question est requise' });
    }

    // Trouver les réponses les plus pertinentes
    const results = await vectorStore.similaritySearch(question, 3);
    
    let response;
    let typeDemarche = "administratif"; // Valeur par défaut
    let assistantAnswer;

    if (results.length === 0) {
      assistantAnswer = "Désolé, je n'ai pas trouvé d'information sur ce sujet.";
    } else {
      const bestMatch = results[0];
      assistantAnswer = bestMatch.pageContent;
      typeDemarche = bestMatch.metadata.tags?.[0] || typeDemarche;
      
      response = {
        question: bestMatch.metadata.question,
        answer: assistantAnswer,
        reference: bestMatch.metadata.id,
        tags: bestMatch.metadata.tags
      };
    }

    // Enregistrer dans l'historique avec tous les champs requis
    const historyEntry = new History({
      userId: req.user.id,
      question: question, // Champ requis
      reponse: assistantAnswer, // Champ requis
      typeDemarche: typeDemarche, // Champ requis
      statut: 'terminee', // Valeur par défaut définie dans le schéma
      date: new Date()
    });

    await historyEntry.save();

    // Si pas de résultats, on retourne quand même une réponse cohérente
    if (!response) {
      response = {
        question: question,
        answer: assistantAnswer,
        reference: null,
        tags: []
      };
    }

    res.json(response);
  } catch (error) {
    console.error("Erreur lors du traitement de la question:", error);
    res.status(500).json({ 
      message: 'Erreur lors du traitement de la question', 
      error: error.message,
      details: error.errors || error
    });
  }
});

// Endpoint pour suggérer des questions (basé sur les tags)
router.get('/suggestions', auth, async (req, res) => {
  try {
    // Récupérer quelques questions aléatoires comme suggestions
    const suggestions = administrativeData
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(item => ({
        question: item.question,
        tags: item.tags
      }));

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des suggestions', error: error.message });
  }
});

module.exports = router;