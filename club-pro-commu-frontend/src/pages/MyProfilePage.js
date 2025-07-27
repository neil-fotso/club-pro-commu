import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playerAPI } from '../services/api';

export default function MyProfilePage() {
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      loadMyProfile();
    }
  }, [user]);

  const loadMyProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await playerAPI.getMyProfile(token);
      setPlayer(data);
      setFormData({
        postePrincipal: data.postePrincipal,
        age: data.age,
        pays: data.pays,
        description: data.description || '',
        niveau: data.niveau,
        rechercheClub: data.rechercheClub
      });
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error('Erreur chargement profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const updatedPlayer = await playerAPI.updatePlayer(player._id, formData, token);
      setPlayer(updatedPlayer);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Connexion requise</h4>
          <p>Vous devez être connecté pour voir votre profil.</p>
        </div>
      </div>
    );
  }

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
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="mb-0">Mon profil joueur</h2>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Annuler' : 'Modifier'}
              </button>
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Poste principal *</label>
                      <select
                        className="form-select"
                        name="postePrincipal"
                        value={formData.postePrincipal}
                        onChange={handleChange}
                        required
                      >
                        <option value="Attaquant">Attaquant</option>
                        <option value="Milieu">Milieu</option>
                        <option value="Défenseur">Défenseur</option>
                        <option value="Gardien">Gardien</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Âge *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="16"
                        max="100"
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Pays *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="pays"
                        value={formData.pays}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Niveau</label>
                      <select
                        className="form-select"
                        name="niveau"
                        value={formData.niveau}
                        onChange={handleChange}
                      >
                        <option value="Débutant">Débutant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Avancé">Avancé</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      maxLength="500"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="rechercheClub"
                        checked={formData.rechercheClub}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">
                        Je recherche un club
                      </label>
                    </div>
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </form>
              ) : (
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
                  
                  {player.description && (
                    <div className="col-12 mt-3">
                      <h5>Description</h5>
                      <p>{player.description}</p>
                    </div>
                  )}
                  
                  {player.langues && player.langues.length > 0 && (
                    <div className="col-12 mt-3">
                      <h5>Langues parlées</h5>
                      <p>{player.langues.join(', ')}</p>
                    </div>
                  )}
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
              <p className="text-muted">
                Votre profil joueur a été créé automatiquement lors de votre inscription.
                Vous pouvez le personnaliser en cliquant sur "Modifier".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 