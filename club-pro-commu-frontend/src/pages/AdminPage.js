import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { playerAPI, clubAPI } from '../services/api';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playersData, clubsData] = await Promise.all([
        playerAPI.getAllPlayers(),
        clubAPI.getAllClubs()
      ]);
      setPlayers(playersData.players || []);
      setClubs(clubsData || []);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      return;
    }

    try {
      await playerAPI.deletePlayer(playerId);
      setPlayers(players.filter(p => p._id !== playerId));
    } catch (err) {
      setError('Erreur lors de la suppression du joueur');
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce club ?')) {
      return;
    }

    try {
      await clubAPI.deleteClub(clubId);
      setClubs(clubs.filter(c => c._id !== clubId));
    } catch (err) {
      setError('Erreur lors de la suppression du club');
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Accès refusé</h4>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">
                <i className="fas fa-cog me-2"></i>
                Administration
              </h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {/* Onglets */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'players' ? 'active' : ''}`}
                    onClick={() => setActiveTab('players')}
                  >
                    <i className="fas fa-users me-2"></i>
                    Joueurs ({players.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'clubs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('clubs')}
                  >
                    <i className="fas fa-shield-alt me-2"></i>
                    Clubs ({clubs.length})
                  </button>
                </li>
              </ul>

              {/* Contenu des onglets */}
              {activeTab === 'players' && (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Pseudo</th>
                        <th>Plateforme</th>
                        <th>Position</th>

                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map(player => (
                        <tr key={player._id}>
                          <td>{player.pseudo}</td>
                          <td>{player.plateforme}</td>
                          <td>{player.position}</td>

                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeletePlayer(player._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'clubs' && (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Pays</th>
                        <th>Membres</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubs.map(club => (
                        <tr key={club._id}>
                          <td>{club.nom}</td>
                          <td>{club.pays}</td>
                          <td>{club.membres?.length || 0}/{club.effectifMax}</td>
                          <td>
                            <span className={`badge bg-${club.statut === 'Actif' ? 'success' : 'secondary'}`}>
                              {club.statut}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteClub(club._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 