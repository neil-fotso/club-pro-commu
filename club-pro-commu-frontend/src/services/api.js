// Configuration de l'API
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://club-pro-commu.onrender.com/api'
  : 'http://localhost:3001/api';

// Debug: Afficher l'URL utilisée
console.log('🔧 Configuration API:', {
  NODE_ENV: process.env.NODE_ENV,
  API_URL: API_URL,
  isProduction: process.env.NODE_ENV === 'production'
});

// Fonction utilitaire pour récupérer le token
const getToken = () => {
  return localStorage.getItem('token');
};

// Fonction utilitaire pour les headers d'authentification
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Fonction utilitaire pour les appels API
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Configuration par défaut
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Ajouter les headers d'authentification seulement si pas explicitement désactivé et si un token existe
  if (!options.skipAuth) {
    const authHeaders = getAuthHeaders();
    if (authHeaders.Authorization) {
      defaultHeaders['Authorization'] = authHeaders.Authorization;
    }
  }
  
  // Fusionner les headers en s'assurant que Content-Type reste application/json
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };
  
  // Forcer le Content-Type à application/json pour les requêtes avec body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    headers,
    ...options,
  };

  // S'assurer que le body est stringifié pour les requêtes POST/PUT
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
    // Forcer explicitement le Content-Type pour les requêtes avec body
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Oups ! Il semble y avoir eu un petit problème technique. Pas de panique, réessayez dans quelques instants ! 🚀');
    }
    
    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// API d'authentification
export const authAPI = {
  // Inscription
  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  // Connexion
  login: async (credentials) => {
    // Adapter le format pour le backend qui attend email et password
    const { emailOrPseudo, password } = credentials;
    return apiCall('/auth/login', {
      method: 'POST',
      body: {
        email: emailOrPseudo, // Le backend attend 'email'
        password
      },
    });
  },

  // Récupérer les données de l'utilisateur connecté
  getMe: async () => {
    return apiCall('/auth/me');
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    return apiCall('/auth/change-password', {
      method: 'POST',
      body: passwordData,
    });
  },
};

// API utilisateur
export const userAPI = {
  // Récupérer le profil utilisateur
  getProfile: async () => {
    return apiCall('/user/me');
  },
  
  exerciseDataRights: async (requestType, reason) => {
    return apiCall('/api/user/exercise-data-rights', {
      method: 'POST',
      body: JSON.stringify({ requestType, reason })
    });
  },
  
  getDataRightsStatus: async () => {
    return apiCall('/api/user/data-rights-status');
  },

  // Récupérer les notifications non lues
  getUnreadNotifications: async () => {
    return apiCall('/notifications/non-lues');
  },

  // Marquer une notification comme lue
  markNotificationAsRead: async (notificationId) => {
    return apiCall(`/notifications/lire/${notificationId}`, {
      method: 'PUT',
    });
  }
};

