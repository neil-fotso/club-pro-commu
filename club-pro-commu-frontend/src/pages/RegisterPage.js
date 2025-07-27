import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pseudo: '',
    email: '',
    password: '',
    confirmPassword: '',
    plateforme: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    if (!formData.plateforme) {
      setError('Veuillez sélectionner une plateforme');
      setLoading(false);
      return;
    }

    const result = await register({
      pseudo: formData.pseudo,
      email: formData.email,
      password: formData.password,
      plateforme: formData.plateforme
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
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
                    <div className="col-md-6 mb-3">
                      <label htmlFor="pseudo" className="form-label">
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
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
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
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="plateforme" className="form-label">
                      <i className="fas fa-gamepad me-2"></i>
                      Plateforme *
                    </label>
                    <select
                      className="form-control form-control-lg"
                      id="plateforme"
                      name="plateforme"
                      value={formData.plateforme}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choisir une plateforme</option>
                      <option value="PS5">🎮 PS5</option>
                      <option value="Xbox">🎮 Xbox</option>
                      <option value="PC">💻 PC</option>
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
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
                      />
                    </div>
                    <div className="col-md-6 mb-4">
                      <label htmlFor="confirmPassword" className="form-label">
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
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-light btn-lg w-100 mb-3"
                    disabled={loading}
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

                  <div className="text-center">
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