import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';

// Schéma de validation Yup simplifié
const registerSchema = yup.object({
  pseudo: yup
    .string()
    .required('Le pseudo est obligatoire')
    .min(3, 'Le pseudo doit contenir au moins 3 caractères')
    .max(20, 'Le pseudo ne peut pas dépasser 20 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores'),
  
  email: yup
    .string()
    .required('L\'email est obligatoire')
    .email('Format d\'email invalide'),
  
  password: yup
    .string()
    .required('Le mot de passe est obligatoire')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  
  confirmPassword: yup
    .string()
    .required('La confirmation du mot de passe est obligatoire')
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
  
  acceptedTerms: yup
    .boolean()
    .oneOf([true], 'Vous devez accepter les conditions d\'utilisation et la politique de confidentialité')
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    clearErrors
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange'
  });

  // Réinitialiser les erreurs quand l'utilisateur corrige
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && errors[name]) {
        clearErrors(name);
      }
      setServerError(''); // Effacer les erreurs serveur quand l'utilisateur modifie
    });
    return () => subscription.unsubscribe();
  }, [watch, errors, clearErrors]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    setSuccess('');

    try {
      // Préparer les données simplifiées pour l'API
      const userData = {
        pseudo: data.pseudo,
        pseudoPlateforme: data.pseudo,
        email: data.email,
        password: data.password,
        plateforme: 'PS5', // Valeur par défaut requise par le backend
        postePrincipal: 'BU' // Valeur par défaut requise par le backend
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        setSuccess('Inscription réussie ! Redirection...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Gérer les erreurs spécifiques du serveur
        if (result.field) {
          setValue(result.field, '');
          setServerError(`${result.error} (champ: ${result.field})`);
        } else {
          setServerError(result.error);
        }
      }
    } catch (error) {
      setServerError('Oups ! Il semble y avoir eu un petit problème technique lors de l\'inscription. Pas de panique, réessayez dans quelques instants ! 🚀');
      console.error('Erreur inscription:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" 
         style={{
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           minHeight: '100vh'
         }}>
      <div className="card border-0 shadow-lg" style={{maxWidth: 500, width: '100%'}}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="card-title mb-3">
              <i className="fas fa-user-plus me-2"></i>
              Inscription
            </h2>
            <p className="text-muted">Rejoignez la communauté Club Pro</p>
          </div>

          {serverError && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Pseudo */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                <i className="fas fa-user me-1"></i>
                Pseudo *
              </label>
              <input
                type="text"
                className={`form-control form-control-lg ${errors.pseudo ? 'is-invalid' : ''}`}
                {...register('pseudo')}
                placeholder="Votre pseudo"
              />
              {errors.pseudo && (
                <div className="invalid-feedback">
                  <i className="fas fa-exclamation-circle me-1"></i>
                  {errors.pseudo.message}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                <i className="fas fa-envelope me-1"></i>
                Email *
              </label>
              <input
                type="email"
                className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                {...register('email')}
                placeholder="votre@email.com"
              />
              {errors.email && (
                <div className="invalid-feedback">
                  <i className="fas fa-exclamation-circle me-1"></i>
                  {errors.email.message}
                </div>
              )}
            </div>

            {/* Mot de passe & Confirmation */}
            <div className="row">
              {/* Mot de passe */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  <i className="fas fa-lock me-1"></i>
                  Mot de passe *
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password')}
                    placeholder="Mot de passe"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <div className="invalid-feedback d-block">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    {errors.password.message}
                  </div>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  <i className="fas fa-lock me-1"></i>
                  Confirmer le mot de passe *
                </label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    {...register('confirmPassword')}
                    placeholder="Confirmer le mot de passe"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="invalid-feedback d-block">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>
            </div>

            {/* Conditions */}
            <div className="mb-4">
              <div className="form-check">
                <input
                  className={`form-check-input ${errors.acceptedTerms ? 'is-invalid' : ''}`}
                  type="checkbox"
                  id="acceptedTerms"
                  {...register('acceptedTerms')}
                />
                <label className="form-check-label" htmlFor="acceptedTerms">
                  J'accepte les <Link to="/terms" target="_blank">conditions d'utilisation</Link> et la <Link to="/privacy" target="_blank">politique de confidentialité</Link> *
                </label>
                {errors.acceptedTerms && (
                  <div className="invalid-feedback d-block">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    {errors.acceptedTerms.message}
                  </div>
                )}
              </div>
            </div>

            {/* Bouton d'inscription */}
            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || !isValid}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus me-2"></i>
                    S'inscrire
                  </>
                )}
              </button>
            </div>

            {success && (
              <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
                <i className="fas fa-check-circle me-2"></i>
                {success}
              </div>
            )}

            <div className="text-center mt-4">
              <p className="text-muted mb-0">
                Déjà inscrit ? 
                <Link to="/login" className="text-primary ms-1">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}