import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI } from '../services/api';

const CreateCompetitionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/competitions');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    nom: '',
    type: 'elimination_directe',
    modeMatch: 'simple',
    description: '',
    dateDebut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    nombreEquipes: 8,
    nombreEquipesParPoule: 4,
    plateforme: 'PS5',
    visibilite: 'publique',
    modeInscription: 'libre',
    inscriptionGratuite: true,
    montantInscription: 0,
    cashprizeFinal: 0
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Si le type change, ajuster automatiquement le nombre d'équipes
      if (name === 'type') {
        let newNombreEquipes = 8; // Valeur par défaut
        if (value === 'elimination_directe') {
          newNombreEquipes = 8;
        } else if (value === 'poule_elimination') {
          newNombreEquipes = 8;
        } else if (value === 'championnat') {
          newNombreEquipes = 8;
        }
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          nombreEquipes: newNombreEquipes
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.nom || !formData.dateDebut || !formData.nombreEquipes) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validation du nombre d'équipes selon le type
      if (formData.type === 'elimination_directe') {
        const validNumbers = [2, 4, 8, 16, 32];
        if (!validNumbers.includes(parseInt(formData.nombreEquipes))) {
          throw new Error('Le nombre d\'équipes doit être 2, 4, 8, 16 ou 32 pour un tournoi à élimination directe');
        }
      }
      
      if (formData.type === 'poule_elimination') {
        const validNumbers = [4, 8, 16, 32];
        if (!validNumbers.includes(parseInt(formData.nombreEquipes))) {
          throw new Error('Le nombre d\'équipes doit être 4, 8, 16 ou 32 pour une compétition avec phase de poules + élimination');
        }
      }

      // Définir automatiquement la limite d'inscriptions basée sur le nombre d'équipes
      const competitionData = {
        ...formData,
        limiteInscriptions: parseInt(formData.nombreEquipes)
      };

      const competition = await competitionAPI.createCompetition(competitionData, user.token);
      
      alert('Compétition créée avec succès !');
      navigate(`/competition/${competition._id}`);
    } catch (error) {
      console.error('Erreur création compétition:', error);
      setError(error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const getModeMatchDescription = (mode) => {
    const descriptions = {
      simple: 'Match unique entre les équipes',
      aller_retour: 'Match aller et retour entre les équipes'
    };
    return descriptions[mode] || '';
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      elimination_directe: 'Tournoi avec arbre direct (byes gérés si nécessaire)',
      poule_elimination: 'Phase de poules (4 équipes max) puis arbre final pour les qualifiés',
      championnat: 'Championnat linéaire classique sous forme de poule unique'
    };
    return descriptions[type] || '';
  };

  return (
    <div className="container py-4 px-4 px-md-5 animate-fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="gaming-header">
            <h2 className="gaming-title mb-2">
              <i className="fas fa-plus-circle text-gradient me-2"></i>
              Créer une compétition
            </h2>
            <p className="gaming-subtitle">Configurez les dates, la dotation et lancez le tournoi</p>
          </div>

          <div className="card">
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Informations de base */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h4 className="text-primary mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Informations de base
                    </h4>
                  </div>
                  
                  {/* Nom de la compétition */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Nom de la compétition *</strong>
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      placeholder="Ex: Coupe de France 2024"
                    />
                  </div>

                  {/* Sélecteur de type */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Type de compétition *</strong>
                    </label>
                    <select
                      className="form-select bg-dark border-secondary text-white"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="elimination_directe">⚽ Tournoi à élimination directe</option>
                      <option value="poule_elimination">🔁 Phase de poules + élimination</option>
                      <option value="championnat">🏅 Championnat</option>
                    </select>
                    <small className="form-text text-muted">
                      {getTypeDescription(formData.type)}
                    </small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Mode de match</strong>
                    </label>
                    <select
                      className="form-select"
                      name="modeMatch"
                      value={formData.modeMatch}
                      onChange={handleInputChange}
                    >
                      <option value="simple">Match simple</option>
                      <option value="aller_retour">Aller-retour</option>
                    </select>
                    <small className="form-text text-muted">
                      {getModeMatchDescription(formData.modeMatch)}
                    </small>
                  </div>

                  {/* Nombre d'équipes */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Nombre d'équipes *</strong>
                    </label>
                    <select
                      className="form-select"
                      name="nombreEquipes"
                      value={formData.nombreEquipes}
                      onChange={handleInputChange}
                      required
                    >
                      {formData.type === 'elimination_directe' && (
                        <>
                          <option value="2">2 équipes</option>
                          <option value="4">4 équipes</option>
                          <option value="8">8 équipes</option>
                          <option value="16">16 équipes</option>
                          <option value="32">32 équipes</option>
                        </>
                      )}
                      {formData.type === 'poule_elimination' && (
                        <>
                          <option value="4">4 équipes</option>
                          <option value="8">8 équipes</option>
                          <option value="16">16 équipes</option>
                          <option value="32">32 équipes</option>
                        </>
                      )}
                      {formData.type === 'championnat' && (
                        <>
                          <option value="4">4 équipes</option>
                          <option value="6">6 équipes</option>
                          <option value="8">8 équipes</option>
                          <option value="10">10 équipes</option>
                          <option value="12">12 équipes</option>
                          <option value="14">14 équipes</option>
                          <option value="16">16 équipes</option>
                          <option value="18">18 équipes</option>
                          <option value="20">20 équipes</option>
                        </>
                      )}
                    </select>
                    {formData.type === 'elimination_directe' && (
                      <small className="form-text text-info">
                        <i className="fas fa-info-circle me-1"></i>
                        Format élimination directe : 2, 4, 8, 16 ou 32 équipes
                      </small>
                    )}
                    {formData.type === 'poule_elimination' && (
                      <small className="form-text text-info">
                        <i className="fas fa-info-circle me-1"></i>
                        Format poules + élimination : 4, 8, 16 ou 32 équipes
                      </small>
                    )}
                    {formData.type === 'championnat' && (
                      <small className="form-text text-info">
                        <i className="fas fa-info-circle me-1"></i>
                        Format championnat : 4 à 20 équipes (nombre pair recommandé)
                      </small>
                    )}
                  </div>

                  {/* Choix plateforme masqué
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Plateforme</strong>
                    </label>
                    <select
                      className="form-select"
                      name="plateforme"
                      value={formData.plateforme}
                      onChange={handleInputChange}
                    >
                      <option value="PS5">PlayStation 5</option>
                      <option value="PS4">PlayStation 4</option>
                      <option value="Xbox">Xbox</option>
                      <option value="PC">PC</option>
                      <option value="Cross-Platform">Cross-Platform</option>
                    </select>
                  </div>
                  */}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Visibilité</strong>
                    </label>
                    <select
                      className="form-select"
                      name="visibilite"
                      value={formData.visibilite}
                      onChange={handleInputChange}
                    >
                      <option value="publique">Publique</option>
                      <option value="privée">Privée</option>
                    </select>
                  </div>
                </div>

                {/* Configuration des équipes */}
                {formData.type === 'poule_elimination' && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4 className="text-primary mb-3">
                        <i className="fas fa-users me-2"></i>
                        Configuration des poules
                      </h4>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <strong>Équipes par poule</strong>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="nombreEquipesParPoule"
                        value={formData.nombreEquipesParPoule}
                        onChange={handleInputChange}
                        min="2"
                        max="8"
                      />
                    </div>
                  </div>
                )}

                {/* Calendrier */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h4 className="text-primary mb-3">
                      <i className="fas fa-calendar me-2"></i>
                      Calendrier
                    </h4>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      <strong>Date et heure de début *</strong>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark-navbar text-primary border-glass" style={{ borderRight: 'none' }}>
                        <i className="fas fa-calendar-alt text-gradient"></i>
                      </span>
                      <input
                        type="datetime-local"
                        className="form-control border-glass ps-1"
                        name="dateDebut"
                        value={formData.dateDebut}
                        onChange={handleInputChange}
                        required
                        style={{ borderLeft: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tarification & Cashprize */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h4 className="text-primary mb-3">
                      <i className="fas fa-hand-holding-usd me-2"></i>
                      Tarification & Cashprize
                    </h4>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Type d'inscription *</strong>
                    </label>
                    <select
                      className="form-select"
                      name="inscriptionGratuite"
                      value={formData.inscriptionGratuite ? "true" : "false"}
                      onChange={(e) => {
                        const val = e.target.value === "true";
                        setFormData({
                          ...formData,
                          inscriptionGratuite: val,
                          montantInscription: val ? 0 : formData.montantInscription,
                          cashprizeFinal: formData.cashprizeFinal
                        });
                      }}
                    >
                      <option value="true">🆓 Gratuite</option>
                      <option value="false">💳 Payante</option>
                    </select>
                  </div>

                  {formData.inscriptionGratuite ? (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <strong>Cashprize (€) *</strong>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="cashprizeFinal"
                        value={formData.cashprizeFinal}
                        onChange={(e) => setFormData({ ...formData, cashprizeFinal: Number(e.target.value) })}
                        min="0"
                        required
                      />
                      <small className="form-text text-muted">
                        Somme fixe offerte au vainqueur de la compétition.
                      </small>
                    </div>
                  ) : (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <strong>Montant d'inscription (€) *</strong>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="montantInscription"
                          value={formData.montantInscription}
                          onChange={(e) => setFormData({ ...formData, montantInscription: Number(e.target.value) })}
                          min="1"
                          step="0.01"
                          required
                        />
                        <small className="form-text text-muted">
                          Frais d'inscription par équipe participante.
                        </small>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <strong>Cashprize (€) *</strong>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="cashprizeFinal"
                          value={formData.cashprizeFinal}
                          onChange={(e) => setFormData({ ...formData, cashprizeFinal: Number(e.target.value) })}
                          min="0"
                          required
                        />
                        <small className="form-text text-muted">
                          Somme fixe offerte au vainqueur de la compétition.
                        </small>
                      </div>
                    </>
                  )}
                </div>

                {/* Inscriptions */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h4 className="text-primary mb-3">
                      <i className="fas fa-user-plus me-2"></i>
                      Inscriptions
                    </h4>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      <strong>Mode d'inscription</strong>
                    </label>
                    <select
                      className="form-select"
                      name="modeInscription"
                      value={formData.modeInscription}
                      onChange={handleInputChange}
                    >
                      <option value="libre">Libre - Ouvert à tous</option>
                      <option value="sur_invitation">Sur invitation uniquement</option>
                      <option value="validation_requise">Validation requise par l'organisateur</option>
                    </select>
                  </div>


                </div>

                {/* Description */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h4 className="text-primary mb-3">
                      <i className="fas fa-file-text me-2"></i>
                      Description
                    </h4>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      <strong>Description</strong>
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      maxLength={2000}
                      placeholder="Décrivez votre compétition..."
                    />
                  </div>
                </div>

                {/* Boutons */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100 w-md-auto px-4 py-2"
                        onClick={() => navigate('/competitions')}
                        disabled={loading}
                      >
                        <i className="fas fa-times me-2"></i>
                        Annuler
                      </button>
                      
                      <button
                        type="submit"
                        className="btn btn-primary w-100 w-md-auto px-4 py-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Création...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus me-2"></i>
                            Créer la compétition
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCompetitionPage; 