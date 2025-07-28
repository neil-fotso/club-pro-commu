// Configuration de l'API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Fonction utilitaire pour les appels API
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Configuration par défaut
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
};

// API utilisateur
export const userAPI = {
  // Récupérer le profil utilisateur
  getProfile: async (token) => {
    return apiCall('/user/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// API joueurs
export const playerAPI = {
  // Récupérer tous les joueurs avec filtres
  getPlayers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/players?${params}`);
  },

  // Récupérer un joueur par ID
  getPlayer: async (id) => {
    return apiCall(`/players/${id}`);
  },

  // Récupérer le profil joueur de l'utilisateur connecté
  getMyProfile: async (token) => {
    return apiCall('/players/me/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Créer un profil joueur
  createPlayer: async (playerData, token) => {
    return apiCall('/players', {
      method: 'POST',
      body: playerData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Mettre à jour un profil joueur
  updatePlayer: async (id, playerData, token) => {
    return apiCall(`/players/${id}`, {
      method: 'PUT',
      body: playerData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
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