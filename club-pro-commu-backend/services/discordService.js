const discordSimple = require('./discordSimple');

class DiscordService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.botToken = process.env.DISCORD_BOT_TOKEN;
  }

  // Envoyer une notification Discord
  async sendNotification(embed) {
    // Utiliser le service Discord simplifié
    const message = this.formatEmbedToMessage(embed);
    return await discordSimple.sendNotification(message);
  }

  // Convertir un embed en message Discord
  formatEmbedToMessage(embed) {
    let message = `**${embed.title}**\n`;
    message += `${embed.description}\n\n`;
    
    if (embed.fields) {
      embed.fields.forEach(field => {
        message += `**${field.name}**: ${field.value}\n`;
      });
    }
    
    if (embed.footer) {
      message += `\n${embed.footer.text}`;
    }
    
    return message;
  }

  // Notification d'invitation de club
  async sendClubInvitation(invitation, club, inviteur, invite) {
    const embed = {
      title: '🏆 Invitation à rejoindre un club',
      description: `${inviteur.pseudo} vous invite à rejoindre **${club.nom}**`,
      color: 0x00ff00, // Vert
      fields: [
        {
          name: '🏟️ Club',
          value: `${club.nom} (${club.plateforme})`,
          inline: true
        },
        {
          name: '🌍 Pays',
          value: club.pays,
          inline: true
        },
        {
          name: '👤 Inviteur',
          value: inviteur.pseudo,
          inline: true
        }
      ],
      footer: {
        text: 'Club Pro Communauté'
      },
      timestamp: new Date().toISOString()
    };

    if (invitation.message) {
      embed.fields.push({
        name: '💬 Message',
        value: invitation.message,
        inline: false
      });
    }

    await this.sendNotification(embed);
  }

  // Notification d'acceptation d'invitation
  async sendInvitationAccepted(invitation, club, joueur) {
    const embed = {
      title: '✅ Invitation acceptée',
      description: `${joueur.pseudo} a accepté votre invitation à rejoindre **${club.nom}**`,
      color: 0x00ff00, // Vert
      fields: [
        {
          name: '🏟️ Club',
          value: club.nom,
          inline: true
        },
        {
          name: '👤 Nouveau membre',
          value: joueur.pseudo,
          inline: true
        },
        {
          name: '📊 Effectif',
          value: `${club.membres?.length || 0}/${club.effectifMax} membres`,
          inline: true
        }
      ],
      footer: {
        text: 'Club Pro Communauté'
      },
      timestamp: new Date().toISOString()
    };

    await this.sendNotification(embed);
  }

  // Notification de refus d'invitation
  async sendInvitationRefused(invitation, club, joueur) {
    const embed = {
      title: '❌ Invitation refusée',
      description: `${joueur.pseudo} a refusé votre invitation à rejoindre **${club.nom}**`,
      color: 0xff0000, // Rouge
      fields: [
        {
          name: '🏟️ Club',
          value: club.nom,
          inline: true
        },
        {
          name: '👤 Joueur',
          value: joueur.pseudo,
          inline: true
        }
      ],
      footer: {
        text: 'Club Pro Communauté'
      },
      timestamp: new Date().toISOString()
    };

    await this.sendNotification(embed);
  }

  // Notification de nouvelle compétition
  async sendNewCompetition(competition, createur) {
    const embed = {
      title: '🏆 Nouvelle compétition créée',
      description: `**${competition.nom}** a été créée par ${createur.pseudo}`,
      color: 0x0099ff, // Bleu
      fields: [
        {
          name: '🏆 Compétition',
          value: competition.nom,
          inline: true
        },
        {
          name: '📅 Date de début',
          value: new Date(competition.dateDebut).toLocaleDateString('fr-FR'),
          inline: true
        },
        {
          name: '💰 Récompense',
          value: competition.recompense || 'À définir',
          inline: true
        },
        {
          name: '📝 Description',
          value: competition.description || 'Aucune description',
          inline: false
        }
      ],
      footer: {
        text: 'Club Pro Communauté'
      },
      timestamp: new Date().toISOString()
    };

    await this.sendNotification(embed);
  }

  // Notification de promotion admin
  async sendAdminPromotion(club, joueur, promoteur) {
    const embed = {
      title: '👑 Promotion Admin',
      description: `${joueur.pseudo} a été promu admin de **${club.nom}** par ${promoteur.pseudo}`,
      color: 0xffd700, // Or
      fields: [
        {
          name: '🏟️ Club',
          value: club.nom,
          inline: true
        },
        {
          name: '👤 Nouveau admin',
          value: joueur.pseudo,
          inline: true
        },
        {
          name: '👑 Promoteur',
          value: promoteur.pseudo,
          inline: true
        }
      ],
      footer: {
        text: 'Club Pro Communauté'
      },
      timestamp: new Date().toISOString()
    };

    await this.sendNotification(embed);
  }

  // Notification d'exclusion de club
  async sendClubExclusion(club, joueur, excluteur) {
    const embed = {
      title: '🚫 Exclusion du club',
      description: `${joueur.pseudo} a été exclu de **${club.nom}** par ${excluteur.pseudo}`,
      color: 0xff0000, // Rouge
      fields: [
        {
          name: '🏟️ Club',
          value: club.nom,
          inline: true
        },
        {
          name: '👤 Joueur exclu',
          value: joueur.pseudo,
          inline: true
        },
        {
          name: '👑 Excluteur',
          value: excluteur.pseudo,
          inline: true
        }
      ],
      footer: {
        text: 'Club Pro Communauté'
      },
      timestamp: new Date().toISOString()
    };

    await this.sendNotification(embed);
  }
}

module.exports = new DiscordService(); 