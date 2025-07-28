# Configuration Bot Discord 🚀

## Alternative aux Webhooks Discord

Au lieu d'utiliser les webhooks Discord qui posent des problèmes de validation, nous utilisons maintenant un **Bot Discord** qui est plus fiable et flexible.

## 1. Créer un Bot Discord

### Étape 1 : Aller sur Discord Developer Portal
1. Va sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique sur **"New Application"**
3. Donne un nom à ton application (ex: "Club Pro Communauté Bot")

### Étape 2 : Créer le Bot
1. Dans ton application, va dans **"Bot"** (menu de gauche)
2. Clique sur **"Add Bot"**
3. Clique sur **"Yes, do it!"**

### Étape 3 : Configurer le Bot
1. **Token du Bot** : Clique sur **"Reset Token"** et copie le token
2. **Préfixe** : Laisse le préfixe par défaut (ex: `!`)
3. **Présence** : Tu peux laisser vide ou mettre "Club Pro Communauté"

### Étape 4 : Permissions du Bot
1. Dans **"Bot"**, va dans **"Privileged Gateway Intents"**
2. Active :
   - ✅ **MESSAGE CONTENT INTENT**
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **PRESENCE INTENT**

## 2. Inviter le Bot sur ton Serveur

### Étape 1 : Générer le lien d'invitation
1. Va dans **"OAuth2"** → **"URL Generator"**
2. Dans **"Scopes"**, coche :
   - ✅ **bot**
   - ✅ **applications.commands**
3. Dans **"Bot Permissions"**, coche :
   - ✅ **Send Messages**
   - ✅ **Read Message History**
   - ✅ **Use Slash Commands**
   - ✅ **Embed Links**
4. Copie l'URL générée

### Étape 2 : Inviter le Bot
1. Ouvre l'URL générée dans ton navigateur
2. Sélectionne ton serveur Discord
3. Clique sur **"Authorize"**

## 3. Configurer les Variables d'Environnement

Ajoute ces variables dans ton fichier `.env` :

```env
# Bot Discord
DISCORD_BOT_TOKEN=ton_token_du_bot_ici
DISCORD_NOTIFICATION_CHANNEL=ID_du_canal_pour_les_notifications

# Webhook (fallback)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/ton_webhook
```

### Comment trouver l'ID du canal :
1. Active le **Mode développeur** dans Discord (Paramètres → Avancés → Mode développeur)
2. Clic droit sur le canal où tu veux les notifications
3. Clique sur **"Copier l'identifiant"**

## 4. Tester le Bot

### Étape 1 : Redémarrer le serveur
```bash
pkill -f "node server.js" && node server.js
```

### Étape 2 : Vérifier la connexion
Tu devrais voir dans les logs :
```
🤖 Bot Discord connecté: NomDuBot#1234
```

### Étape 3 : Tester une notification
Crée une invitation de club ou une compétition pour voir si les notifications arrivent dans le canal Discord.

## 5. Avantages du Bot vs Webhooks

### ✅ Avantages du Bot :
- **Plus fiable** : Pas de problèmes de validation d'URL
- **Plus flexible** : Peut envoyer des messages dans plusieurs canaux
- **Plus sécurisé** : Token d'authentification robuste
- **Plus de fonctionnalités** : Peut lire les messages, réagir, etc.

### ❌ Inconvénients :
- **Plus complexe** à configurer initialement
- **Nécessite** d'inviter le bot sur le serveur

## 6. Fallback sur Webhook

Si le bot ne fonctionne pas, le système utilise automatiquement le webhook comme fallback.

## 7. Commandes Utiles

### Vérifier l'état du bot :
```bash
curl https://ton-serveur.com/api/discord/health
```

### Tester une notification :
```bash
curl -X POST https://ton-serveur.com/api/discord/test
```

## 8. Dépannage

### Le bot ne se connecte pas :
1. Vérifie que le `DISCORD_BOT_TOKEN` est correct
2. Vérifie que les **Intents** sont activés
3. Vérifie que le bot a les bonnes permissions

### Les notifications n'arrivent pas :
1. Vérifie que `DISCORD_NOTIFICATION_CHANNEL` est correct
2. Vérifie que le bot a accès au canal
3. Vérifie les logs du serveur

### Erreur "Missing Permissions" :
1. Vérifie que le bot a la permission **"Send Messages"**
2. Vérifie que le bot a la permission **"Embed Links"**

## 9. Migration depuis les Webhooks

Si tu avais déjà configuré les webhooks :
1. **Garde** `DISCORD_WEBHOOK_URL` comme fallback
2. **Ajoute** `DISCORD_BOT_TOKEN` et `DISCORD_NOTIFICATION_CHANNEL`
3. **Redémarre** le serveur
4. Le système utilisera automatiquement le bot en priorité

---

**🎉 Félicitations !** Ton bot Discord est maintenant configuré et prêt à envoyer des notifications pour tous les événements de ton application Club Pro Communauté ! 