// API joueurs
export const playerAPI = {
  // Recherche avancée des joueurs
  searchPlayers: async (params) => {
    return apiCall(`/players?${params}`);
  },

  // Récupérer tous les joueurs (ancienne méthode pour compatibilité)
  getPlayers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/players?${params}`);
  },

  // Récupérer un joueur spécifique
  getPlayer: async (id) => {
    return apiCall(`/players/${id}`, {
      skipAuth: true
    });
  },

  // Mettre à jour un profil joueur
  updatePlayer: async (id, playerData) => {
    return apiCall(`/players/${id}`, {
      method: 'PUT',
      body: playerData,
    });
  },

  // Ajouter des statistiques
  addStatistics: async (id, type, value = 1) => {
    return apiCall(`/players/${id}/statistics`, {
      method: 'POST',
      body: { type, value },
    });
  },

  // Ajouter une récompense
  addReward: async (id, reward) => {
    return apiCall(`/players/${id}/rewards`, {
      method: 'POST',
      body: reward,
    });
  },

  // Obtenir les recommandations
  getRecommendations: async () => {
    return apiCall('/players/recommendations');
  },

  // Récupérer mon profil joueur
  getMyProfile: async () => {
    return apiCall('/players/me');
  },

  // Supprimer un joueur (admin uniquement)
  deletePlayer: async (playerId) => {
    return apiCall(`/players/${playerId}`, {
      method: 'DELETE',
    });
  },

  // Récupérer tous les joueurs (admin uniquement)
  getAllPlayers: async () => {
    return apiCall('/players');
  },
};

// API clubs
export const clubAPI = {
  // Récupérer tous les clubs avec filtres
  getClubs: async (filters = {}) => {
    // Mapper les filtres frontend vers les paramètres backend
    const backendFilters = {};
    
    if (filters.nom) {
      backendFilters.search = filters.nom;
    }
    if (filters.plateforme) {
      backendFilters.plateforme = filters.plateforme;
    }
    if (filters.pays) {
      backendFilters.pays = filters.pays;
    }
    if (filters.recrute) {
      backendFilters.recrute = filters.recrute;
    }
    if (filters.langue) {
      backendFilters.langue = filters.langue;
    }
    
    const params = new URLSearchParams(backendFilters);
    return apiCall(`/clubs?${params}`);
  },

  // Récupérer un club par ID
  getClub: async (id) => {
    return apiCall(`/clubs/${id}`);
  },

  // Créer un club
  createClub: async (clubData, token) => {
    return apiCall('/clubs', {
      method: 'POST',
      body: clubData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // Mettre à jour un club
  updateClub: async (id, clubData, token) => {
    return apiCall(`/clubs/${id}`, {
      method: 'PUT',
      body: clubData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Demander à rejoindre un club
  joinClub: async (clubId, message = '', token) => {
    const options = {
      method: 'POST',
      body: { message }
    };
    
    if (token) {
      options.headers = {
        'Authorization': `Bearer ${token}`,
      };
    }
    
    return apiCall(`/clubs/${clubId}/join`, options);
  },

  // Récupérer les demandes d'adhésion d'un club
  getClubRequests: async (clubId) => {
    return apiCall(`/clubs/${clubId}/demandes`);
  },

  // Accepter une demande d'adhésion
  acceptRequest: async (clubId, demandeId) => {
    return apiCall(`/clubs/${clubId}/demandes/${demandeId}/accept`, {
      method: 'PUT',
    });
  },

  // Refuser une demande d'adhésion
  refuseRequest: async (clubId, demandeId) => {
    return apiCall(`/clubs/${clubId}/demandes/${demandeId}/refuse`, {
      method: 'PUT',
    });
  },

  // Vérifier si l'utilisateur a une demande en attente pour un club
  checkUserRequest: async (clubId) => {
    return apiCall(`/clubs/${clubId}/demande-utilisateur`);
  },

  // Annuler une demande d'adhésion
  cancelUserRequest: async (clubId) => {
    return apiCall(`/clubs/${clubId}/demande-utilisateur`, {
      method: 'DELETE',
    });
  },

  // Récupérer les notifications non lues
  getUnreadNotifications: async () => {
    return apiCall('/notifications/non-lues');
  },

  // Marquer une notification comme lue
  markNotificationAsRead: async (notificationId) => {
    return apiCall(`/notifications/lire/${notificationId}`, {
      method: 'PUT',
    });
  },

  // Quitter un club
  quitClub: async (clubId) => {
    return apiCall(`/clubs/${clubId}/quit`, {
      method: 'DELETE',
    });
  },

  // Supprimer un club (admin uniquement)
  deleteClub: async (clubId) => {
    return apiCall(`/clubs/${clubId}`, {
      method: 'DELETE',
    });
  },

  // Récupérer tous les clubs (admin uniquement)
  getAllClubs: async () => {
    return apiCall('/clubs');
  },
  leaveClub: async (clubId, token) => {
    if (token) {
      return apiCall(`/clubs/${clubId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    return apiCall(`/clubs/${clubId}/leave`, {
      method: 'POST',
    });
  },

  // Récupérer les clubs de l'utilisateur connecté
  getMyClubs: async (token) => {
    // Si un token est fourni explicitement, l'utiliser
    if (token) {
      return apiCall('/clubs/user/my-clubs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    // Sinon, utiliser l'authentification automatique
    return apiCall('/clubs/user/my-clubs');
  },

  // Promouvoir un membre en admin
  promoteMember: async (clubId, userId, token) => {
    if (token) {
      return apiCall(`/clubs/${clubId}/promouvoir/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    return apiCall(`/clubs/${clubId}/promouvoir/${userId}`, {
      method: 'PUT',
    });
  },

  // Exclure un membre du club
  excludeMember: async (clubId, userId, token) => {
    if (token) {
      return apiCall(`/clubs/${clubId}/exclure/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    return apiCall(`/clubs/${clubId}/exclure/${userId}`, {
      method: 'DELETE',
    });
  },
}; 

// API invitations
export const invitationAPI = {
  // Inviter un joueur dans un club
  invitePlayer: async (clubId, inviteId, message, token) => {
    return apiCall('/invitations/inviter', {
      method: 'POST',
      body: { clubId, inviteId, message },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Accepter une invitation
  acceptInvitation: async (invitationId, token) => {
    return apiCall(`/invitations/accepter/${invitationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Refuser une invitation
  refuseInvitation: async (invitationId, token) => {
    return apiCall(`/invitations/refuser/${invitationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Récupérer les invitations reçues
  getReceivedInvitations: async (token) => {
    return apiCall('/invitations/recues', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Récupérer les invitations envoyées
  getSentInvitations: async (token) => {
    return apiCall('/invitations/envoyees', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// API notifications
export const notificationAPI = {
  // Récupérer toutes les notifications
  getNotifications: async (token, page = 1, limit = 20) => {
    return apiCall(`/notifications?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Récupérer les notifications non lues
  getUnreadNotifications: async (token) => {
    return apiCall('/notifications/non-lues', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId, token) => {
    return apiCall(`/notifications/lire/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async (token) => {
    return apiCall('/notifications/lire-toutes', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Supprimer une notification
  deleteNotification: async (notificationId, token) => {
    return apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Supprimer toutes les notifications
  deleteAllNotifications: async (token) => {
    return apiCall('/notifications', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// API compétitions
export const competitionAPI = {
  // Récupérer toutes les compétitions
  getCompetitions: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/competitions?${params}`);
  },

  // Récupérer une compétition par ID
  getCompetition: async (id) => {
    return apiCall(`/competitions/${id}`);
  },

  // Créer une compétition
  createCompetition: async (competitionData, token) => {
    return apiCall('/competitions', {
      method: 'POST',
      body: competitionData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Mettre à jour une compétition
  updateCompetition: async (id, competitionData, token) => {
    return apiCall(`/competitions/${id}`, {
      method: 'PUT',
      body: competitionData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Supprimer une compétition
  deleteCompetition: async (id, token) => {
    return apiCall(`/competitions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // S'inscrire à une compétition
  inscrireClub: async (competitionId, clubId, message = '', token) => {
    return apiCall(`/competitions/${competitionId}/inscription`, {
      method: 'POST',
      body: { clubId, message },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Quitter une compétition
  quitterCompetition: async (competitionId, clubId, token) => {
    return apiCall(`/competitions/${competitionId}/inscription`, {
      method: 'DELETE',
      body: { clubId },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Simuler le paiement des frais d'inscription
  payerInscription: async (competitionId, clubId, paymentData, token) => {
    return apiCall(`/competitions/${competitionId}/inscriptions/${clubId}/payer`, {
      method: 'POST',
      body: paymentData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Traiter une demande d'inscription
  traiterDemandeInscription: async (competitionId, demandeId, action, reponse = '', token) => {
    return apiCall(`/competitions/${competitionId}/demandes/${demandeId}`, {
      method: 'PUT',
      body: { action, reponse },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Lancer une compétition
  lancerCompetition: async (competitionId, token) => {
    return apiCall(`/competitions/${competitionId}/lancer`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Mettre à jour le score d'un match
  mettreAJourScore: async (competitionId, matchId, scoreData, token) => {
    return apiCall(`/competitions/${competitionId}/matchs/${matchId}/score`, {
      method: 'PUT',
      body: scoreData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Programmer une date pour un match
  programmerMatch: async (competitionId, matchId, dateMatch, token) => {
    return apiCall(`/competitions/${competitionId}/matchs/${matchId}/date`, {
      method: 'PUT',
      body: { dateMatch },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Récupérer le classement d'une compétition
  getClassement: async (competitionId) => {
    return apiCall(`/competitions/${competitionId}/classement`);
  },

  // Récupérer les statistiques d'une compétition
  getStatistiques: async (competitionId) => {
    return apiCall(`/competitions/${competitionId}/statistiques`);
  },

  // Générer le bracket d'élimination directe
  genererElimination: async (competitionId) => {
    return apiCall(`/competitions/${competitionId}/generer-elimination`, {
      method: 'POST'
    });
  },

  // Récupérer les compétitions de l'utilisateur connecté
  getMyCompetitions: async (token) => {
    return apiCall('/competitions/mes-competitions', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Marquer une équipe comme prête pour un match
  marquerPret: async (competitionId, matchId, token) => {
    return apiCall(`/competitions/${competitionId}/matchs/${matchId}/pret`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Uploader une photo de preuve pour un litige
  uploadPhotoLitige: async (competitionId, matchId, file, token, onProgress) => {
    const API_BASE = process.env.NODE_ENV === 'production'
      ? 'https://club-pro-commu.onrender.com/api'
      : 'http://localhost:3001/api';
    
    const url = `${API_BASE}/competitions/${competitionId}/matchs/${matchId}/upload-photo`;
    const formData = new FormData();
    formData.append('photo', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        });
      }
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(new Error('Réponse invalide du serveur')); }
        } else {
          reject(new Error(`Erreur upload photo: ${xhr.status}`));
        }
      });
      xhr.addEventListener('error', () => reject(new Error('Erreur réseau')));
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  // Déclarer un forfait manuellement (admin)
  declarerForfait: async (competitionId, matchId, equipeEnForfait, token) => {
    return apiCall(`/competitions/${competitionId}/matchs/${matchId}/forfait`, {
      method: 'POST',
      body: { equipeEnForfait },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Récupérer le chat du match
  getMatchChat: async (competitionId, matchId, token) => {
    return apiCall(`/competitions/${competitionId}/matchs/${matchId}/chat`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Envoyer un message dans le chat du match
  sendMatchChatMessage: async (competitionId, matchId, texte, token) => {
    return apiCall(`/competitions/${competitionId}/matchs/${matchId}/chat`, {
      method: 'POST',
      body: { texte },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
};

// Export de la fonction utilitaire apiCall pour tests et usage direct
export { apiCall }; 