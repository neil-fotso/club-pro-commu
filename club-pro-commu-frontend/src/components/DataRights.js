import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function DataRights() {
  const { user } = useAuth();
  const [requestType, setRequestType] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestType || !reason) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await userAPI.exerciseDataRights(requestType, reason);
      setMessage('Votre demande a été enregistrée. Nous vous répondrons dans un délai de 30 jours.');
      setRequestType('');
      setReason('');
    } catch (error) {
      setMessage('Erreur lors de l\'envoi de votre demande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Vous devez être connecté pour exercer vos droits RGPD.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h1 className="h3 mb-0">
                <i className="fas fa-user-shield me-2"></i>
                Exercer vos droits RGPD
              </h1>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Vos droits RGPD :</strong> Vous pouvez exercer vos droits d'accès, de rectification, 
                d'effacement, de portabilité et d'opposition sur vos données personnelles.
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Type de demande *</strong>
                  </label>
                  <select
                    className="form-select"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    required
                  >
                    <option value="">Sélectionnez votre demande</option>
                    <option value="access">Droit d'accès - Voir mes données</option>
                    <option value="rectification">Droit de rectification - Corriger mes données</option>
                    <option value="erasure">Droit d'effacement - Supprimer mes données</option>
                    <option value="portability">Droit à la portabilité - Récupérer mes données</option>
                    <option value="opposition">Droit d'opposition - M'opposer au traitement</option>
                    <option value="limitation">Limitation du traitement</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <strong>Motif de votre demande *</strong>
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Décrivez votre demande et le motif..."
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="identityVerification"
                      required
                    />
                    <label className="form-check-label" htmlFor="identityVerification">
                      Je confirme que cette demande émane bien de moi et je fournis les informations 
                      nécessaires à la vérification de mon identité.
                    </label>
                  </div>
                </div>

                {message && (
                  <div className={`alert ${message.includes('Erreur') ? 'alert-danger' : 'alert-success'}`}>
                    {message}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Envoyer ma demande
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setRequestType('');
                      setReason('');
                      setMessage('');
                    }}
                  >
                    <i className="fas fa-times me-2"></i>
                    Annuler
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <h4 className="text-primary mb-3">Informations importantes</h4>
              
              <div className="row">
                <div className="col-md-6">
                  <h5 className="h6 text-success">
                    <i className="fas fa-clock me-2"></i>
                    Délai de réponse
                  </h5>
                  <p className="small">
                    Nous nous engageons à répondre à votre demande dans un délai maximum de 30 jours.
                  </p>
                </div>
                <div className="col-md-6">
                  <h5 className="h6 text-info">
                    <i className="fas fa-shield-alt me-2"></i>
                    Vérification d'identité
                  </h5>
                  <p className="small">
                    Pour protéger vos données, nous pouvons vous demander des informations 
                    supplémentaires pour vérifier votre identité.
                  </p>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-6">
                  <h5 className="h6 text-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Exceptions possibles
                  </h5>
                  <p className="small">
                    Certains droits peuvent être limités pour des raisons légales, 
                    de sécurité ou de fraude.
                  </p>
                </div>
                <div className="col-md-6">
                  <h5 className="h6 text-primary">
                    <i className="fas fa-envelope me-2"></i>
                    Contact alternatif
                  </h5>
                  <p className="small">
                    Vous pouvez aussi nous contacter directement à :<br />
                    <strong>privacy@club-pro-commu.com</strong>
                  </p>
                </div>
              </div>

              <div className="alert alert-light mt-4">
                <h6 className="text-primary mb-2">
                  <i className="fas fa-gavel me-2"></i>
                  Recours
                </h6>
                <p className="small mb-0">
                  Si vous n'êtes pas satisfait de notre réponse, vous pouvez saisir la 
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    Commission Nationale de l'Informatique et des Libertés (CNIL)
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 