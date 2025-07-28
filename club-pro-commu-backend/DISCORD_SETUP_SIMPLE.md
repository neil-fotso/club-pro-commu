# 🎮 Configuration Discord - Version Simplifiée

## 🚀 **Option 1 : Utiliser l'URL de production (Recommandé)**

### **Étape 1 : Utiliser l'URL Render**
Ton backend est déjà déployé sur Render. Utilise cette URL :

```
https://club-pro-commu-backend.onrender.com/api/discord/webhook
```

### **Étape 2 : Configuration Discord**
1. Va sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Sélectionne ton application "Club Pro Communauté"
3. **Onglet "Webhooks"** → **"New Webhook"**
4. Configure :
   - **Nom :** `Club Pro Notifications`
   - **Canal :** Choisis un canal pour les notifications
   - **Endpoint URL :** `https://club-pro-commu-backend.onrender.com/api/discord/webhook`

### **Étape 3 : Test de l'endpoint**
```bash
curl -X GET https://club-pro-commu-backend.onrender.com/api/discord/health
```

## 🔧 **Option 2 : Tunnel local (si nécessaire)**

Si tu veux tester en local :

```bash
# Démarrer le tunnel
npx localtunnel --port 3001

# Ou avec un sous-domaine personnalisé
npx localtunnel --port 3001 --subdomain club-pro-commu
```

## 📋 **Variables d'environnement**

Ajoute dans ton `.env` local pour les tests :

```env
# Configuration Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/ton_webhook_id/ton_token
DISCORD_BOT_TOKEN=ton_token_bot
```

## 🧪 **Test de l'intégration**

1. **Redémarre le backend local :**
   ```bash
   node server.js
   ```

2. **Teste les notifications :**
   - Crée une invitation de club
   - Accepte/refuse une invitation
   - Crée une compétition

3. **Vérifie les logs :**
   - Le backend devrait afficher "Notification Discord envoyée avec succès"
   - Les notifications apparaissent dans ton canal Discord

## 🛠️ **Dépannage**

### Problème : "Discord webhook non configuré"
- Vérifie que `DISCORD_WEBHOOK_URL` est défini
- Teste l'URL avec curl

### Problème : Notifications ne s'affichent pas
- Vérifie les permissions du webhook sur Discord
- Vérifie que le canal existe

### Problème : Erreur 404
- Vérifie que l'URL de l'endpoint est correcte
- Vérifie que le serveur backend est démarré 