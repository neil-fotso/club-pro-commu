# 🗃️ Scripts de Gestion de Base de Données

Ce dossier contient des scripts pour gérer les bases de données du projet Club Pro Commu.

## 📋 Liste des Scripts Disponibles

### 🔄 Scripts de Création de Données
- `createMassTestData.js` - Crée 30 joueurs, 1 admin et 12 clubs de test
- `assignPlayersToClubs.js` - Assigne les joueurs aux clubs de manière réaliste

### 🗑️ Scripts de Nettoyage
- `clearLocalDatabase.js` - Vide complètement la base de données locale
- `clearRemoteDatabase.js` - Vide la base de données de production (⚠️ DANGEREUX)

## 🚀 Utilisation

### Vider la Base de Données Locale

```bash
# Se placer dans le dossier backend
cd club-pro-commu-backend

# Vider la base locale
node scripts/clearLocalDatabase.js
```

**⚠️ Attention :** Cette commande supprime TOUTES les données de votre base locale MongoDB.

### Vider la Base de Données de Production

```bash
# TRÈS DANGEREUX - À utiliser avec précaution
node scripts/clearRemoteDatabase.js
```

**🚨 DANGER :** Cette commande supprime TOUTES les données de production ! 
- Nécessite la variable `MONGODB_URI_PRODUCTION` dans `.env`
- Inclut des délais de sécurité et des confirmations
- Action IRRÉVERSIBLE

### Créer des Données de Test

```bash
# Créer des utilisateurs, joueurs et clubs de test
node scripts/createMassTestData.js

# Assigner les joueurs aux clubs
node scripts/assignPlayersToClubs.js
```

## 🔐 Configuration Requise

### Variables d'Environnement

Créez un fichier `.env` dans le dossier `club-pro-commu-backend` :

```env
# Base de données locale
MONGO_URI=mongodb://localhost:27017/club-pro-commu

# Base de données de production (optionnel, pour clearRemoteDatabase.js)
MONGODB_URI_PRODUCTION=mongodb+srv://user:password@cluster.mongodb.net/database
```

## 📊 Que Font Ces Scripts ?

### `clearLocalDatabase.js`
- Se connecte à la base MongoDB locale
- Compte tous les documents existants
- Supprime toutes les collections :
  - Users (utilisateurs)
  - Players (joueurs)
  - Clubs
  - Competitions (compétitions)
  - Notifications
  - Invitations
- Affiche un rapport détaillé

### `clearRemoteDatabase.js`
- **Mesures de sécurité renforcées :**
  - Vérifie que l'URI ne pointe pas vers localhost
  - Délais de réflexion (13 secondes total)
  - Avertissements multiples
  - Rapport détaillé
- Supprime toutes les données de production

### `createMassTestData.js`
- Crée 1 administrateur avec les accès :
  - Email : `admin@clubprocommu.fr`
  - Mot de passe : `TestPassword123!`
- Crée 30 joueurs de test avec des profils variés
- Crée 12 clubs avec des configurations réalistes
- Mot de passe commun pour tous : `TestPassword123!`

### `assignPlayersToClubs.js`
- Répartit les joueurs dans les clubs (3-8 joueurs par club)
- Assigne des rôles : Admin, Capitaine, Joueur
- Met à jour les statuts de recherche de club
- Affiche un rapport complet des assignations

## 🛡️ Sécurité

### Base Locale
- Aucune restriction particulière
- Suppression immédiate après confirmation visuelle

### Base de Production
- Vérification que l'URI n'est pas localhost
- Délai de 10 secondes pour réfléchir
- Délai supplémentaire de 3 secondes
- Possibilité d'annuler avec Ctrl+C
- Rapport détaillé des suppressions

## 📝 Exemples d'Utilisation Typiques

### Repartir à Zéro en Local
```bash
# 1. Vider la base
node scripts/clearLocalDatabase.js

# 2. Créer de nouvelles données
node scripts/createMassTestData.js

# 3. Assigner les joueurs aux clubs
node scripts/assignPlayersToClubs.js
```

### Nettoyer la Production (TRÈS RARE)
```bash
# Seulement en cas de besoin absolu
node scripts/clearRemoteDatabase.js
```

## ⚠️ Avertissements Importants

1. **Sauvegardez toujours** vos données importantes avant d'utiliser ces scripts
2. **Testez en local** avant de toucher à la production
3. **Vérifiez l'URL** de connexion dans les logs
4. **Les actions sont irréversibles** - aucun moyen de récupérer les données supprimées
5. **Coordonnez avec l'équipe** avant de vider la production

## 🆘 En Cas de Problème

- **Erreur de connexion :** Vérifiez que MongoDB est lancé (local) ou que les credentials sont corrects (production)
- **Permissions :** Assurez-vous d'avoir les droits de lecture/écriture sur la base
- **Variables manquantes :** Vérifiez votre fichier `.env`

## 📞 Support

En cas de problème avec ces scripts, vérifiez :
1. La connexion MongoDB
2. Les variables d'environnement 
3. Les permissions sur la base de données
4. Les logs d'erreur pour plus de détails 