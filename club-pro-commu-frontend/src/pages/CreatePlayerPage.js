import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playerAPI } from '../services/api';

export default function CreatePlayerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    postePrincipal: '',
    postesSecondaires: [],
    age: '',
    pays: '',
    description: '',

    langues: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Connexion requise</h4>
          <p>Vous devez être connecté pour créer un profil joueur.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await playerAPI.createPlayer(formData, token);
      setSuccess('Profil joueur créé avec succès !');
      setTimeout(() => {
        navigate('/joueurs');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">Créer mon profil joueur</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}
              {success && (
                <div className="alert alert-success">{success}</div>
              )}

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
                      <option value="">Sélectionner un poste</option>
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
                    placeholder="Décrivez votre style de jeu, vos forces..."
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Création...' : 'Créer mon profil joueur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 