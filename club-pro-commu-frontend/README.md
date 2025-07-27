# 🏆 Club Pro Communauté

Une plateforme moderne pour les joueurs FIFA Pro Clubs qui souhaitent trouver des clubs, créer des équipes et participer à des compétitions.

## 🚀 Fonctionnalités

### 👥 **Gestion des Utilisateurs**
- ✅ Inscription et connexion sécurisées
- ✅ Profils joueurs personnalisables
- ✅ Système d'authentification JWT

### 🏟️ **Gestion des Clubs**
- ✅ Création et gestion de clubs
- ✅ Recherche avancée de clubs
- ✅ Système de candidature et d'invitation
- ✅ Profils de clubs détaillés

### 🎮 **Recherche et Matching**
- ✅ Recherche de joueurs par critères
- ✅ Recherche de clubs par filtres
- ✅ Système de matching intelligent

### 🏆 **Compétitions**
- ✅ Création de tournois et championnats
- ✅ Gestion des inscriptions
- ✅ Système de récompenses

### 💬 **Communauté**
- ✅ Interface moderne et responsive
- ✅ Design adaptatif (mobile/desktop)
- ✅ Expérience utilisateur optimisée

## 🛠️ Technologies Utilisées

### **Frontend**
- ⚛️ **React 19** - Interface utilisateur moderne
- 🎨 **Bootstrap 5** - Framework CSS responsive
- 🎯 **React Router** - Navigation SPA
- 🔐 **JWT** - Authentification sécurisée

### **Backend**
- 🟢 **Node.js** - Runtime JavaScript
- 🚀 **Express.js** - Framework web
- 🗄️ **MongoDB** - Base de données NoSQL
- 🐘 **Mongoose** - ODM pour MongoDB
- 🔒 **bcrypt** - Hashage des mots de passe
- 🎫 **jsonwebtoken** - Tokens d'authentification

## 📦 Installation

### **Prérequis**
- Node.js (v16 ou supérieur)
- MongoDB (local ou Atlas)
- npm ou yarn

### **Installation Locale**

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/club-pro-commu.git
   cd club-pro-commu
   ```

2. **Installer les dépendances Frontend**
   ```bash
   cd club-pro-commu-frontend
   npm install
   ```

3. **Installer les dépendances Backend**
   ```bash
   cd ../club-pro-commu-backend
   npm install
   ```

4. **Configuration des variables d'environnement**
   
   **Backend** (`.env`) :
   ```env
   PORT=3001
   MONGO_URI=mongodb://localhost:27017/club-pro-commu
   JWT_SECRET=votre_secret_jwt_tres_long
   NODE_ENV=development
   ```
   
   **Frontend** (`.env`) :
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

5. **Lancer l'application**
   
   **Backend** :
   ```bash
   cd club-pro-commu-backend
   npm start
   ```
   
   **Frontend** :
   ```bash
   cd club-pro-commu-frontend
   npm start
   ```

## 🌐 Déploiement

### **Options Gratuites**

#### **Vercel + Render (Recommandé)**
- **Frontend** : [Vercel](https://vercel.com) (gratuit)
- **Backend** : [Render](https://render.com) (gratuit)
- **Base de données** : MongoDB Atlas (gratuit)

#### **Netlify + Railway**
- **Frontend** : [Netlify](https://netlify.com) (gratuit)
- **Backend** : [Railway](https://railway.app) (gratuit)

### **Guide de Déploiement**

Consultez le fichier `DEPLOYMENT.md` pour les instructions détaillées.

## 📁 Structure du Projet

```
club-pro-commu/
├── club-pro-commu-frontend/     # Application React
│   ├── src/
│   │   ├── components/          # Composants réutilisables
│   │   ├── pages/              # Pages de l'application
│   │   ├── context/            # Context API (auth)
│   │   ├── services/           # Services API
│   │   └── assets/             # Images et ressources
│   ├── public/                 # Fichiers statiques
│   └── package.json
├── club-pro-commu-backend/      # API Node.js
│   ├── routes/                 # Routes API
│   ├── models/                 # Modèles MongoDB
│   ├── middleware/             # Middleware Express
│   ├── config/                 # Configuration
│   └── server.js              # Point d'entrée
├── deploy.sh                   # Script de déploiement
├── DEPLOYMENT.md              # Guide de déploiement
└── README.md                  # Ce fichier
```

## 🔧 API Endpoints

### **Authentification**
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### **Utilisateurs**
- `GET /api/user/me` - Profil utilisateur
- `PUT /api/user/profile` - Mise à jour profil

### **Joueurs**
- `GET /api/players` - Liste des joueurs
- `POST /api/players` - Créer un profil joueur
- `GET /api/players/:id` - Profil d'un joueur

### **Clubs**
- `GET /api/clubs` - Liste des clubs
- `POST /api/clubs` - Créer un club
- `GET /api/clubs/:id` - Profil d'un club
- `GET /api/clubs/user/my-clubs` - Mes clubs

## 🎨 Interface Utilisateur

- **Design moderne** avec Bootstrap 5
- **Responsive** pour mobile et desktop
- **Animations** et transitions fluides
- **Thème cohérent** avec l'univers FIFA

## 🔒 Sécurité

- ✅ **Authentification JWT** sécurisée
- ✅ **Hashage bcrypt** des mots de passe
- ✅ **Validation** des données côté serveur
- ✅ **CORS** configuré
- ✅ **Variables d'environnement** pour les secrets

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Neil** - Développeur Full Stack

## 🙏 Remerciements

- **Bootstrap** pour le framework CSS
- **Font Awesome** pour les icônes
- **MongoDB** pour la base de données
- **Vercel** et **Render** pour l'hébergement gratuit

---

⭐ **N'oubliez pas de donner une étoile au projet si vous l'aimez !** ⭐
