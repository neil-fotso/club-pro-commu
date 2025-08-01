import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI } from '../services/api';

const CreateCompetitionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nom: '',
    type: 'elimination_directe',
    modeMatch: 'simple',
    description: '',
    reglement: '',
    dateDebut: '',
    dateFin: '',
    nombreEquipes: 8,
    nombreEquipesParPoule: 4,

    plateforme: 'PS5',
    visibilite: 'publique',
    modeInscription: 'libre',
    limiteInscriptions: 8,
    lienDiscord: '',
    zoneHoraire: 'Europe/Paris',
    notifications: {
      rappelMatch: true,
      delaiRappel: 24
    },
    recompenses: {
      champion: '🏆 Champion',
      finaliste: '🥈 Finaliste',
      troisieme: '🥉 3ème place',
      meilleurJoueur: '🎖️ Meilleur joueur',
      meilleurButeur: '🎯 Meilleur buteur'
    }
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
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
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

      // Validation du nombre d'équipes pour élimination directe
      if (formData.type === 'elimination_directe') {
        const isValidPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;
        if (!isValidPowerOfTwo(formData.nombreEquipes)) {
          throw new Error('Le nombre d\'équipes doit être une puissance de 2 pour un tournoi à élimination directe (2, 4, 8, 16, 32, 64, 128)');
        }
      }

      const competition = await competitionAPI.createCompetition(formData, user.token);
      
      alert('Compétition créée avec succès !');
      navigate(`/competitions/${competition._id}`);
    } catch (error) {
      console.error('Erreur création compétition:', error);
      setError(error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      elimination_directe: '⚽ Tournoi à élimination directe - Les équipes s\'affrontent en matchs uniques jusqu\'à la finale',
      poule_elimination: '🔁 Phase de poules + élimination - Les équipes sont réparties en groupes, puis élimination directe',
      championnat: '🏅 Championnat - Classement par points avec matchs aller-retour'
    };
    return descriptions[type] || '';
  };

  const getModeMatchDescription = (mode) => {
    const descriptions = {
      simple: 'Match unique entre les équipes',
      aller_retour: 'Match aller et retour entre les équipes'
    };
    return descriptions[mode] || '';
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">
                <i className="fas fa-trophy me-2"></i>
                Créer une nouvelle compétition
              </h2>
            </div>
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
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Nom de la compétition *</strong>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      placeholder="Ex: Coupe de France 2024"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Type de compétition *</strong>
                    </label>
                    <select
                      className="form-select"
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Nombre d'équipes *</strong>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="nombreEquipes"
                      value={formData.nombreEquipes}
                      onChange={handleInputChange}
                      required
                      min="2"
                      max="128"
                    />
                    {formData.type === 'elimination_directe' && (
                      <small className="form-text text-warning">
                        ⚠️ Doit être une puissance de 2 (2, 4, 8, 16, 32, 64, 128)
                      </small>
                    )}
                  </div>

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
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Date de début *</strong>
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Date de fin</strong>
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Zone horaire</strong>
                    </label>
                    <select
                      className="form-select"
                      name="zoneHoraire"
                      value={formData.zoneHoraire}
                      onChange={handleInputChange}
                    >
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>
                </div>

                {/* Inscriptions */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h4 className="text-primary mb-3">
                      <i className="fas fa-user-plus me-2"></i>
                      Inscriptions
                    </h4>
                  </div>
                  
                  <div className="col-md-6 mb-3">
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Limite d'inscriptions</strong>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="limiteInscriptions"
                      value={formData.limiteInscriptions}
                      onChange={handleInputChange}
                      min="2"
                      max="128"
                    />
                  </div>

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

                {/* Description et règlement */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h4 className="text-primary mb-3">
                      <i className="fas fa-file-text me-2"></i>
                      Description et règlement
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

                  <div className="col-12 mb-3">
                    <label className="form-label">
                      <strong>Règlement</strong>
                    </label>
                    <textarea
                      className="form-control"
                      name="reglement"
                      value={formData.reglement}
                      onChange={handleInputChange}
                      rows="6"
                      maxLength={5000}
                      placeholder="Règlement de la compétition..."
                    />
                  </div>
                </div>

                {/* Liens et notifications */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h4 className="text-primary mb-3">
                      <i className="fas fa-link me-2"></i>
                      Liens et notifications
                    </h4>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Lien Discord (optionnel)</strong>
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      name="lienDiscord"
                      value={formData.lienDiscord}
                      onChange={handleInputChange}
                      placeholder="https://discord.gg/..."
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <strong>Délai de rappel (heures)</strong>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="notifications.delaiRappel"
                      value={formData.notifications.delaiRappel}
                      onChange={handleInputChange}
                      min="1"
                      max="168"
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="notifications.rappelMatch"
                        checked={formData.notifications.rappelMatch}
                        onChange={handleInputChange}
                        id="rappelMatch"
                      />
                      <label className="form-check-label" htmlFor="rappelMatch">
                        <strong>Activer les rappels de match</strong>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="row">
                  <div className="col-12 text-center">
                    <button
                      type="button"
                      className="btn btn-secondary me-3"
                      onClick={() => navigate('/competitions')}
                      disabled={loading}
                    >
                      <i className="fas fa-times me-2"></i>
                      Annuler
                    </button>
                    
                    <button
                      type="submit"
                      className="btn btn-primary"
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCompetitionPage; 