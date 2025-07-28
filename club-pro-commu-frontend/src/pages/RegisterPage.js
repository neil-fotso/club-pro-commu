import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCountries, getCountryFlag } from '../utils/countryUtils';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const allCountries = getAllCountries();

  const [formData, setFormData] = useState({
    pseudo: '',
    pseudoPlateforme: '',
    email: '',
    password: '',
    confirmPassword: '',
    plateforme: '',
    postePrincipal: '',
    age: '',
    pays: ''
  });

  const [useSamePseudo, setUseSamePseudo] = useState(false);

  if (user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             minHeight: '100vh'
           }}>
        <div className="card border-0 shadow-lg" style={{maxWidth: 500, width: '100%'}}>
          <div className="card-body text-center p-5">
            <div className="mb-4">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <i className="fas fa-check-circle text-success" style={{fontSize: '2.5rem'}}></i>
              </div>
              <h2 className="card-title mb-3">Déjà connecté</h2>
              <div className="alert alert-success border-0 bg-success bg-opacity-10">
                Vous êtes déjà connecté en tant que <b>{user.pseudo}</b>.
              </div>
            </div>
            <Link to="/" className="btn btn-primary">
              <i className="fas fa-home me-2"></i>
              Retour à l'accueil
            </Link>
          </div>
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

    // Si la case "même pseudo" est cochée, mettre à jour automatiquement le pseudoPlateforme
    if (useSamePseudo && name === 'pseudo') {
      setFormData(prev => ({
        ...prev,
        pseudoPlateforme: value
      }));
    }
  };

  const handleUseSamePseudo = (e) => {
    const checked = e.target.checked;
    setUseSamePseudo(checked);
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        pseudoPlateforme: prev.pseudo
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.pseudo) {
      setError('Veuillez indiquer votre pseudo');
      setLoading(false);
      return;
    }

    if (!formData.pseudoPlateforme) {
      setError('Veuillez indiquer votre pseudo sur la plateforme');
      setLoading(false);
      return;
    }

    if (!formData.email) {
      setError('Veuillez indiquer votre email');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Veuillez indiquer votre mot de passe');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (!formData.plateforme) {
      setError('Veuillez sélectionner votre plateforme');
      setLoading(false);
      return;
    }

    if (!formData.postePrincipal) {
      setError('Veuillez sélectionner un poste principal');
      setLoading(false);
      return;
    }

    const result = await register({
      pseudo: formData.pseudo,
      pseudoPlateforme: formData.pseudoPlateforme,
      email: formData.email,
      password: formData.password,
      plateforme: formData.plateforme,
      postePrincipal: formData.postePrincipal,
      age: formData.age ? parseInt(formData.age) : undefined,
      pays: formData.pays || undefined
    });
    
    if (result.success) {
      setSuccess('Inscription réussie ! Vous allez être redirigé vers la page de connexion...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };



  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" 
         style={{
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           minHeight: '100vh'
         }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-user-plus text-primary" style={{fontSize: '2.5rem'}}></i>
                  </div>
                  <h2 className="card-title mb-2">Créer un compte</h2>
                  <p className="text-muted">Rejoignez la communauté FIFA Pro Clubs</p>
                </div>

                {/* Messages */}
                {error && (
                  <div className="alert alert-danger border-0 bg-danger bg-opacity-10 mb-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success border-0 bg-success bg-opacity-10 mb-4">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                  </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label htmlFor="pseudo" className="form-label fw-bold">
                        <i className="fas fa-user me-2"></i>
                        Pseudo *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="pseudo"
                        name="pseudo"
                        value={formData.pseudo}
                        onChange={handleChange}
                        placeholder="Votre pseudo"
                        required
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>

                    <div className="col-md-6 mb-4">
                      <label htmlFor="pseudoPlateforme" className="form-label fw-bold">
                        <i className="fas fa-gamepad me-2"></i>
                        Pseudo sur la plateforme *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="pseudoPlateforme"
                        name="pseudoPlateforme"
                        value={formData.pseudoPlateforme}
                        onChange={handleChange}
                        placeholder="Votre pseudo sur la plateforme"
                        required
                        disabled={useSamePseudo}
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <div className="form-check mt-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="useSamePseudo"
                          checked={useSamePseudo}
                          onChange={handleUseSamePseudo}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <label className="form-check-label ms-2" htmlFor="useSamePseudo">
                          Utiliser le même pseudo
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label htmlFor="email" className="form-label fw-bold">
                      <i className="fas fa-envelope me-2"></i>
                      Email *
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Votre email"
                      required
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label htmlFor="plateforme" className="form-label fw-bold">
                        <i className="fas fa-tv me-2"></i>
                        Plateforme *
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="plateforme"
                        name="plateforme"
                        value={formData.plateforme}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <option value="">Choisir votre plateforme</option>
                        <option value="PS5">PlayStation 5</option>
                        <option value="PS4">PlayStation 4</option>
                        <option value="Xbox Series X/S">Xbox Series X/S</option>
                        <option value="Xbox One">Xbox One</option>
                        <option value="PC">PC</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-4">
                      <label htmlFor="postePrincipal" className="form-label fw-bold">
                        <i className="fas fa-futbol me-2"></i>
                        Poste principal *
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="postePrincipal"
                        name="postePrincipal"
                        value={formData.postePrincipal}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <option value="">Choisir votre poste</option>
                        <optgroup label="Attaquants">
                          <option value="BU">⚽ Buteur</option>
                          <option value="AG">⚽ Ailier Gauche</option>
                          <option value="AD">⚽ Ailier Droit</option>
                        </optgroup>
                        <optgroup label="Milieux">
                          <option value="MOC">🎯 Milieu Offensif Central</option>
                          <option value="MG">🎯 Milieu Gauche</option>
                          <option value="MD">🎯 Milieu Droit</option>
                          <option value="MC">🎯 Milieu Central</option>
                          <option value="MDC">🛡️ Milieu Défensif Central</option>
                        </optgroup>
                        <optgroup label="Défenseurs">
                          <option value="DD">🛡️ Défenseur Droit</option>
                          <option value="DG">🛡️ Défenseur Gauche</option>
                          <option value="DC">🛡️ Défenseur Central</option>
                          <option value="DLD">🛡️ Défenseur Latéral Droit</option>
                          <option value="DLG">🛡️ Défenseur Latéral Gauche</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="age" className="form-label">
                        <i className="fas fa-birthday-cake me-2"></i>
                        Âge (facultatif)
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="16"
                        max="100"
                        placeholder="Votre âge (optionnel)"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="pays" className="form-label">
                        <i className="fas fa-flag me-2"></i>
                        Nationalité (facultatif)
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="pays"
                        name="pays"
                        value={formData.pays}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionnez votre pays</option>
                        {allCountries.map(country => (
                          <option key={country.code} value={country.code}>
                            {getCountryFlag(country.code)} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label htmlFor="password" className="form-label fw-bold">
                        <i className="fas fa-lock me-2"></i>
                        Mot de passe *
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Votre mot de passe"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-4">
                      <label htmlFor="confirmPassword" className="form-label fw-bold">
                        <i className="fas fa-lock me-2"></i>
                        Confirmer le mot de passe *
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirmez votre mot de passe"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 mb-4"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '12px',
                      minHeight: '56px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Inscription en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        S'inscrire
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Les champs marqués d'un * sont obligatoires
                    </small>
                  </div>

                  <div className="text-center mt-3">
                    <p className="text-muted mb-0">
                      Déjà un compte ? 
                      <Link to="/login" className="text-decoration-none fw-bold ms-1">
                        Se connecter
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 