import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clubAPI } from '../services/api';

const createClubStyles = `
  .create-club-container {
    min-height: 100vh;
    padding: 2rem 0;
  }
  
  .create-club-content {
    background: rgba(13, 19, 32, 0.75) !important;
    border: 1px solid var(--border-glass) !important;
    backdrop-filter: blur(16px);
    border-radius: 16px !important;
    padding: 2.5rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
    animation: fadeInUp 0.6s ease-out;
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .create-club-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }
  
  .create-club-header h2 {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
  }
  
  .header-icon {
    width: 72px;
    height: 72px;
    background: var(--gradient-esports);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
    box-shadow: 0 5px 20px var(--neon-purple-glow);
    animation: pulse 2.5s infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 5px 25px rgba(0, 240, 255, 0.4);
    }
  }
  
  .header-icon i {
    font-size: 1.8rem;
    color: white;
  }
  
  .form-control, .form-select {
    border: 1px solid var(--border-glass) !important;
    border-radius: 10px !important;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    transition: all 0.25s ease;
    background-color: rgba(255, 255, 255, 0.04) !important;
    color: var(--text-white) !important;
  }
  
  .form-control:focus, .form-select:focus {
    border-color: var(--neon-purple) !important;
    box-shadow: 0 0 15px var(--neon-purple-glow) !important;
    transform: translateY(-1px);
    background-color: rgba(255, 255, 255, 0.06) !important;
  }
  
  .form-control::placeholder {
    color: rgba(255, 255, 255, 0.3) !important;
  }
  
  .form-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    color: var(--text-silver);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .form-label i {
    margin-right: 0.5rem;
    color: var(--neon-cyan);
  }
  
  .submit-btn {
    background: var(--gradient-esports) !important;
    border: none !important;
    color: white !important;
    border-radius: 10px !important;
    padding: 0.85rem 2rem !important;
    font-weight: 700;
    font-family: 'Rajdhani', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px var(--neon-purple-glow) !important;
  }
  
  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 240, 255, 0.35) !important;
  }
  
  .submit-btn:disabled {
    opacity: 0.6;
    transform: none;
  }
  
  .cancel-btn {
    background: transparent !important;
    border: 1px solid var(--border-glass) !important;
    color: var(--text-silver) !important;
    border-radius: 10px !important;
    padding: 0.85rem 2rem !important;
    font-weight: 700;
    font-family: 'Rajdhani', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
  }
  
  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    color: white !important;
    border-color: var(--text-silver) !important;
    transform: translateY(-1px);
  }
  
  .success-card {
    background: rgba(13, 19, 32, 0.75) !important;
    border: 1px solid var(--border-glass) !important;
    color: white;
    border-radius: 16px;
    padding: 3rem 2.5rem;
    text-align: center;
  }
  
  .success-icon {
    width: 72px;
    height: 72px;
    background: rgba(40, 167, 69, 0.15);
    border: 1px solid #28a745;
    color: #28a745;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 0 15px rgba(40, 167, 69, 0.3);
  }
  
  .club-preview {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
  }
  
  .platform-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-glass);
    padding: 0.4rem 0.85rem;
    border-radius: 6px;
    margin: 0.25rem;
    font-size: 0.85rem;
    color: var(--text-white);
  }
  
  .alert {
    border-radius: 10px;
    border: 1px solid rgba(220, 53, 69, 0.2);
    padding: 1rem 1.25rem;
  }
  
  .alert-danger {
    background: rgba(220, 53, 69, 0.1) !important;
    color: #ff6b6b !important;
  }
  
  .form-check-input {
    background-color: rgba(255, 255, 255, 0.04) !important;
    border-color: var(--border-glass) !important;
  }
  
  .form-check-input:checked {
    background-color: var(--neon-purple) !important;
    border-color: var(--neon-purple) !important;
  }
  
  .form-check-input:focus {
    box-shadow: 0 0 10px var(--neon-purple-glow) !important;
  }
  
  @media (max-width: 768px) {
    .create-club-content {
      padding: 1.5rem;
      margin: 1rem 0;
    }
  }
`;

