# 🏆 Club Pro Communauté

Une plateforme moderne pour les joueurs FIFA Pro Clubs qui souhaitent trouver des clubs, des coéquipiers et améliorer leur expérience de jeu.

## ✨ Fonctionnalités Principales

### 🎮 **Gestion des Joueurs**
- **Profil détaillé** : Poste principal et secondaires, âge, nationalité, langues parlées
- **Statut de disponibilité** : Automatiquement basé sur l'appartenance à un club
- **Statut de connexion** : Indique si le joueur est actif (5 dernières minutes)
- **Avatar par défaut** : Initiales du joueur avec design moderne
- **Recherche avancée** : Filtres par poste, plateforme, disponibilité, statut

### 🏟️ **Gestion des Clubs**
- **Création de clubs** : Nom, description, plateforme, pays
- **Recrutement** : Système de candidature et d'acceptation
- **Gestion des membres** : Rôles (Admin, Capitaine, Joueur)
- **Effectif dynamique** : Suivi automatique du nombre de membres

### 🔍 **Recherche et Navigation**
- **Recherche de joueurs** : Filtres multiples et résultats en temps réel
- **Recherche de clubs** : Par nom, plateforme, pays
- **Navigation intuitive** : Interface moderne et responsive

### 👤 **Système d'Authentification**
- **Inscription complète** : Pseudo, pseudo plateforme, email, mot de passe
- **Connexion sécurisée** : JWT tokens
- **Profil personnalisable** : Modification des informations à tout moment

## 🚀 Technologies Utilisées

### Frontend
- **React 18** : Interface utilisateur moderne
- **Bootstrap 5** : Design responsive et moderne
- **React Router** : Navigation fluide
- **Axios** : Communication API
- **Font Awesome** : Icônes professionnelles

### Backend
- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB
- **JWT** : Authentification sécurisée
- **bcryptjs** : Hachage des mots de passe

## 📦 Installation

### Prérequis
- Node.js (v16+)
- MongoDB
- Git

### Installation Locale

1. **Cloner le repository**
```bash
git clone https://github.com/neil-fotso/club-pro-commu.git
cd club-pro-commu
```

2. **Installer les dépendances Backend**
```bash
cd club-pro-commu-backend
npm install
```

3. **Installer les dépendances Frontend**
```bash
cd ../club-pro-commu-frontend
npm install
```

4. **Configurer les variables d'environnement**

Créer un fichier `.env` dans `club-pro-commu-backend/` :
```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/club-pro-commu
JWT_SECRET=votre_secret_jwt_tres_long
PORT=3001
```

5. **Lancer le développement**

Backend :
```bash
cd club-pro-commu-backend
npm start
```

Frontend :
```bash
cd club-pro-commu-frontend
npm start
```

## 🌐 Déploiement

### Backend (Render)
1. Créer un compte sur [render.com](https://render.com)
2. Connecter le repository GitHub
3. Créer un nouveau Web Service
4. Configurer les variables d'environnement
5. Déployer

### Frontend (Vercel)
1. Créer un compte sur [vercel.com](https://vercel.com)
2. Importer le repository GitHub
3. Configurer les variables d'environnement
4. Déployer

## 🎯 Fonctionnalités Détaillées

### Système de Disponibilité
- **Automatique** : La disponibilité se met à jour selon l'appartenance à un club
- **"Disponible"** : Joueur qui n'est membre d'aucun club
- **"Occupé"** : Joueur qui est membre d'un club
- **Mise à jour en temps réel** : Lors de l'adhésion/départ d'un club

### Statut de Connexion
- **Calcul automatique** : Basé sur l'activité des 5 dernières minutes
- **Indicateur visuel** : 🟢 Connecté / 🔴 Déconnecté
- **Filtrage** : Possibilité de filtrer par statut de connexion

### Système de Positions
- **Positions détaillées** : BU, AG, AD, MOC, MG, MD, MC, MDC, DD, DG, DC, DLD, DLG
- **Positions secondaires** : Possibilité d'avoir plusieurs postes
- **Affichage informatif** : Noms complets avec abréviations

### Gestion des Pays/Nationalités
- **Librairie complète** : Tous les pays du monde
- **Affichage optimisé** : Noms en français avec drapeaux
- **Champs optionnels** : "Non renseigné" si non spécifié

## 🔧 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Joueurs
- `GET /api/players` - Liste des joueurs avec filtres
- `GET /api/players/:id` - Profil d'un joueur
- `GET /api/players/me/profile` - Mon profil
- `PUT /api/players/:id` - Modifier un profil
- `POST /api/players/update-availability` - Mise à jour disponibilité

### Clubs
- `GET /api/clubs` - Liste des clubs
- `GET /api/clubs/:id` - Profil d'un club
- `POST /api/clubs` - Créer un club
- `POST /api/clubs/:id/join` - Rejoindre un club
- `POST /api/clubs/:id/leave` - Quitter un club

## 🎨 Interface Utilisateur

### Design Moderne
- **Gradient colors** : Palette de couleurs cohérente
- **Cards interactives** : Navigation fluide
- **Responsive design** : Compatible mobile/desktop
- **Animations subtiles** : Expérience utilisateur améliorée

### Navigation Intuitive
- **Menu principal** : Accès rapide aux fonctionnalités
- **Breadcrumbs** : Navigation contextuelle
- **Boutons d'action** : Actions claires et visibles

## 🔒 Sécurité

- **JWT Tokens** : Authentification sécurisée
- **Validation des données** : Protection contre les injections
- **Hachage des mots de passe** : bcryptjs
- **CORS configuré** : Protection cross-origin

## 📱 Compatibilité

- **Navigateurs modernes** : Chrome, Firefox, Safari, Edge
- **Mobile responsive** : Optimisé pour smartphones
- **PWA ready** : Installation possible sur mobile

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Développé avec ❤️ pour la communauté FIFA Pro Clubs** 🏆⚽
