# Configuration Discord Webhooks - Guide Complet

## 1. Configuration dans Discord Developer Portal

### Étape 1: Créer une Application Discord
1. Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquer sur "New Application"
3. Donner un nom à votre application (ex: "Club Pro Communauté")
4. Noter l'**Application ID** et le **Public Key**

### Étape 2: Configurer les Webhooks d'Événements
1. Dans votre application, aller dans "General Information"
2. Noter le **Public Key** (nécessaire pour la vérification de signature)
3. Aller dans "Bot" → "Add Bot"
4. Aller dans "Events" → "Webhooks"
5. Cliquer sur "New Webhook"
6. Configurer l'URL: `https://votre-domaine.com/api/discord/webhook`
7. Sélectionner les événements à écouter:
   - `MESSAGE_CREATE`
   - `GUILD_MEMBER_ADD`
   - `GUILD_MEMBER_REMOVE`
   - `GUILD_ROLE_CREATE`
   - `GUILD_ROLE_UPDATE`

### Étape 3: Variables d'Environnement
Ajouter dans votre fichier `.env`:
```
DISCORD_PUBLIC_KEY=votre_public_key_ici
DISCORD_APPLICATION_ID=votre_application_id_ici
DISCORD_BOT_TOKEN=votre_bot_token_ici
```

## 2. Vérification de la Configuration

### Test de l'Endpoint
```bash
# Test GET
curl https://votre-domaine.com/api/discord/webhook

# Test POST avec ping
curl -X POST https://votre-domaine.com/api/discord/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": 1}'
```

### Vérification dans Discord
1. Dans Discord Developer Portal → Events → Webhooks
2. Cliquer sur "Test" pour envoyer un événement de test
3. Vérifier les logs du serveur pour confirmer la réception

## 3. Types d'Événements Supportés

### Événements de Base
- `type: 1` - PING (réponse automatique PONG)
- `type: 2` - INTERACTION (accusé de réception)

### Événements Spécifiques
- `MESSAGE_CREATE` - Nouveau message
- `GUILD_MEMBER_ADD` - Nouveau membre
- `GUILD_MEMBER_REMOVE` - Membre parti
- `GUILD_ROLE_CREATE` - Nouveau rôle
- `GUILD_ROLE_UPDATE` - Rôle modifié

## 4. Sécurité

### Vérification de Signature
Le serveur vérifie automatiquement la signature Discord avec:
- Header `x-signature-ed25519`
- Header `x-signature-timestamp`
- Clé publique Discord

### Gestion des Erreurs
- Signature invalide → 401 Unauthorized
- Événement non reconnu → 200 OK (avec log)
- Erreur serveur → 500 Internal Server Error

## 5. Déploiement

### Variables d'Environnement Requises
```bash
# Render/Vercel
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_APPLICATION_ID=your_app_id
DISCORD_BOT_TOKEN=your_bot_token
```

### URL de Production
- Remplacer `votre-domaine.com` par votre vrai domaine
- Exemple: `https://club-pro-commu.onrender.com/api/discord/webhook`

## 6. Troubleshooting

### Erreur "URL non vérifiée"
1. Vérifier que l'URL est accessible publiquement
2. S'assurer que l'endpoint répond avec 200 OK
3. Vérifier que le tunnel localtunnel est actif

### Erreur de Signature
1. Vérifier que `DISCORD_PUBLIC_KEY` est correcte
2. S'assurer que la clé publique est dans le bon format
3. Vérifier les logs pour plus de détails

### Événements non reçus
1. Vérifier que les événements sont activés dans Discord
2. S'assurer que l'URL webhook est correcte
3. Vérifier les logs du serveur pour les erreurs 