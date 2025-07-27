import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrPseudo: '',
    password: ''
  });
  const [error, setError] = useState('');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.emailOrPseudo, formData.password);
    
    if (result.success) {
      navigate('/');
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
          <div className="col-lg-5 col-md-7">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-sign-in-alt text-primary" style={{fontSize: '2.5rem'}}></i>
                  </div>
                  <h2 className="card-title mb-2">Connexion</h2>
                  <p className="text-muted">Accédez à votre compte</p>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="alert alert-danger border-0 bg-danger bg-opacity-10 mb-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="emailOrPseudo" className="form-label">
                      <i className="fas fa-envelope me-2"></i>
                      Email ou Pseudo *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="emailOrPseudo"
                      name="emailOrPseudo"
                      value={formData.emailOrPseudo}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
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

                  <button 
                    type="submit" 
                    className="btn btn-light btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Se connecter
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Les champs marqués d'un * sont obligatoires
                    </small>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <Link to="#" className="text-decoration-none small text-muted">
                      <i className="fas fa-question-circle me-1"></i>
                      Mot de passe oublié ?
                    </Link>
                    <Link to="/register" className="text-decoration-none small fw-bold">
                      <i className="fas fa-user-plus me-1"></i>
                      Créer un compte
                    </Link>
                  </div>
                </form>

                {/* Séparateur */}
                <div className="text-center my-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1" style={{height: '1px', background: '#dee2e6'}}></div>
                    <span className="px-3 text-muted small">ou</span>
                    <div className="flex-grow-1" style={{height: '1px', background: '#dee2e6'}}></div>
                  </div>
                </div>

                {/* Retour accueil */}
                <div className="text-center">
                  <Link to="/" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-2"></i>
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 