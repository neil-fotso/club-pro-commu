// Configuration de l'API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
    ...getAuthHeaders(),
  };
  
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
      throw new Error(data.message || 'Erreur API');
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
    return apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
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
    return apiCall(`/players/${id}`);
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
};

// API clubs
export const clubAPI = {
  // Récupérer tous les clubs avec filtres
  getClubs: async (filters = {}) => {
    const params = new URLSearchParams(filters);
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

  // Rejoindre un club
  joinClub: async (clubId, token) => {
    return apiCall(`/clubs/${clubId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Quitter un club
  leaveClub: async (clubId, token) => {
    return apiCall(`/clubs/${clubId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Récupérer les clubs de l'utilisateur connecté
  getMyClubs: async (token) => {
    return apiCall('/clubs/user/my-clubs', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Promouvoir un membre en admin
  promoteMember: async (clubId, userId, token) => {
    return apiCall(`/clubs/${clubId}/promouvoir/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Exclure un membre du club
  excludeMember: async (clubId, userId, token) => {
    return apiCall(`/clubs/${clubId}/exclure/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
  // Récupérer toutes les compétitions avec filtres
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

  // Inscrire un club à une compétition
  registerClub: async (competitionId, clubId, token) => {
    return apiCall(`/competitions/${competitionId}/inscrire`, {
      method: 'POST',
      body: { clubId },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Désinscrire un club d'une compétition
  unregisterClub: async (competitionId, clubId, token) => {
    return apiCall(`/competitions/${competitionId}/desinscrire`, {
      method: 'POST',
      body: { clubId },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
}; 