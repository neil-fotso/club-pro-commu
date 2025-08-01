import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clubAPI } from '../services/api';

// Styles améliorés pour la page de création de club
const createClubStyles = `
  .create-club-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }
  
  .create-club-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    animation: fadeInUp 0.8s ease-out;
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .create-club-header {
    text-align: center;
    margin-bottom: 3rem;
    animation: slideInDown 0.8s ease-out;
  }
  
  @keyframes slideInDown {
    0% {
      opacity: 0;
      transform: translateY(-30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .create-club-header h2 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .header-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  .header-icon i {
    font-size: 2rem;
    color: white;
  }
  
  .form-control, .form-select {
    border: 2px solid transparent;
    border-radius: 15px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .form-control:focus, .form-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    transform: translateY(-2px);
    background: white;
  }
  
  .form-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
  }
  
  .form-label i {
    margin-right: 0.5rem;
    color: #667eea;
  }
  
  .submit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    border-radius: 25px;
    padding: 1rem 2rem;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    width: 100%;
  }
  
  .submit-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }
  
  .submit-btn:disabled {
    opacity: 0.7;
    transform: none;
  }
  
  .cancel-btn {
    background: transparent;
    border: 2px solid #6c757d;
    color: #6c757d;
    border-radius: 25px;
    padding: 1rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .cancel-btn:hover {
    background: #6c757d;
    color: white;
    transform: translateY(-2px);
  }
  
  .success-card {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    animation: fadeInUp 0.8s ease-out;
  }
  
  .success-icon {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    animation: bounce 1s infinite;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  .club-preview {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    backdrop-filter: blur(10px);
  }
  
  .platform-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    margin: 0.25rem;
    font-size: 0.9rem;
  }
  
  .alert {
    border-radius: 15px;
    border: none;
    padding: 1rem 1.5rem;
  }
  
  .alert-danger {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
  }
  
  .form-check-input:checked {
    background-color: #667eea;
    border-color: #667eea;
  }
  
  .form-check-input:focus {
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }
  
  @media (max-width: 768px) {
    .create-club-content {
      padding: 1rem;
      margin: 1rem;
    }
    
    .create-club-header h2 {
      font-size: 2rem;
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
    <div className="create-club-container">
      <style>{createClubStyles}</style>
      <div className="container">
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
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h2>🏆 Créer un Club</h2>
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