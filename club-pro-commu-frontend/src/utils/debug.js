// Utilitaires de debug pour identifier les erreurs

export const debugAPI = {
  // Tester la connexion API
  testConnection: async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      return {
        success: response.ok,
        status: response.status,
        data: await response.json()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Tester l'authentification
  testAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Aucun token trouvé' };
      }

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.ok,
        status: response.status,
        data: await response.json()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Tester la recherche de joueurs
  testPlayerSearch: async () => {
    try {
      const response = await fetch('http://localhost:3001/api/players');
      return {
        success: response.ok,
        status: response.status,
        data: await response.json()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Fonction pour afficher les erreurs dans la console
export const logError = (context, error) => {
  console.group(`🚨 Erreur dans ${context}`);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.error('Contexte:', context);
  console.groupEnd();
};

// Fonction pour vérifier les variables d'environnement
export const checkEnvironment = () => {
  const env = {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
  };

  console.log('🔧 Variables d\'environnement:', env);
  return env;
}; 