import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playerAPI } from '../services/api';
import { getAllCountries, getCountryDisplay } from '../utils/countryUtils';
import { getAllPositions, getPositionDisplay } from '../utils/positionUtils';

// Liste des langues disponibles
const availableLanguages = [
  'Français',
  'Anglais',
  'Espagnol',
  'Allemand',
  'Italien',
  'Portugais',
  'Néerlandais',
  'Suédois',
  'Norvégien',
  'Danois',
  'Finnois',
  'Polonais',
  'Tchèque',
  'Slovaque',
  'Hongrois',
  'Roumain',
  'Bulgare',
  'Grec',
  'Turc',
  'Russe',
  'Ukrainien',
  'Biélorusse',
  'Serbe',
  'Croate',
  'Bosniaque',
  'Monténégrin',
  'Macédonien',
  'Albanais',
  'Estonien',
  'Letton',
  'Lituanien',
  'Arabe',
  'Hébreu',
  'Persan',
  'Hindi',
  'Bengali',
  'Ourdou',
  'Chinois',
  'Japonais',
  'Coréen',
  'Thaï',
  'Vietnamien',
  'Indonésien',
  'Malais',
  'Tagalog',
  'Swahili',
  'Zoulou',
  'Afrikaans',
  'Autre'
];

export default function MyProfilePage() {
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      loadMyProfile();
    }
  }, [user]);

  const loadMyProfile = async () => {
    try {
      setLoading(true);
      const data = await playerAPI.getMyProfile();
      setPlayer(data);
      setFormData({
        postePrincipal: data.postePrincipal || '',
        postesSecondaires: data.postesSecondaires || [],
        age: data.age || '',
        pays: data.pays || '',
        bio: data.bio || '',
        rechercheClub: data.rechercheClub !== undefined ? data.rechercheClub : true,
        langues: data.langues || ['Français']
      });
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error('Erreur chargement profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Début mise à jour profil...');
      console.log('🔄 Données du formulaire:', formData);
      
      // Préparer les données en s'assurant qu'elles sont correctement formatées
      const updateData = {
        ...formData,
        // S'assurer que les champs optionnels sont bien gérés
        age: formData.age ? parseInt(formData.age) : undefined,
        pays: formData.pays || undefined,
        postePrincipal: formData.postePrincipal || undefined,
        postesSecondaires: Array.isArray(formData.postesSecondaires) ? formData.postesSecondaires : [],
        langues: Array.isArray(formData.langues) ? formData.langues : [],
        bio: formData.bio || undefined
      };

      console.log('📤 Données envoyées au backend:', updateData);
      console.log('🆔 ID du joueur:', player._id);
      
      const updatedPlayer = await playerAPI.updatePlayer(player._id, updateData);
      console.log('✅ Réponse du backend:', updatedPlayer);
      
      setPlayer(updatedPlayer);
      setEditing(false);
      alert('Profil mis à jour avec succès !');
      
      // Recharger le profil pour s'assurer que tout est à jour
      await loadMyProfile();
    } catch (err) {
      console.error('❌ Erreur mise à jour:', err);
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };





  const getAvailabilityBadge = (availability) => {
    const badges = {
      'Disponible': 'bg-success',
      'Indisponible': 'bg-danger'
    };
    return badges[availability] || 'bg-secondary';
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Connexion requise</h4>
          <p>Vous devez être connecté pour voir votre profil.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Erreur</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Colonne principale */}
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white d-flex justify-content-between align-items-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h2 className="mb-0">
                <i className="fas fa-user-circle me-2"></i>
                Mon Profil Joueur
              </h2>
              <button 
                className="btn btn-light btn-sm"
                onClick={() => setEditing(!editing)}
              >
                <i className={`fas ${editing ? 'fa-times' : 'fa-edit'} me-1`}></i>
                {editing ? 'Annuler' : 'Modifier'}
              </button>
            </div>
            
            <div className="card-body p-4">
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-futbol me-1"></i>
                        Poste principal *
                      </label>
                      <select
                        className="form-select form-select-lg"
                        name="postePrincipal"
                        value={formData.postePrincipal}
                        onChange={handleChange}
                        required
                      >
                        {getAllPositions().map(position => (
                          <option key={position.code} value={position.code}>
                            {position.icon} {position.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-birthday-cake me-1"></i>
                        Âge (optionnel)
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="16"
                        max="100"
                        placeholder="Votre âge"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-flag me-1"></i>
                        Nationalité (optionnel)
                      </label>
                      <select
                        className="form-select form-select-lg"
                        name="pays"
                        value={formData.pays}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionnez votre nationalité</option>
                        {getAllCountries().map(country => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-futbol me-1"></i>
                        Postes secondaires (optionnel)
                      </label>
                      <select
                        className="form-select form-select-lg"
                        name="postesSecondaires"
                        value={formData.postesSecondaires}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData(prev => ({
                            ...prev,
                            postesSecondaires: selectedOptions
                          }));
                        }}
                        multiple
                        size="3"
                      >
                        {getAllPositions().map(position => (
                          <option key={position.code} value={position.code}>
                            {position.icon} {position.name}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs postes</small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-search me-1"></i>
                        Recherche un club
                      </label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="rechercheClub"
                          checked={formData.rechercheClub}
                          onChange={handleChange}
                          id="rechercheClub"
                        />
                        <label className="form-check-label" htmlFor="rechercheClub">
                          {formData.rechercheClub ? 'Oui' : 'Non'}
                        </label>
                      </div>
                      <small className="text-muted">
                        La disponibilité sera automatiquement mise à jour selon votre statut de recherche et d'appartenance à un club
                      </small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-comment me-1"></i>
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Parlez-nous de vous, de votre style de jeu, de vos objectifs..."
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-language me-1"></i>
                      Langues parlées
                    </label>
                    <select
                      className="form-select form-select-lg"
                      name="langues"
                      value={formData.langues}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData(prev => ({
                          ...prev,
                          langues: selectedOptions
                        }));
                      }}
                      multiple
                      size="4"
                    >
                      {availableLanguages.map(langue => (
                        <option key={langue} value={langue}>
                          {langue}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs langues</small>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="button" className="btn btn-secondary me-md-2" onClick={() => setEditing(false)}>
                      <i className="fas fa-times me-1"></i>
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Sauvegarder
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row">
                  <div className="col-md-6">
                    <h5 className="text-primary mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Informations générales
                    </h5>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <strong>Pseudo:</strong> 
                        <span className="text-muted ms-2">{player.pseudo}</span>
                      </li>
                      <li className="mb-2">
                        <strong>Âge:</strong> 
                        <span className="text-muted ms-2">
                          {player.age ? `${player.age} ans` : 'Non renseigné'}
                        </span>
                      </li>
                      <li className="mb-2">
                        <strong>Nationalité:</strong> 
                        <span className="text-muted ms-2">
                          {player.pays ? getCountryDisplay(player.pays) : 'Non renseignée'}
                        </span>
                      </li>
                      <li className="mb-2">
                        <strong>Plateforme:</strong> 
                        <span className="text-muted ms-2">{player.plateforme}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="col-md-6">
                    <h5 className="text-primary mb-3">
                      <i className="fas fa-futbol me-2"></i>
                      Postes & Disponibilité
                    </h5>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <strong>Poste principal:</strong> 
                        <span className="badge bg-primary ms-2">
                          {player.postePrincipal ? getPositionDisplay(player.postePrincipal) : 'Non renseigné'}
                        </span>
                      </li>
                      {player.postesSecondaires && player.postesSecondaires.length > 0 && (
                        <li className="mb-2">
                          <strong>Postes secondaires:</strong> 
                          <div className="mt-1">
                            {player.postesSecondaires.map((poste, index) => (
                              <span key={index} className="badge bg-secondary me-1">
                                {getPositionDisplay(poste)}
                              </span>
                            ))}
                          </div>
                        </li>
                      )}
                      <li className="mb-2">
                        <strong>Disponibilité:</strong> 
                        <span className={`badge ${getAvailabilityBadge(player.disponibilite)} ms-2`}>
                          {player.disponibilite ? player.disponibilite : 'Non renseigné'}
                        </span>
                      </li>
                      <li className="mb-2">
                        <strong>Recherche un club:</strong> 
                        {player.rechercheClub !== undefined ? (
                          player.rechercheClub ? (
                            <span className="badge bg-success ms-2">✅ Oui</span>
                          ) : (
                            <span className="badge bg-secondary ms-2">❌ Non</span>
                          )
                        ) : (
                          <span className="badge bg-secondary ms-2">Non renseigné</span>
                        )}
                      </li>
                    </ul>
                  </div>
                  
                  <div className="col-12 mt-4">
                    <h5 className="text-primary mb-3">
                      <i className="fas fa-comment me-2"></i>
                      Description
                    </h5>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p className="mb-0">
                          {player.bio ? player.bio : 'Aucune description renseignée'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-12 mt-4">
                    <h5 className="text-primary mb-3">
                      <i className="fas fa-language me-2"></i>
                      Langues parlées
                    </h5>
                    <div>
                      {player.langues && player.langues.length > 0 ? (
                        player.langues.map((langue, index) => (
                          <span key={index} className="badge bg-info me-2">
                            {langue}
                          </span>
                        ))
                      ) : (
                        <span className="badge bg-secondary">Aucune langue renseignée</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Palmarès & Trophées */}
          <div className="card shadow-lg border-0 mt-4">
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
              <h4 className="mb-0">
                <i className="fas fa-award me-2"></i>
                Mon Palmarès & Trophées
              </h4>
            </div>
            <div className="card-body p-4">
              {(!player.palmares || ((!player.palmares.clubs || player.palmares.clubs.length === 0) && (!player.palmares.individuel || player.palmares.individuel.length === 0))) ? (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-medal fa-3x mb-3 text-secondary opacity-50"></i>
                  <p className="mb-0">Aucun trophée ou distinction individuelle enregistré pour le moment. Jouez des matchs de tournois pour remplir votre palmarès ! 🌟</p>
                </div>
              ) : (
                <div>
                  {/* Trophées de clubs */}
                  {player.palmares.clubs && player.palmares.clubs.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-primary mb-3"><i className="fas fa-shield-alt me-2 text-warning"></i>Trophées Collectifs (Clubs)</h5>
                      <div className="row g-3">
                        {player.palmares.clubs.map((trophy, idx) => (
                          <div key={idx} className="col-md-6 col-12">
                            <div className="d-flex align-items-center p-3 border rounded bg-light">
                              <span className="fs-1 me-3">
                                {trophy.typeTrophée === 'vainqueur' ? '🏆' : trophy.typeTrophée === 'finaliste' ? '🥈' : '🥉'}
                              </span>
                              <div>
                                <h6 className="mb-1 fw-bold text-dark">{trophy.nom}</h6>
                                <small className="text-muted d-block">
                                  Avec <strong>{trophy.clubNom}</strong> • <span className="text-capitalize">{trophy.typeTrophée}</span>
                                </small>
                                <small className="text-muted text-capitalize small">{trophy.type}</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Récompenses Individuelles */}
                  {player.palmares.individuel && player.palmares.individuel.length > 0 && (
                    <div>
                      <h5 className="text-primary mb-3"><i className="fas fa-star me-2 text-warning"></i>Distinctions Individuelles</h5>
                      <div className="row g-3">
                        {player.palmares.individuel.map((award, idx) => (
                          <div key={idx} className="col-12">
                            <div className="d-flex align-items-center p-3 border border-warning border-opacity-25 rounded bg-warning bg-opacity-10">
                              <span className="fs-1 me-3">
                                {award.nom.includes('Soulier') ? '⚽' : award.nom.includes('Passeur') ? '🅰️' : '🌟'}
                              </span>
                              <div>
                                <h6 className="mb-1 fw-bold text-dark">{award.nom}</h6>
                                <p className="mb-0 text-muted small">{award.description}</p>
                                <small className="text-muted small mt-1 d-block">
                                  Obtenu le {award.date ? new Date(award.date).toLocaleDateString('fr-FR') : ''}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar avec statistiques */}
        <div className="col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Statistiques
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6">
                  <div className="stat-item">
                    <h3 className="text-primary mb-0">{player.experience || 0}</h3>
                    <small className="text-muted">Matchs joués</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-item">
                    <h3 className="text-success mb-0">
                      {player.age ? player.age : 'N/A'}
                    </h3>
                    <small className="text-muted">Âge</small>
                  </div>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 