export default function CreateClubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    plateformes: ['PS5'],
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
  const [userClub, setUserClub] = useState(null);

  useEffect(() => {
    async function fetchUserClub() {
      if (user && user.token) {
        try {
          const clubs = await clubAPI.getMyClubs(user.token);
          if (clubs && clubs.length > 0) {
            setUserClub(clubs[0]);
          }
        } catch (e) {
          // rien
        }
      }
    }
    fetchUserClub();
  }, [user]);

  if (!user) {
    return (
      <div className="create-club-container">
        <style>{createClubStyles}</style>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="create-club-content">
                <div className="text-center">
                  <div className="header-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                  <h2>Connexion requise</h2>
                  <p className="text-muted mb-4">Vous devez être connecté pour créer un club.</p>
                  <a href="/login" className="btn submit-btn">
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

  if (userClub) {
    return (
      <div className="create-club-container">
        <style>{createClubStyles}</style>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="create-club-content text-center">
                <div className="header-icon">
                  <i className="fas fa-info-circle"></i>
                </div>
                <h2>Vous appartenez déjà à un club</h2>
                <p className="text-muted mb-4">
                  Vous ne pouvez pas créer un nouveau club tant que vous êtes membre d'un club.<br/>
                  <b>Club actuel :</b> {userClub.nom}
                </p>
                <button className="btn submit-btn" onClick={() => navigate(`/club/${userClub._id}`)}>
                  <i className="fas fa-shield-alt me-2"></i>
                  Voir mon club
                </button>
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
        plateformes: form.plateformes,
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
        navigate('/mes-clubs');
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
    <div className="create-club-container py-4 px-4 px-md-5 animate-fade-in">
      <style>{createClubStyles}</style>
      <div className="container-fluid px-0">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {success ? (
              <div className="create-club-content success-card">
                <div className="success-icon">
                  <i className="fas fa-check" style={{fontSize: '2rem'}}></i>
                </div>
                <h2 className="mb-3">🎉 Club créé avec succès !</h2>
                <p className="mb-4">Votre club a été créé et est maintenant visible par tous les joueurs.</p>
                
                <div className="club-preview">
                  <h5 className="mb-2">🏆 {form.nom}</h5>
                  <div className="d-flex flex-wrap justify-content-center">
                    {form.plateformes.map(platform => (
                      <span key={platform} className="platform-badge">
                        {getPlatformIcon(platform)} {platform}
                      </span>
                    ))}
                    <span className="platform-badge">
                      🇫🇷 {form.pays}
                    </span>
                    <span className="platform-badge">
                      👥 {form.effectifMax} joueurs max
                    </span>
                  </div>
                </div>
                
                <p className="text-white-75 mt-3">Redirection vers la liste des clubs...</p>
              </div>
            ) : (
              <div className="create-club-content">
                {/* Header */}
                <div className="create-club-header">
                  <div className="header-icon">
                    <i className="fas fa-shield-alt text-gradient"></i>
                  </div>
                  <h2 className="text-gradient">Créer un Club</h2>
                  <p className="text-muted">Fondez votre équipe et commencez votre aventure EA Sports FC Pro Clubs</p>
                </div>

                {error && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="nom" className="form-label">
                      <i className="fas fa-trophy"></i>
                      Nom du club *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nom"
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="Ex: Les Champions"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label htmlFor="plateformes" className="form-label">
                        <i className="fas fa-gamepad"></i>
                        Plateformes *
                      </label>
                      <div className="d-flex flex-wrap gap-2">
                        {['PS5', 'Xbox', 'PC'].map(platform => (
                          <div key={platform} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`platform-${platform}`}
                              value={platform}
                              checked={form.plateformes.includes(platform)}
                              onChange={(e) => {
                                const newPlateformes = e.target.checked
                                  ? [...form.plateformes, platform]
                                  : form.plateformes.filter(p => p !== platform);
                                setForm(prev => ({ ...prev, plateformes: newPlateformes }));
                              }}
                            />
                            <label className="form-check-label" htmlFor={`platform-${platform}`}>
                              {platform === 'PS5' ? '🎮 PS5' : platform === 'Xbox' ? '🎮 Xbox' : '💻 PC'}
                            </label>
                          </div>
                        ))}
                      </div>
                      {form.plateformes.length === 0 && (
                        <small className="text-danger">Sélectionnez au moins une plateforme</small>
                      )}
                    </div>
                    <div className="col-md-6 mb-4">
                      <label htmlFor="pays" className="form-label">
                        <i className="fas fa-flag"></i>
                        Pays *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="pays"
                        name="pays"
                        value={form.pays}
                        onChange={handleChange}
                        placeholder="France"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="form-label">
                      <i className="fas fa-align-left"></i>
                      Description *
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="4"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Décrivez votre club, son style de jeu, ses objectifs..."
                      required
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label htmlFor="effectifMax" className="form-label">
                        <i className="fas fa-users"></i>
                        Effectif maximum *
                      </label>
                      <select
                        className="form-select"
                        id="effectifMax"
                        name="effectifMax"
                        value={form.effectifMax}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Choisir l'effectif</option>
                        {Array.from({ length: 20 }, (_, i) => i + 11).map(num => (
                          <option key={num} value={num}>{num} joueurs</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-4">
                      <label htmlFor="langues" className="form-label">
                        <i className="fas fa-language"></i>
                        Langues *
                      </label>
                      <select
                        className="form-select"
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
                      className="btn submit-btn"
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
                    <button 
                      type="button" 
                      className="btn cancel-btn"
                      onClick={() => navigate('/clubs')}
                    >
                      <i className="fas fa-times me-2"></i>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 