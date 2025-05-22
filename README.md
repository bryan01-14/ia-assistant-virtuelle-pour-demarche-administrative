# Assistant Virtuel Administratif

Une application web d'assistant virtuel pour les démarches administratives, utilisant React.js pour le frontend et Node.js pour le backend, avec une implémentation RAG (Retrieval-Augmented Generation).

## Fonctionnalités

- Authentification des utilisateurs (inscription/connexion)
- Interface de chat avec l'assistant virtuel
- Historique des conversations
- Système RAG pour des réponses précises
- Interface utilisateur moderne avec Material-UI

## Prérequis

- Node.js (v14 ou supérieur)
- MongoDB
- Clé API OpenAI

## Installation

1. Cloner le repository :
```bash
git clone <url-du-repo>
cd admin-assistant
```

2. Installer les dépendances du backend :
```bash
npm install
```

3. Installer les dépendances du frontend :
```bash
cd frontend
npm install
```

4. Configurer les variables d'environnement :
- Copier le fichier `.env.example` en `.env`
- Remplir les variables d'environnement avec vos valeurs

## Démarrage

1. Démarrer le backend :
```bash
npm run dev
```

2. Dans un autre terminal, démarrer le frontend :
```bash
cd frontend
npm start
```

L'application sera accessible à l'adresse : http://localhost:3000

## Structure du Projet

```
admin-assistant/
├── frontend/           # Application React
├── models/            # Modèles Mongoose
├── routes/            # Routes API
├── middleware/        # Middleware Express
├── server.js         # Point d'entrée du backend
└── package.json      # Dépendances du backend
```

## Technologies Utilisées

- Frontend :
  - React.js
  - Material-UI
  - React Router
  - Axios

- Backend :
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT
  - OpenAI API
  - LangChain

## Sécurité

- Authentification JWT
- Hachage des mots de passe
- Protection des routes
- Validation des entrées

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request. 