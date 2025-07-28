const { Client, Intents } = require('discord.js');

class DiscordBotService {
  constructor() {
    this.client = null;
    this.isReady = false;
  }

  // Initialiser le bot
  async initialize() {
    try {
      const token = process.env.DISCORD_BOT_TOKEN;
      if (!token) {
        console.warn('DISCORD_BOT_TOKEN non configuré, bot Discord désactivé');
        return false;
      }

      this.client = new Client({
        intents: [
          Intents.FLAGS.GUILDS,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        ],
      });

      // Événements du bot
      this.client.on('ready', () => {
        console.log(`🤖 Bot Discord connecté: ${this.client.user.tag}`);
        this.isReady = true;
      });

      this.client.on('guildCreate', (guild) => {
        console.log(`✅ Bot ajouté au serveur: ${guild.name}`);
      });

      this.client.on('guildDelete', (guild) => {
        console.log(`❌ Bot retiré du serveur: ${guild.name}`);
      });

      // Connexion
      await this.client.login(token);
      return true;
    } catch (error) {
      console.error('Erreur initialisation bot Discord:', error);
      return false;
    }
  }

  // Envoyer un message dans un canal
  async sendMessage(channelId, message) {
    if (!this.isReady || !this.client) {
      console.warn('Bot Discord non prêt');
      return false;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel) {
        await channel.send(message);
        return true;
      }
    } catch (error) {
      console.error('Erreur envoi message Discord:', error);
    }
    return false;
  }

  // Envoyer une notification d'événement
  async sendEventNotification(eventType, data) {
    const channelId = process.env.DISCORD_NOTIFICATION_CHANNEL;
    if (!channelId) {
      console.warn('DISCORD_NOTIFICATION_CHANNEL non configuré');
      return false;
    }

    const message = this.formatEventMessage(eventType, data);
    return await this.sendMessage(channelId, message);
  }

  // Formater les messages d'événements
  formatEventMessage(eventType, data) {
    const timestamp = new Date().toLocaleString('fr-FR');
    
    switch (eventType) {
      case 'CLUB_INVITATION':
        return `🎯 **Nouvelle invitation de club**\n` +
               `👤 Invité: ${data.inviteName}\n` +
               `🏆 Club: ${data.clubName}\n` +
               `💬 Message: ${data.message || 'Aucun message'}\n` +
               `⏰ ${timestamp}`;

      case 'INVITATION_ACCEPTED':
        return `✅ **Invitation acceptée**\n` +
               `👤 Joueur: ${data.playerName}\n` +
               `🏆 Club: ${data.clubName}\n` +
               `⏰ ${timestamp}`;

      case 'INVITATION_REFUSED':
        return `❌ **Invitation refusée**\n` +
               `👤 Joueur: ${data.playerName}\n` +
               `🏆 Club: ${data.clubName}\n` +
               `⏰ ${timestamp}`;

      case 'ADMIN_PROMOTION':
        return `👑 **Promotion admin**\n` +
               `👤 Joueur: ${data.playerName}\n` +
               `🏆 Club: ${data.clubName}\n` +
               `👑 Promu par: ${data.promoterName}\n` +
               `⏰ ${timestamp}`;

      case 'MEMBER_EXCLUSION':
        return `🚫 **Exclusion de membre**\n` +
               `👤 Joueur: ${data.playerName}\n` +
               `🏆 Club: ${data.clubName}\n` +
               `👑 Exclu par: ${data.excluderName}\n` +
               `⏰ ${timestamp}`;

      case 'NEW_COMPETITION':
        return `🏆 **Nouvelle compétition**\n` +
               `📝 Nom: ${data.name}\n` +
               `👤 Créateur: ${data.creatorName}\n` +
               `💰 Récompense: ${data.reward}\n` +
               `⏰ ${timestamp}`;

      default:
        return `📢 **Événement: ${eventType}**\n` +
               `📊 Données: ${JSON.stringify(data)}\n` +
               `⏰ ${timestamp}`;
    }
  }

  // Arrêter le bot
  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      console.log('🤖 Bot Discord déconnecté');
    }
  }
}

module.exports = new DiscordBotService(); 