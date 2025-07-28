const axios = require('axios');

class DiscordSimpleService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.botToken = process.env.DISCORD_BOT_TOKEN;
    this.channelId = process.env.DISCORD_NOTIFICATION_CHANNEL;
    this.competitionChannelId = process.env.DISCORD_COMPETITION_CHANNEL;
  }

  // Envoyer un message via webhook Discord
  async sendWebhookMessage(message) {
    if (!this.webhookUrl) {
      console.warn('DISCORD_WEBHOOK_URL non configuré');
      return false;
    }

    try {
      const payload = {
        content: message,
        username: 'Club Pro Communauté',
        avatar_url: 'https://cdn.discordapp.com/attachments/123456789/123456789/logo.png' // Optionnel
      };

      await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Message Discord envoyé via webhook');
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi webhook Discord:', error.message);
      return false;
    }
  }

  // Envoyer un message via API Discord (si bot token disponible)
  async sendBotMessage(message, channelId = null) {
    const targetChannelId = channelId || this.channelId;
    
    if (!this.botToken || !targetChannelId) {
      console.warn('DISCORD_BOT_TOKEN ou canal non configuré');
      return false;
    }

    try {
      const payload = {
        content: message
      };

      await axios.post(`https://discord.com/api/v10/channels/${targetChannelId}/messages`, payload, {
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Message Discord envoyé via bot');
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi bot Discord:', error.message);
      return false;
    }
  }

  // Envoyer une notification (priorité au bot)
  async sendNotification(message) {
    // Essayer d'abord le bot
    const botSuccess = await this.sendBotMessage(message);
    if (botSuccess) {
      return true;
    }

    // Fallback sur webhook seulement si configuré
    if (this.webhookUrl) {
      return await this.sendWebhookMessage(message);
    }

    console.warn('Aucune méthode Discord configurée (bot ou webhook)');
    return false;
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

      case 'COMPETITION_DELETED':
        return `🗑️ **Compétition supprimée**\n` +
               `📝 Nom: ${data.name}\n` +
               `👤 Supprimée par: ${data.deleterName}\n` +
               `📅 Date de création: ${data.creationDate}\n` +
               `⏰ ${timestamp}`;

      default:
        return `📢 **Événement: ${eventType}**\n` +
               `📊 Données: ${JSON.stringify(data)}\n` +
               `⏰ ${timestamp}`;
    }
  }

  // Méthodes spécifiques pour chaque type d'événement
  async sendClubInvitation(invitation, club, inviteur, invite) {
    const data = {
      inviteName: invite.pseudo,
      clubName: club.nom,
      message: invitation.message || 'Aucun message'
    };
    
    const message = this.formatEventMessage('CLUB_INVITATION', data);
    return await this.sendNotification(message);
  }

  async sendInvitationAccepted(invitation, club, joueur) {
    const data = {
      playerName: joueur.pseudo,
      clubName: club.nom
    };
    
    const message = this.formatEventMessage('INVITATION_ACCEPTED', data);
    return await this.sendNotification(message);
  }

  async sendInvitationRefused(invitation, club, joueur) {
    const data = {
      playerName: joueur.pseudo,
      clubName: club.nom
    };
    
    const message = this.formatEventMessage('INVITATION_REFUSED', data);
    return await this.sendNotification(message);
  }

  async sendAdminPromotion(club, joueurPromu, promoteur) {
    const data = {
      playerName: joueurPromu.pseudo,
      clubName: club.nom,
      promoterName: promoteur.pseudo
    };
    
    const message = this.formatEventMessage('ADMIN_PROMOTION', data);
    return await this.sendNotification(message);
  }

  async sendClubExclusion(club, joueurExclu, excluteur) {
    const data = {
      playerName: joueurExclu.pseudo,
      clubName: club.nom,
      excluderName: excluteur.pseudo
    };
    
    const message = this.formatEventMessage('MEMBER_EXCLUSION', data);
    return await this.sendNotification(message);
  }

  async sendNewCompetition(competition, createur) {
    const data = {
      name: competition.nom,
      creatorName: createur.pseudo,
      reward: competition.recompense || 'Non spécifiée'
    };
    
    const message = this.formatEventMessage('NEW_COMPETITION', data);
    
    // Envoyer dans le canal compétitions si configuré, sinon canal général
    if (this.competitionChannelId) {
      return await this.sendBotMessage(message, this.competitionChannelId);
    } else {
      return await this.sendNotification(message);
    }
  }

  async sendCompetitionDeleted(competition, deleter) {
    const data = {
      name: competition.nom,
      deleterName: deleter.pseudo,
      creationDate: new Date(competition.dateCreation).toLocaleDateString('fr-FR')
    };
    
    const message = this.formatEventMessage('COMPETITION_DELETED', data);
    
    // Envoyer dans le canal compétitions si configuré, sinon canal général
    if (this.competitionChannelId) {
      return await this.sendBotMessage(message, this.competitionChannelId);
    } else {
      return await this.sendNotification(message);
    }
  }

  // Créer automatiquement le canal compétitions
  async createCompetitionChannel(guildId) {
    if (!this.botToken) {
      console.warn('DISCORD_BOT_TOKEN non configuré');
      return null;
    }

    try {
      const payload = {
        name: '🏆-compétitions',
        type: 0, // Canal texte
        topic: 'Notifications automatiques des nouvelles compétitions Club Pro Communauté',
        permission_overwrites: [
          {
            id: guildId, // @everyone
            type: 0,
            deny: '1024', // SEND_MESSAGES
            allow: '1024' // VIEW_CHANNEL, READ_MESSAGE_HISTORY
          }
        ]
      };

      const response = await axios.post(`https://discord.com/api/v10/guilds/${guildId}/channels`, payload, {
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json'
        }
      });

      const channelId = response.data.id;
      console.log(`✅ Canal compétitions créé: ${response.data.name} (ID: ${channelId})`);
      
      return channelId;
    } catch (error) {
      console.error('❌ Erreur création canal compétitions:', error.response?.data || error.message);
      return null;
    }
  }
}

module.exports = new DiscordSimpleService(); 