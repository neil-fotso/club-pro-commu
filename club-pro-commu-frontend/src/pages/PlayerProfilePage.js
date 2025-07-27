import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playerAPI } from '../services/api';

export default function PlayerProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPlayer = useCallback(async () => {
    try {
      setLoading(true);
      const data = await playerAPI.getPlayer(id);
      setPlayer(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du joueur');
      console.error('Erreur chargement joueur:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlayer();
  }, [loadPlayer]);

  const handleInvite = async () => {
    if (!user) {
      alert('Vous devez être connecté pour inviter un joueur');
      return;
    }
    
    // Simulation d'invitation (à implémenter plus tard)
    alert('Invitation envoyée au joueur !');
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Erreur</h4>
          <p>{error}</p>
          <Link to="/joueurs" className="btn btn-primary">Retour à la recherche</Link>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Joueur non trouvé</h4>
          <p>Le profil demandé n'existe pas.</p>
          <Link to="/joueurs" className="btn btn-primary">Retour à la recherche</Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Connexion requise</h4>
          <p>Vous devez être connecté pour voir les profils des joueurs.</p>
          <Link to="/login" className="btn btn-primary">Se connecter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">Profil de {player.pseudo}</h2>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5>Informations générales</h5>
                  <ul className="list-unstyled">
                    <li><strong>Pseudo:</strong> {player.pseudo}</li>
                    <li><strong>Âge:</strong> {player.age} ans</li>
                    <li><strong>Pays:</strong> {player.pays}</li>
                    <li><strong>Plateforme:</strong> {player.plateforme}</li>
                    <li><strong>Niveau:</strong> {player.niveau}</li>
                    <li><strong>Expérience:</strong> {player.experience} matchs</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5>Postes</h5>
                  <ul className="list-unstyled">
                    <li><strong>Poste principal:</strong> {player.postePrincipal}</li>
                    {player.postesSecondaires && player.postesSecondaires.length > 0 && (
                      <li><strong>Postes secondaires:</strong> {player.postesSecondaires.join(', ')}</li>
                    )}
                  </ul>
                  
                  <h5>Disponibilité</h5>
                  <ul className="list-unstyled">
                    <li><strong>Statut:</strong> {player.disponibilite}</li>
                    <li>
                      <strong>Recherche un club:</strong> 
                      {player.rechercheClub ? (
                        <span className="badge bg-success ms-2">Oui</span>
                      ) : (
                        <span className="badge bg-secondary ms-2">Non</span>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
              
              {player.description && (
                <div className="mt-3">
                  <h5>Description</h5>
                  <p>{player.description}</p>
                </div>
              )}
              
              {player.langues && player.langues.length > 0 && (
                <div className="mt-3">
                  <h5>Langues parlées</h5>
                  <p>{player.langues.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Actions</h5>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-primary w-100 mb-2"
                onClick={handleInvite}
              >
                Inviter ce joueur dans mon club
              </button>
              
              <Link to="/joueurs" className="btn btn-outline-secondary w-100">
                Retour à la recherche
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 