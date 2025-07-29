import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { competitionAPI } from '../services/api';

export default function CompetitionPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nom: '',
    type: 'championnat',
    formatCoupe: 'elimination_directe',
    visibilite: 'publique',
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
              <p className="text-muted">Organisez des championnats et coupes pour votre communauté</p>
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
    
    try {
      // Préparer les données de la compétition
      const competitionData = {
        ...form,
        dateDebut: new Date(form.dateDebut).toISOString(),
        dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
        montantInscription: form.inscriptionGratuite ? 0 : form.montantInscription
      };

      // Appeler l'API pour créer la compétition
      await competitionAPI.createCompetition(competitionData, user.token);
      
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error('Erreur création compétition:', error);
      alert('Erreur lors de la création de la compétition: ' + (error.message || 'Erreur inconnue'));
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      nom: '',
      type: 'championnat',
      formatCoupe: 'elimination_directe',
      visibilite: 'publique',
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

  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="text-center">
              <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
              <h2 className="fw-bold text-success">Compétition créée avec succès !</h2>
              <p className="text-muted mb-4">Votre compétition a été créée et est maintenant visible par la communauté.</p>
              <div className="d-flex gap-2 justify-content-center">
                <button onClick={resetForm} className="btn btn-primary">
                  <i className="fas fa-plus me-2"></i>
                  Créer une autre compétition
                </button>
                <a href="/mes-competitions" className="btn btn-outline-primary">
                  <i className="fas fa-list me-2"></i>
                  Voir mes compétitions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <i className="fas fa-trophy fa-3x text-warning mb-3"></i>
            <h2 className="fw-bold">Créer une Compétition</h2>
            <p className="text-muted">Organisez des championnats et coupes pour votre communauté</p>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Informations de base */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-trophy me-2"></i>
                      Nom de la compétition *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Championnat D1 2024"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-gamepad me-2"></i>
                      Type de compétition *
                    </label>
                    <select
                      className="form-select"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="championnat">Championnat</option>
                      <option value="coupe">Coupe</option>
                    </select>
                  </div>

                  {/* Format de coupe (visible seulement si type = coupe) */}
                  {form.type === 'coupe' && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="fas fa-sitemap me-2"></i>
                        Format de la coupe *
                      </label>
                      <select
                        className="form-select"
                        name="formatCoupe"
                        value={form.formatCoupe}
                        onChange={handleChange}
                        required
                      >
                        <option value="elimination_directe">Élimination directe</option>
                        <option value="poules_elimination">Phases de poules + Élimination directe</option>
                      </select>
                    </div>
                  )}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-eye me-2"></i>
                      Visibilité *
                    </label>
                    <select
                      className="form-select"
                      name="visibilite"
                      value={form.visibilite}
                      onChange={handleChange}
                      required
                    >
                      <option value="publique">Publique (inscription libre)</option>
                      <option value="privee">Privée (demande d'inscription)</option>
                    </select>
                  </div>

                  {/* Dates */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-calendar me-2"></i>
                      Date de début *
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="dateDebut"
                      value={form.dateDebut}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-calendar-check me-2"></i>
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="dateFin"
                      value={form.dateFin}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Configuration */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <i className="fas fa-users me-2"></i>
                      Nombre d'équipes *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="nombreEquipes"
                      value={form.nombreEquipes}
                      onChange={handleChange}
                      min="2"
                      max="64"
                      required
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <i className="fas fa-star me-2"></i>
                      Niveau
                    </label>
                    <select
                      className="form-select"
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

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <i className="fas fa-gamepad me-2"></i>
                      Plateforme
                    </label>
                    <select
                      className="form-select"
                      name="plateforme"
                      value={form.plateforme}
                      onChange={handleChange}
                    >
                      <option value="PS5">PS5</option>
                      <option value="PS4">PS4</option>
                      <option value="Xbox">Xbox</option>
                      <option value="PC">PC</option>
                      <option value="Cross-Platform">Cross-Platform</option>
                    </select>
                  </div>

                  {/* Inscription */}
                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="inscriptionGratuite"
                        checked={form.inscriptionGratuite}
                        onChange={handleChange}
                        id="inscriptionGratuite"
                      />
                      <label className="form-check-label" htmlFor="inscriptionGratuite">
                        Inscription gratuite
                      </label>
                    </div>
                  </div>

                  {!form.inscriptionGratuite && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="fas fa-euro-sign me-2"></i>
                        Montant d'inscription
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="montantInscription"
                        value={form.montantInscription}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      <i className="fas fa-info-circle me-2"></i>
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Décrivez votre compétition..."
                      maxLength="1000"
                    ></textarea>
                  </div>

                  {/* Règlement */}
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      <i className="fas fa-gavel me-2"></i>
                      Règlement
                    </label>
                    <textarea
                      className="form-control"
                      name="reglement"
                      value={form.reglement}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Règlement de la compétition..."
                      maxLength="2000"
                    ></textarea>
                  </div>

                  {/* Récompenses */}
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      <i className="fas fa-medal me-2"></i>
                      Récompenses
                    </label>
                    <textarea
                      className="form-control"
                      name="recompense"
                      value={form.recompense}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Récompenses pour les gagnants..."
                      maxLength="500"
                    ></textarea>
                  </div>
                </div>

                <div className="text-center mt-4">
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
                        <i className="fas fa-plus me-2"></i>
                        Créer la compétition
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 