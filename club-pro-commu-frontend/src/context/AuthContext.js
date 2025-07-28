import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si un token existe au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Vérifier si le token est valide
      authAPI.getMe()
        .then(userData => {
          setUser({ ...userData, token });
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Connexion réelle
  const login = async (emailOrPseudo, password) => {
    try {
      const response = await authAPI.login({ emailOrPseudo, password });
      console.log('🔐 Réponse login:', response);
      
      // Le backend retourne { user: { token, ... }, player: {...} }
      const { user: userData, player } = response;
      const token = userData.token;
      
      if (!token) {
        throw new Error('Token non reçu du serveur');
      }
      
      localStorage.setItem('token', token);
      setUser({ ...userData, token });
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur login:', error);
      return { success: false, error: error.message };
    }
  };

  // Inscription réelle
  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      // Si l'erreur vient de l'API avec des détails
      if (error.response && error.response.data) {
        return { 
          success: false, 
          error: error.response.data.message,
          field: error.response.data.field,
          type: error.response.data.type
        };
      }
      return { success: false, error: error.message };
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Mode test (pour le développement)
  const loginTest = () => {
    const fakeUser = {
      id: '1',
      pseudo: 'TestUser',
      email: 'test@clubpro.com',
    };
    setUser(fakeUser);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginTest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 