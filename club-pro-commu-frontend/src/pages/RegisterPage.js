import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCountries, getCountryFlag } from '../utils/countryUtils';

// Styles CSS pour les champs en erreur
const errorStyles = {
  border: '2px solid #dc3545',
  backgroundColor: '#fff5f5',
  boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
};

// Styles CSS inline pour forcer l'affichage
const getFieldStyle = (fieldName, errorField) => {
  if (errorField === fieldName) {
    return {
      border: '3px solid #ff0000',
      backgroundColor: '#ffe6e6',
      boxShadow: '0 0 0 0.3rem rgba(255, 0, 0, 0.3)'
    };
  }
  return {};
};



export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errorField, setErrorField] = useState('');
  
  // Test temporaire pour vérifier les styles - décommentez pour tester
  // const [errorField, setErrorField] = useState('pseudo');
  // const [error, setError] = useState('Test erreur pseudo');

  const allCountries = getAllCountries();

  // Fonction pour scroll vers un champ
  const scrollToField = (fieldName) => {
    setTimeout(() => {
      const fieldElement = document.querySelector(`[name="${fieldName}"]`);
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

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
    setErrorField('');

    if (!formData.pseudo) {
      setError('Veuillez indiquer votre pseudo');
      setErrorField('pseudo');
      scrollToField('pseudo');
      setLoading(false);
      return;
    }

    if (!formData.pseudoPlateforme) {
      setError('Veuillez indiquer votre pseudo sur la plateforme');
      setErrorField('pseudoPlateforme');
      scrollToField('pseudoPlateforme');
      setLoading(false);
      return;
    }

    if (!formData.email) {
      setError('Veuillez indiquer votre email');
      setErrorField('email');
      scrollToField('email');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Veuillez indiquer votre mot de passe');
      setErrorField('password');
      scrollToField('password');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setErrorField('confirmPassword');
      scrollToField('confirmPassword');
      setLoading(false);
      return;
    }

    if (!formData.plateforme) {
      setError('Veuillez sélectionner votre plateforme');
      setErrorField('plateforme');
      scrollToField('plateforme');
      setLoading(false);
      return;
    }



    if (!acceptedTerms) {
      setError('Vous devez accepter les Conditions Générales d\'Utilisation');
      setErrorField('terms');
      scrollToField('terms');
      setLoading(false);
      return;
    }

    if (!acceptedPrivacy) {
      setError('Vous devez accepter la Politique de Confidentialité');
      setErrorField('privacy');
      scrollToField('privacy');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      if (result.success) {
        setSuccess('Inscription réussie ! Redirection...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.error || 'Erreur lors de l\'inscription');
        
        // Si l'erreur vient de l'API avec un champ spécifique
        if (result.field) {
          setErrorField(result.field);
          // Scroll vers le champ en erreur
          setTimeout(() => {
            const fieldElement = document.querySelector(`[name="${result.field}"]`);
            if (fieldElement) {
              fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" 
           style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             minHeight: '100vh'
           }}>
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="card border-0 shadow-lg">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <i className="fas fa-user-plus text-primary" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h2 className="card-title">Créer un compte</h2>
                <p className="text-muted">Rejoignez la communauté des joueurs</p>
              </div>

              {error && (
                <div className="alert alert-danger border-0 bg-danger bg-opacity-10 mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                  {errorField && (
                    <div className="mt-2">
                      <small className="text-muted">Champ en erreur: {errorField}</small>
                      <br />
                      <small className="text-muted">Style appliqué: {JSON.stringify(getFieldStyle(errorField, errorField))}</small>
                    </div>
                  )}
                </div>
              )}

              {success && (
                <div className="alert alert-success border-0 bg-success bg-opacity-10 mb-4">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}



              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-user me-2"></i>
                        Pseudo <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errorField === 'pseudo' ? 'is-invalid field-error' : ''}`}
                        name="pseudo"
                        value={formData.pseudo}
                        onChange={handleChange}
                        placeholder="Votre pseudo"
                        required
                        style={getFieldStyle('pseudo', errorField)}
                      />
                      {errorField === 'pseudo' && (
                        <div className="invalid-feedback">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-gamepad me-2"></i>
                        Pseudo sur plateforme <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errorField === 'pseudoPlateforme' ? 'is-invalid' : ''}`}
                        name="pseudoPlateforme"
                        value={formData.pseudoPlateforme}
                        onChange={handleChange}
                        placeholder="Votre pseudo en jeu"
                        required
                        style={getFieldStyle('pseudoPlateforme', errorField)}
                      />
                      {errorField === 'pseudoPlateforme' && (
                        <div className="invalid-feedback">
                          {error}
                        </div>
                      )}
                      <div className="form-check mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="useSamePseudo"
                          checked={useSamePseudo}
                          onChange={handleUseSamePseudo}
                        />
                        <label className="form-check-label" htmlFor="useSamePseudo">
                          Même que mon pseudo
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-envelope me-2"></i>
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errorField === 'email' ? 'is-invalid' : ''}`}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        required
                        style={getFieldStyle('email', errorField)}
                      />
                      {errorField === 'email' && (
                        <div className="invalid-feedback">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-lock me-2"></i>
                        Mot de passe <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errorField === 'password' ? 'is-invalid' : ''}`}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Votre mot de passe"
                        required
                        style={getFieldStyle('password', errorField)}
                      />
                      {errorField === 'password' && (
                        <div className="invalid-feedback">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-lock me-2"></i>
                        Confirmer le mot de passe <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errorField === 'confirmPassword' ? 'is-invalid' : ''}`}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmez votre mot de passe"
                        required
                        style={getFieldStyle('confirmPassword', errorField)}
                      />
                      {errorField === 'confirmPassword' && (
                        <div className="invalid-feedback">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-gamepad me-2"></i>
                        Plateforme <span className="text-danger">*</span>
                      </label>
                                              <select
                          className={`form-select ${errorField === 'plateforme' ? 'is-invalid' : ''}`}
                          name="plateforme"
                          value={formData.plateforme}
                          onChange={handleChange}
                          required
                          style={getFieldStyle('plateforme', errorField)}
                        >
                          <option value="">Sélectionnez votre plateforme</option>
                          <option value="PC">PC</option>
                          <option value="PS5">PlayStation 5</option>
                          <option value="Xbox">Xbox</option>
                        </select>
                        {errorField === 'plateforme' && (
                          <div className="invalid-feedback">
                            {error}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                                              <label className="form-label">
                          <i className="fas fa-futbol me-2"></i>
                          Poste principal
                        </label>
                        <select
                          className="form-select"
                          name="postePrincipal"
                          value={formData.postePrincipal}
                          onChange={handleChange}
                        >
                        <option value="">Sélectionnez votre poste</option>
                        <option value="BU">Buteur (BU)</option>
                        <option value="AG">Ailier Gauche (AG)</option>
                        <option value="AD">Ailier Droit (AD)</option>
                        <option value="MOC">Milieu Offensif Central (MOC)</option>
                        <option value="MG">Milieu Gauche (MG)</option>
                        <option value="MD">Milieu Droit (MD)</option>
                        <option value="MC">Milieu Central (MC)</option>
                        <option value="MDC">Milieu Défensif Central (MDC)</option>
                        <option value="DD">Défenseur Droit (DD)</option>
                        <option value="DG">Défenseur Gauche (DG)</option>
                        <option value="DC">Défenseur Central (DC)</option>
                        <option value="DLD">Défenseur Latéral Droit (DLD)</option>
                        <option value="DLG">Défenseur Latéral Gauche (DLG)</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-birthday-cake me-2"></i>
                        Âge
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Votre âge"
                        min="13"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-flag me-2"></i>
                        Nationalité
                      </label>
                      <select
                        className="form-select"
                        name="pays"
                        value={formData.pays}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionnez votre nationalité</option>
                        {allCountries.map((country, index) => (
                          <option key={index} value={country.name}>
                            {getCountryFlag(country.code)} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section CGU et Politique de Confidentialité */}
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <h6 className="text-primary mb-3">
                      <i className="fas fa-gavel me-2"></i>
                      Conditions légales
                    </h6>
                    
                    <div className="mb-3">
                      <div className={`form-check ${errorField === 'terms' ? 'is-invalid' : ''}`}>
                        <input
                          className={`form-check-input ${errorField === 'terms' ? 'is-invalid' : ''}`}
                          type="checkbox"
                          id="acceptedTerms"
                          name="terms"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          required
                          style={errorField === 'terms' ? errorStyles : {}}
                        />
                        <label className="form-check-label" htmlFor="acceptedTerms">
                          J'accepte les{' '}
                          <Link to="/cgu" target="_blank" className="text-decoration-none">
                            <strong>Conditions Générales d'Utilisation</strong>
                          </Link>
                          {' '}<span className="text-danger">*</span>
                        </label>
                        {errorField === 'terms' && (
                          <div className="invalid-feedback">
                            {error}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className={`form-check ${errorField === 'privacy' ? 'is-invalid' : ''}`}>
                        <input
                          className={`form-check-input ${errorField === 'privacy' ? 'is-invalid' : ''}`}
                          type="checkbox"
                          id="acceptedPrivacy"
                          name="privacy"
                          checked={acceptedPrivacy}
                          onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                          required
                          style={errorField === 'privacy' ? errorStyles : {}}
                        />
                        <label className="form-check-label" htmlFor="acceptedPrivacy">
                          J'accepte la{' '}
                          <Link to="/privacy" target="_blank" className="text-decoration-none">
                            <strong>Politique de Confidentialité</strong>
                          </Link>
                          {' '}et le traitement de mes données personnelles <span className="text-danger">*</span>
                        </label>
                        {errorField === 'privacy' && (
                          <div className="invalid-feedback">
                            {error}
                          </div>
                        )}
                      </div>
                    </div>

                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      En cochant ces cases, vous acceptez nos conditions et confirmez avoir lu notre politique de confidentialité.
                    </small>
                  </div>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Créer mon compte
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="text-decoration-none">
                    <strong>Se connecter</strong>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 