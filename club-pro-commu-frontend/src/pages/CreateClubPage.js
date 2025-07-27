import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clubAPI } from '../services/api';

export default function CreateClubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    plateforme: 'PS5',
    pays: 'France',
    statut: 'Actif',
    description: '',
    effectifMax: 11,
    langues: ['Français'],
    recrute: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{
             background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
           }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white'
                   }}>
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-lock text-white" style={{fontSize: '2.5rem'}}></i>
                    </div>
                    <h2 className="card-title mb-3">Connexion requise</h2>
                    <p className="text-white-90">Vous devez être connecté pour créer un club.</p>
                  </div>
                  <a href="/login" className="btn btn-light btn-lg">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Se connecter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const clubData = {
        nom: form.nom,
        plateforme: form.plateforme,
        pays: form.pays,
        statut: form.statut,
        description: form.description,
        effectifMax: parseInt(form.effectifMax),
        langues: Array.isArray(form.langues) ? form.langues : [form.langues],
        recrute: form.recrute
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      await clubAPI.createClub(clubData, token);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/clubs');
      }, 2000);
    } catch (err) {
      console.error('Erreur création club:', err);
      setError(err.message || 'Erreur lors de la création du club');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'PS5': return '🎮';
      case 'Xbox': return '🎮';
      case 'PC': return '💻';
      default: return '🎮';
    }
  };

  return (
    <div className="min-vh-100" 
         style={{
           background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
         }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {success ? (
              <div className="card border-0 shadow-lg" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white'
                   }}>
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-check text-white" style={{fontSize: '2.5rem'}}></i>
                    </div>
                    <h2 className="card-title mb-3">🎉 Club créé avec succès !</h2>
                    <p className="text-white-90">Votre club a été créé et est maintenant visible par tous les joueurs.</p>
                  </div>
                  <div className="alert alert-light bg-white bg-opacity-20 border-0">
                    <h5 className="mb-2">🏆 {form.nom}</h5>
                    <p className="mb-0 text-white-90">
                      {getPlatformIcon(form.plateforme)} {form.plateforme} • {form.pays} • {form.effectifMax} joueurs max
                    </p>
                  </div>
                  <p className="text-white-75 mt-3">Redirection vers la liste des clubs...</p>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  {/* Header */}
                  <div className="text-center mb-5">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-shield-alt text-primary" style={{fontSize: '2.5rem'}}></i>
                    </div>
                    <h2 className="card-title mb-2">🏆 Créer un Club</h2>
                    <p className="text-muted">Fondez votre équipe et commencez votre aventure FIFA Pro Clubs</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger border-0 bg-danger bg-opacity-10 mb-4">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="nom" className="form-label">
                        <i className="fas fa-trophy me-2"></i>
                        Nom du club *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="nom"
                        name="nom"
                        value={form.nom}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="plateforme" className="form-label">
                          <i className="fas fa-gamepad me-2"></i>
                          Plateforme *
                        </label>
                        <select
                          className="form-control form-control-lg"
                          id="plateforme"
                          name="plateforme"
                          value={form.plateforme}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choisir une plateforme</option>
                          <option value="PS5">🎮 PS5</option>
                          <option value="Xbox">🎮 Xbox</option>
                          <option value="PC">💻 PC</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="pays" className="form-label">
                          <i className="fas fa-flag me-2"></i>
                          Pays *
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="pays"
                          name="pays"
                          value={form.pays}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        <i className="fas fa-align-left me-2"></i>
                        Description *
                      </label>
                      <textarea
                        className="form-control form-control-lg"
                        id="description"
                        name="description"
                        rows="3"
                        value={form.description}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="effectifMax" className="form-label">
                          <i className="fas fa-users me-2"></i>
                          Effectif maximum *
                        </label>
                        <select
                          className="form-control form-control-lg"
                          id="effectifMax"
                          name="effectifMax"
                          value={form.effectifMax}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choisir l'effectif</option>
                          <option value="11">11 joueurs</option>
                          <option value="22">22 joueurs</option>
                          <option value="33">33 joueurs</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="langues" className="form-label">
                          <i className="fas fa-language me-2"></i>
                          Langues *
                        </label>
                        <select
                          className="form-control form-control-lg"
                          id="langues"
                          name="langues"
                          value={form.langues}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choisir les langues</option>
                          <option value="Français">🇫🇷 Français</option>
                          <option value="Anglais">🇬🇧 Anglais</option>
                          <option value="Espagnol">🇪🇸 Espagnol</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="recrute"
                          id="recrute"
                          checked={form.recrute}
                          onChange={handleChange}
                        />
                        <label className="form-check-label fw-bold" htmlFor="recrute">
                          <i className="fas fa-user-plus me-2 text-success"></i>
                          Recruter des joueurs dès la création
                        </label>
                      </div>
                    </div>

                    <div className="d-flex gap-3">
                      <button 
                        type="submit" 
                        className="btn btn-light btn-lg w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Création en cours...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus me-2"></i>
                            Créer le club
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Les champs marqués d'un * sont obligatoires
                        </small>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-lg"
                        onClick={() => navigate('/clubs')}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 