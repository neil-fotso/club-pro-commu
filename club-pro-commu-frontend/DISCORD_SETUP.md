# 🎮 Configuration Discord - Club Pro Communauté

## 📋 Prérequis

1. **Compte Discord** avec permissions d'administrateur sur un serveur
2. **Accès au Discord Developer Portal**

## 🔧 Configuration Discord

### 1. Créer l'application Discord

1. Va sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique **"New Application"**
3. **Nom :** `Club Pro Communauté`
4. **Description :** `Plateforme de gestion des clubs EA Sports FC Pro Clubs`

### 2. Configurer le Bot

1. **Onglet "Bot"** → **"Add Bot"**
2. **Token du Bot** → **Copie le token** (gardez-le secret !)
3. **Privileged Gateway Intents** → **Active tout** :
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

### 3. Configurer les Webhooks

1. **Onglet "Webhooks"** → **"New Webhook"**
2. **Nom :** `Club Pro Notifications`
3. **Canal :** Choisis un canal pour les notifications
4. **Copie l'URL du webhook** (commence par `https://discord.com/api/webhooks/`)

### 4. Inviter le Bot sur ton serveur

1. **Onglet "OAuth2"** → **"URL Generator"**
2. **Scopes :** `bot`
3. **Bot Permissions :** 
   - Send Messages
   - Embed Links
   - Use Slash Commands
4. **Copie l'URL générée** et ouvre-la dans ton navigateur
5. **Sélectionne ton serveur** et autorise le bot

## 🔐 Configuration Backend

### Variables d'environnement

Ajoute ces variables dans ton fichier `.env` :

```env
# Configuration Discord
DISCORD_BOT_TOKEN=ton_token_bot_ici
DISCORD_WEBHOOK_URL=ton_url_webhook_ici
DISCORD_CLIENT_ID=ton_client_id_ici
DISCORD_CLIENT_SECRET=ton_client_secret_ici
```

### Où trouver ces valeurs :

- **DISCORD_BOT_TOKEN** : Onglet "Bot" → "Token" → "Copy"
- **DISCORD_WEBHOOK_URL** : Onglet "Webhooks" → URL du webhook
- **DISCORD_CLIENT_ID** : Onglet "General Information" → "Application ID"
- **DISCORD_CLIENT_SECRET** : Onglet "General Information" → "Client Secret"

## 🚀 Test de l'intégration

### 1. Redémarre le backend
```bash
cd club-pro-commu-backend
node server.js
```

### 2. Teste les notifications
- Crée une invitation de club
- Accepte/refuse une invitation
- Crée une compétition
- Promouvois un membre en admin
- Exclus un membre

### 3. Vérifie les notifications Discord
Les notifications devraient apparaître dans le canal configuré avec :
- ✅ Embeds colorés
- 📊 Informations détaillées
- 🏆 Icônes appropriées

## 🔧 Fonctionnalités activées

### Notifications automatiques :
- 🏆 **Invitations de club** : Quand un joueur reçoit une invitation
- ✅ **Acceptation d'invitation** : Quand un joueur accepte
- ❌ **Refus d'invitation** : Quand un joueur refuse
- 🏆 **Nouvelles compétitions** : Quand une compétition est créée
- 👑 **Promotion admin** : Quand un membre devient admin
- 🚫 **Exclusion de club** : Quand un membre est exclu

### Prochaines étapes :
- 🤖 **Bot Discord** avec commandes slash
- 🔗 **Linking Discord ID** aux profils utilisateurs
- 🎮 **Statuts en jeu** synchronisés
- 📊 **Statistiques avancées**

## 🛠️ Dépannage

### Problème : "Discord webhook non configuré"
- Vérifie que `DISCORD_WEBHOOK_URL` est défini dans `.env`
- Vérifie que l'URL du webhook est correcte

### Problème : "Erreur lors de l'envoi de la notification Discord"
- Vérifie que le webhook est toujours actif
- Vérifie les permissions du bot sur le serveur
- Vérifie que le canal existe toujours

### Problème : Notifications ne s'affichent pas
- Vérifie que le bot a les permissions "Send Messages" et "Embed Links"
- Vérifie que le webhook pointe vers le bon canal

## 📞 Support

Si tu rencontres des problèmes :
1. Vérifie les logs du backend
2. Teste l'URL du webhook avec un outil comme Postman
3. Vérifie les permissions du bot sur Discord 