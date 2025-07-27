import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CompetitionPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nom: '',
    type: 'tournoi',
    dateDebut: '',
    dateFin: '',
    nombreEquipes: 8,
    description: '',
    reglement: '',
    recompense: '',
    niveau: 'Tous niveaux',
    plateforme: 'PS5',
    statut: 'Ouvert',
    inscriptionGratuite: true,
    montantInscription: 0
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="text-center mb-5">
              <i className="fas fa-trophy fa-3x text-warning mb-3"></i>
              <h2 className="fw-bold">Créer une Compétition</h2>
              <p className="text-muted">Organisez des tournois et championnats pour votre communauté</p>
            </div>
            <div className="alert alert-warning text-center">
              <i className="fas fa-lock me-2"></i>
              Connectez-vous pour créer une compétition
            </div>
            <div className="text-center">
              <a href="/login" className="btn btn-primary btn-lg">
                <i className="fas fa-sign-in-alt me-2"></i>
                Se connecter
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    // Simulation d'une création de compétition
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  const resetForm = () => {
    setForm({
      nom: '',
      type: 'tournoi',
      dateDebut: '',
      dateFin: '',
      nombreEquipes: 8,
      description: '',
      reglement: '',
      recompense: '',
      niveau: 'Tous niveaux',
      plateforme: 'PS5',
      statut: 'Ouvert',
      inscriptionGratuite: true,
      montantInscription: 0
    });
    setSuccess(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="position-relative d-inline-block mb-3">
              <i className="fas fa-trophy fa-3x text-warning"></i>
              <div className="position-absolute top-0 start-100 translate-middle">
                <span className="badge bg-primary rounded-pill">
                  <i className="fas fa-plus"></i>
                </span>
              </div>
            </div>
            <h2 className="fw-bold text-gradient">Créer une Compétition</h2>
            <p className="text-muted">Organisez des tournois et championnats pour votre communauté FIFA Pro Clubs</p>
          </div>

          {success ? (
            <div className="card border-success">
              <div className="card-body text-center p-5">
                <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
                <h3 className="text-success mb-3">Compétition créée avec succès !</h3>
                <p className="text-muted mb-4">Votre compétition a été créée et est maintenant visible par tous les clubs.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button onClick={resetForm} className="btn btn-outline-primary">
                    <i className="fas fa-plus me-2"></i>
                    Créer une autre compétition
                  </button>
                  <a href="/clubs" className="btn btn-primary">
                    <i className="fas fa-trophy me-2"></i>
                    Voir mes compétitions
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Informations générales */}
                    <div className="col-lg-8">
                      <h4 className="mb-4">
                        <i className="fas fa-info-circle text-primary me-2"></i>
                        Informations générales
                      </h4>
                      
                      <div className="row">
                        <div className="col-md-8 mb-3">
                          <label htmlFor="nom" className="form-label">
                            <i className="fas fa-trophy me-2"></i>
                            Nom de la compétition *
                          </label>
                          <input 
                            type="text" 
                            className="form-control form-control-lg" 
                            id="nom"
                            name="nom" 
                            value={form.nom} 
                            onChange={handleChange} 
                            placeholder="Ex: Coupe de France Pro Clubs 2024"
                            required 
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="type" className="form-label">
                            <i className="fas fa-flag me-2"></i>
                            Type de compétition *
                          </label>
                          <select 
                            className="form-select form-select-lg" 
                            id="type"
                            name="type" 
                            value={form.type} 
                            onChange={handleChange}
                          >
                            <option value="tournoi">Tournoi</option>
                            <option value="championnat">Championnat</option>
                            <option value="coupe">Coupe</option>
                            <option value="friendly">Match amical</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                          <i className="fas fa-align-left me-2"></i>
                          Description
                        </label>
                        <textarea 
                          className="form-control" 
                          id="description"
                          name="description" 
                          value={form.description} 
                          onChange={handleChange}
                          rows="3"
                          placeholder="Décrivez votre compétition, ses objectifs et son format..."
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="dateDebut" className="form-label">
                            <i className="fas fa-calendar-alt me-2"></i>
                            Date de début *
                          </label>
                          <input 
                            type="date" 
                            className="form-control form-control-lg" 
                            id="dateDebut"
                            name="dateDebut" 
                            value={form.dateDebut} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="dateFin" className="form-label">
                            <i className="fas fa-calendar-check me-2"></i>
                            Date de fin
                          </label>
                          <input 
                            type="date" 
                            className="form-control form-control-lg" 
                            id="dateFin"
                            name="dateFin" 
                            value={form.dateFin} 
                            onChange={handleChange} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Paramètres techniques */}
                    <div className="col-lg-4">
                      <h4 className="mb-4">
                        <i className="fas fa-cogs text-primary me-2"></i>
                        Paramètres
                      </h4>

                      <div className="mb-3">
                        <label htmlFor="nombreEquipes" className="form-label">
                          <i className="fas fa-users me-2"></i>
                          Nombre d'équipes *
                        </label>
                        <input 
                          type="number" 
                          className="form-control form-control-lg" 
                          id="nombreEquipes"
                          name="nombreEquipes" 
                          min="2" 
                          max="64" 
                          value={form.nombreEquipes} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="niveau" className="form-label">
                          <i className="fas fa-star me-2"></i>
                          Niveau requis
                        </label>
                        <select 
                          className="form-select form-select-lg" 
                          id="niveau"
                          name="niveau" 
                          value={form.niveau} 
                          onChange={handleChange}
                        >
                          <option value="Tous niveaux">Tous niveaux</option>
                          <option value="Débutant">Débutant</option>
                          <option value="Intermédiaire">Intermédiaire</option>
                          <option value="Avancé">Avancé</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="plateforme" className="form-label">
                          <i className="fas fa-gamepad me-2"></i>
                          Plateforme
                        </label>
                        <select 
                          className="form-select form-select-lg" 
                          id="plateforme"
                          name="plateforme" 
                          value={form.plateforme} 
                          onChange={handleChange}
                        >
                          <option value="PS5">PlayStation 5</option>
                          <option value="PS4">PlayStation 4</option>
                          <option value="Xbox">Xbox</option>
                          <option value="PC">PC</option>
                          <option value="Cross-Platform">Cross-Platform</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="statut" className="form-label">
                          <i className="fas fa-toggle-on me-2"></i>
                          Statut
                        </label>
                        <select 
                          className="form-select form-select-lg" 
                          id="statut"
                          name="statut" 
                          value={form.statut} 
                          onChange={handleChange}
                        >
                          <option value="Ouvert">Ouvert aux inscriptions</option>
                          <option value="Fermé">Fermé</option>
                          <option value="En cours">En cours</option>
                          <option value="Terminé">Terminé</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Inscriptions et récompenses */}
                  <div className="row mt-4">
                    <div className="col-lg-6">
                      <h5 className="mb-3">
                        <i className="fas fa-credit-card text-primary me-2"></i>
                        Inscriptions
                      </h5>
                      
                      <div className="form-check form-switch mb-3">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="inscriptionGratuite"
                          name="inscriptionGratuite" 
                          checked={form.inscriptionGratuite} 
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="inscriptionGratuite">
                          Inscription gratuite
                        </label>
                      </div>

                      {!form.inscriptionGratuite && (
                        <div className="mb-3">
                          <label htmlFor="montantInscription" className="form-label">
                            <i className="fas fa-euro-sign me-2"></i>
                            Montant d'inscription (€)
                          </label>
                          <input 
                            type="number" 
                            className="form-control" 
                            id="montantInscription"
                            name="montantInscription" 
                            min="0" 
                            step="0.01"
                            value={form.montantInscription} 
                            onChange={handleChange} 
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-lg-6">
                      <h5 className="mb-3">
                        <i className="fas fa-gift text-primary me-2"></i>
                        Récompenses
                      </h5>
                      
                      <div className="mb-3">
                        <label htmlFor="recompense" className="form-label">
                          <i className="fas fa-medal me-2"></i>
                          Récompenses
                        </label>
                        <textarea 
                          className="form-control" 
                          id="recompense"
                          name="recompense" 
                          value={form.recompense} 
                          onChange={handleChange}
                          rows="3"
                          placeholder="Décrivez les récompenses (trophées, prix, etc.)..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Règlement */}
                  <div className="mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-book text-primary me-2"></i>
                      Règlement
                    </h5>
                    <div className="mb-3">
                      <label htmlFor="reglement" className="form-label">
                        <i className="fas fa-clipboard-list me-2"></i>
                        Règlement de la compétition
                      </label>
                      <textarea 
                        className="form-control" 
                        id="reglement"
                        name="reglement" 
                        value={form.reglement} 
                        onChange={handleChange}
                        rows="5"
                        placeholder="Détaillez les règles, le format des matchs, les sanctions, etc..."
                      />
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      <i className="fas fa-undo me-2"></i>
                      Réinitialiser
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
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
                          Créer la compétition
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Note sur les champs obligatoires */}
          <div className="text-center mt-4">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Les champs marqués d'un * sont obligatoires
            </small>
          </div>
        </div>
      </div>
    </div>
  );
} 