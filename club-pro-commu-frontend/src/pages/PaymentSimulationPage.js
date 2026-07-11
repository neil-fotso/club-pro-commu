import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI, clubAPI } from '../services/api';

export default function PaymentSimulationPage() {
  const { id: competitionId, clubId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [competition, setCompetition] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Card states
  const [cardData, setCardData] = useState({
    numeroCarte: '',
    dateExpiration: '',
    cvv: '',
    nomTitulaire: ''
  });
  
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | processing | success | error
  const [processingStep, setProcessingStep] = useState(0);
  const [transactionId, setTransactionId] = useState('');

  const steps = [
    "Connexion sécurisée avec Stripe...",
    "Vérification des informations bancaires...",
    "Autorisation du prélèvement de la provision...",
    "Enregistrement de la transaction en base de données...",
    "Finalisation de l'inscription..."
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Charger la compétition
        const compData = await competitionAPI.getCompetition(competitionId);
        setCompetition(compData);

        // Charger le club
        const clubData = await clubAPI.getClub(clubId);
        setClub(clubData);
      } catch (err) {
        console.error('Erreur chargement données:', err);
        setError('Impossible de charger les détails du paiement. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [competitionId, clubId]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    // Formatter le numéro de carte (ajouter des espaces tous les 4 chiffres)
    if (name === 'numeroCarte') {
      const cleanValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = cleanValue.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || '';
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length > 0) {
        setCardData({ ...cardData, [name]: parts.join(' ') });
      } else {
        setCardData({ ...cardData, [name]: cleanValue });
      }
      return;
    }

    // Formatter la date d'expiration (MM/AA)
    if (name === 'dateExpiration') {
      const cleanValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (cleanValue.length >= 2) {
        setCardData({ 
          ...cardData, 
          [name]: `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}` 
        });
      } else {
        setCardData({ ...cardData, [name]: cleanValue });
      }
      return;
    }

    // Limiter le CVV à 3 chiffres
    if (name === 'cvv') {
      const cleanValue = value.replace(/[^0-9]/gi, '').substring(0, 3);
      setCardData({ ...cardData, [name]: cleanValue });
      return;
    }

    setCardData({ ...cardData, [name]: value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardData.numeroCarte || !cardData.dateExpiration || !cardData.cvv || !cardData.nomTitulaire) {
      setError('Veuillez remplir tous les champs de la carte.');
      return;
    }

    setPaymentStatus('processing');
    setProcessingStep(0);
    setError('');

    // Simuler le défilement des étapes Stripe
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingStep(i);
    }

    try {
      // Envoyer la requête au backend
      const result = await competitionAPI.payerInscription(competitionId, clubId, cardData, user.token);
      
      if (result.success) {
        setPaymentStatus('success');
        setTransactionId(result.transactionId || `tx_stripe_${Math.random().toString(36).substring(2, 15)}`);
      } else {
        throw new Error(result.message || 'Erreur lors du traitement du paiement');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Le paiement a échoué. Veuillez vérifier vos coordonnées bancaires.');
      setPaymentStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center text-white" style={{ background: '#0f0c1b' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <h4>Initialisation du tunnel de paiement sécurisé...</h4>
        </div>
      </div>
    );
  }

  if (!competition || !club) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center text-white" style={{ background: '#0f0c1b' }}>
        <div className="text-center p-5 card bg-dark border-secondary" style={{ maxWidth: '500px' }}>
          <i className="fas fa-exclamation-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
          <h3>Erreur d'initialisation</h3>
          <p className="text-muted mt-2">{error || 'Compétition ou club introuvable.'}</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/competitions')}>
            Retour aux compétitions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5 text-white d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #0f0c20 0%, #15102a 100%)', fontFamily: "'Outfit', sans-serif" }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* En-tête de retour */}
        <div className="mb-4">
          <button onClick={() => navigate(`/competition/${competitionId}`)} className="btn btn-link text-white text-decoration-none p-0">
            <i className="fas fa-arrow-left me-2"></i> Retour à la compétition
          </button>
        </div>

        <div className="row g-4">
          {/* Colonne Gauche : Résumé de la commande */}
          <div className="col-md-5">
            <div className="card h-100 border-0 p-4" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}>
              <h5 className="text-primary text-uppercase small tracking-wider mb-4">Résumé de l'inscription</h5>
              
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="fas fa-trophy text-primary" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted small">Compétition</h6>
                  <span className="fw-bold text-white">{competition.nom}</span>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="fas fa-shield-alt text-success" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted small">Club Inscrit</h6>
                  <span className="fw-bold text-white">{club.nom}</span>
                </div>
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

              <div className="my-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Frais d'inscription</span>
                  <span>{competition.montantInscription},00 €</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">TVA (Simulée)</span>
                  <span>0,00 €</span>
                </div>
                <div className="d-flex justify-content-between pt-3 border-top border-secondary font-weight-bold" style={{ fontSize: '1.25rem' }}>
                  <span>Total à payer</span>
                  <span className="text-success fw-bold">{competition.montantInscription},00 €</span>
                </div>
              </div>

              <div className="mt-auto bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-35 text-center">
                <small className="text-muted small">
                  <i className="fas fa-lock me-2 text-success"></i>
                  Paiement sécurisé crypté SSL de bout en bout.
                </small>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Formulaire Stripe et simulation */}
          <div className="col-md-7">
            <div className="card border-0 p-4 h-100" style={{ background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px' }}>
              
              {paymentStatus === 'idle' && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0">Informations de Paiement</h4>
                    <div className="d-flex gap-2">
                      <i className="fab fa-cc-visa text-muted" style={{ fontSize: '1.8rem' }}></i>
                      <i className="fab fa-cc-mastercard text-muted" style={{ fontSize: '1.8rem' }}></i>
                      <i className="fab fa-cc-stripe text-primary" style={{ fontSize: '1.8rem' }}></i>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 mb-4">
                      <i className="fas fa-exclamation-triangle me-2"></i> {error}
                    </div>
                  )}

                  <form onSubmit={handlePaymentSubmit}>
                    <div className="mb-4">
                      <label className="form-label text-muted small fw-bold">Nom du Titulaire de la carte</label>
                      <input 
                        type="text" 
                        name="nomTitulaire"
                        className="form-control bg-dark text-white border-secondary p-3"
                        placeholder="Jean Dupont"
                        value={cardData.nomTitulaire}
                        onChange={handleCardChange}
                        required
                        style={{ borderRadius: '10px' }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-muted small fw-bold">Numéro de carte</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-muted"><i className="fas fa-credit-card"></i></span>
                        <input 
                          type="text" 
                          name="numeroCarte"
                          className="form-control bg-dark text-white border-secondary p-3"
                          placeholder="4242 4242 4242 4242"
                          value={cardData.numeroCarte}
                          onChange={handleCardChange}
                          required
                          style={{ borderRadius: '0 10px 10px 0' }}
                        />
                      </div>
                      <small className="text-muted mt-1 d-block">Utilisez la carte de test Stripe 4242 4242...</small>
                    </div>

                    <div className="row mb-4">
                      <div className="col-6">
                        <label className="form-label text-muted small fw-bold">Date d'expiration</label>
                        <input 
                          type="text" 
                          name="dateExpiration"
                          className="form-control bg-dark text-white border-secondary p-3"
                          placeholder="MM/AA"
                          value={cardData.dateExpiration}
                          onChange={handleCardChange}
                          required
                          style={{ borderRadius: '10px' }}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small fw-bold">Code CVC / CVV</label>
                        <input 
                          type="password" 
                          name="cvv"
                          className="form-control bg-dark text-white border-secondary p-3"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          required
                          style={{ borderRadius: '10px' }}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <button type="submit" className="btn btn-success btn-lg w-100 p-3 fw-bold shadow-lg" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #24b47e 0%, #1c9465 100%)', border: 'none' }}>
                        <i className="fas fa-lock me-2"></i> Payer {competition.montantInscription},00 €
                      </button>
                    </div>
                  </form>
                </>
              )}

              {paymentStatus === 'processing' && (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center">
                  <div className="spinner-border text-success mb-4" role="status" style={{ width: '4rem', height: '4rem' }}></div>
                  <h4 className="fw-bold">Traitement de la transaction</h4>
                  <p className="text-muted px-4 mt-2">N'actualisez pas cette page et ne fermez pas votre navigateur.</p>
                  
                  <div className="mt-4 p-3 bg-dark bg-opacity-50 rounded border border-secondary border-opacity-35 w-100" style={{ maxWidth: '380px' }}>
                    <i className="fas fa-shield-alt text-success me-2 animate-pulse"></i>
                    <span className="small text-white transition-all duration-300">{steps[processingStep]}</span>
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center">
                  <div className="bg-success bg-opacity-10 text-success rounded-circle p-4 mb-4 animate-bounce">
                    <i className="fas fa-check-circle" style={{ fontSize: '4rem' }}></i>
                  </div>
                  
                  <h3 className="fw-bold text-success">Paiement Réussi !</h3>
                  <p className="text-muted px-4">Votre club <strong>{club.nom}</strong> est maintenant officiellement inscrit et confirmé dans le tournoi.</p>
                  
                  <div className="card w-100 bg-dark border-secondary p-3 my-4 text-start font-monospace small" style={{ maxWidth: '400px' }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Transaction ID :</span>
                      <span className="text-success">{transactionId}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Montant Payé :</span>
                      <span>{competition.montantInscription},00 €</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Statut du Club :</span>
                      <span className="badge bg-success">Confirmé</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/competition/${competitionId}`)} 
                    className="btn btn-primary btn-lg px-5 fw-bold" 
                    style={{ borderRadius: '10px' }}
                  >
                    Retourner au tournoi
                  </button>
                </div>
              )}

              {paymentStatus === 'error' && (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center">
                  <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-4 mb-4">
                    <i className="fas fa-times-circle" style={{ fontSize: '4rem' }}></i>
                  </div>
                  
                  <h3 className="fw-bold text-danger">Échec du Paiement</h3>
                  <p className="text-danger px-4 mt-2">{error || 'Le prélèvement a été refusé par l\'organisme bancaire.'}</p>
                  
                  <button 
                    onClick={() => setPaymentStatus('idle')} 
                    className="btn btn-outline-light btn-lg px-5 fw-bold mt-4" 
                    style={{ borderRadius: '10px' }}
                  >
                    Réessayer
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
