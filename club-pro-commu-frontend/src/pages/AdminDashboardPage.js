import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [litiges, setLitiges] = useState([]);
  const [error, setError] = useState(null);

  // Configuration API
  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://club-pro-commu.onrender.com/api'
    : 'http://localhost:3001/api';

  // Fonction apiCall locale
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token utilisé:', token ? token.substring(0, 30) + '...' : 'Aucun token');
    
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const url = `${API_URL}${endpoint}`;
    console.log('🌐 Appel vers:', url);

    const response = await fetch(url, config);
    console.log('📡 Statut réponse:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Réponse reçue:', result);
    return result;
  };

  // Vérifier les droits administrateur
  useEffect(() => {
    if (!user?.isAdmin) {
      window.location.href = '/';
      return;
    }
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des données du dashboard...');
      console.log('👤 Utilisateur connecté:', user?.email, 'isAdmin:', user?.isAdmin);
      
      // Chargement des stats
      try {
        console.log('📊 Appel API stats...');
        const response = await apiCall('/admin/dashboard/stats', 'GET');
        console.log('📊 Réponse stats:', response);
        if (response && response.success) {
          setStats(response.data);
          console.log('✅ Stats chargées:', response.data);
        } else {
          console.warn('⚠️ Réponse stats invalide:', response);
        }
      } catch (error) {
        console.error('❌ Erreur stats:', error);
        setError('Erreur de chargement des statistiques: ' + error.message);
      }

      // Chargement des compétitions
      try {
        console.log('🏆 Appel API compétitions...');
        const response = await apiCall('/admin/dashboard/competitions', 'GET');
        console.log('🏆 Réponse compétitions:', response);
        if (response && response.success) {
          setCompetitions(response.data.competitions || []);
          console.log('✅ Compétitions chargées:', response.data.competitions?.length || 0);
        } else {
          console.warn('⚠️ Réponse compétitions invalide:', response);
        }
      } catch (error) {
        console.error('❌ Erreur compétitions:', error);
      }

      // Chargement des litiges
      try {
        console.log('⚖️ Appel API litiges...');
        const response = await apiCall('/admin/dashboard/litiges', 'GET');
        console.log('⚖️ Réponse litiges:', response);
        if (response && response.success) {
          setLitiges(response.data.litiges || []);
          console.log('✅ Litiges chargés:', response.data.litiges?.length || 0);
        } else {
          console.warn('⚠️ Réponse litiges invalide:', response);
        }
      } catch (error) {
        console.error('❌ Erreur litiges:', error);
      }

    } catch (error) {
      console.error('❌ Erreur lors du chargement du dashboard:', error);
      setError('Erreur générale: ' + error.message);
    } finally {
      setLoading(false);
      console.log('🏁 Chargement terminé');
    }
  };

  const handleCompetitionAction = async (competitionId, action, reason) => {
    try {
      const response = await apiCall(`/admin/dashboard/competition/${competitionId}/action`, 'POST', {
        action,
        reason
      });
      
      if (response.success) {
        alert(`Action ${action} effectuée avec succès`);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Erreur action:', error);
      alert('Erreur lors de l\'action: ' + error.message);
    }
  };

  // Fonction helper pour les badges de statut
  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case 'Brouillon': return 'bg-secondary';
      case 'Ouvert': return 'bg-success';
      case 'En cours': return 'bg-primary';
      case 'Terminé': return 'bg-info';
      case 'Archivé': return 'bg-dark';
      default: return 'bg-secondary';
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Accès refusé</h4>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement du dashboard administrateur...</p>
          {error && (
            <div className="alert alert-warning mt-3">
              <strong>Détails:</strong> {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar">
            <div className="sidebar-sticky">
              <h5 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                <span>🛠️ Administration</span>
              </h5>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    📊 Vue d'ensemble
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'competitions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('competitions')}
                  >
                    🏆 Compétitions ({competitions.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'litiges' ? 'active' : ''}`}
                    onClick={() => setActiveTab('litiges')}
                  >
                    ⚖️ Litiges {litiges.length > 0 && <span className="badge bg-danger">{litiges.length}</span>}
                  </button>
                </li>
              </ul>

              {/* Debug info */}
              <div className="px-3 mt-4">
                <small className="text-muted">
                  <strong>Debug Info:</strong><br/>
                  API: {API_URL}<br/>
                  Stats: {stats ? '✅' : '❌'}<br/>
                  Compets: {competitions.length}<br/>
                  Litiges: {litiges.length}<br/>
                  Token: {localStorage.getItem('token') ? '✅' : '❌'}
                </small>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Dashboard Administrateur</h1>
              <div className="btn-toolbar mb-2 mb-md-0">
                <button className="btn btn-sm btn-outline-secondary" onClick={loadDashboardData}>
                  🔄 Actualiser
                </button>
                <button 
                  className="btn btn-sm btn-outline-info ms-2" 
                  onClick={() => {
                    console.log('📋 État actuel:', { stats, competitions, litiges });
                    console.log('🔑 Token:', localStorage.getItem('token'));
                    console.log('👤 User:', user);
                  }}
                >
                  🐛 Debug
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger">
                <h5>❌ Erreur de chargement</h5>
                <p>{error}</p>
                <button className="btn btn-outline-secondary" onClick={loadDashboardData}>
                  Réessayer
                </button>
              </div>
            )}

            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                {stats ? (
                  <>
                    {/* Statistiques générales */}
                    <div className="row mb-4">
                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-primary shadow h-100 py-2">
                          <div className="card-body">
                            <div className="row no-gutters align-items-center">
                              <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                  Utilisateurs
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                  {stats.generales?.totalUsers || 0}
                                </div>
                                <small className="text-muted">
                                  {stats.generales?.activeUsers || 0} actifs (30j)
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-success shadow h-100 py-2">
                          <div className="card-body">
                            <div className="row no-gutters align-items-center">
                              <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                  Clubs
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                  {stats.generales?.totalClubs || 0}
                                </div>
                                <small className="text-muted">
                                  {stats.activiteRecente?.nouveauxClubs || 0} nouveaux (7j)
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-info shadow h-100 py-2">
                          <div className="card-body">
                            <div className="row no-gutters align-items-center">
                              <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                  Compétitions
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                  {stats.generales?.totalCompetitions || 0}
                                </div>
                                <small className="text-muted">
                                  {stats.activiteRecente?.nouvellesCompetitions || 0} nouvelles (7j)
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-warning shadow h-100 py-2">
                          <div className="card-body">
                            <div className="row no-gutters align-items-center">
                              <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                  Taux Completion
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                  {stats.matchs?.tauxCompletion || 0}%
                                </div>
                                <small className="text-muted">
                                  {stats.matchs?.matchsTermines || 0}/{stats.matchs?.totalMatchs || 0} matchs
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Répartitions */}
                    <div className="row mb-4">
                      <div className="col-lg-6">
                        <div className="card shadow mb-4">
                          <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Compétitions par statut</h6>
                          </div>
                          <div className="card-body">
                            {stats.repartitions?.competitionsParStatut ? 
                              Object.entries(stats.repartitions.competitionsParStatut).map(([statut, count]) => (
                                <div key={statut} className="d-flex justify-content-between align-items-center mb-2">
                                  <span>{statut}</span>
                                  <span className="badge bg-primary">{count}</span>
                                </div>
                              )) : 
                              <p className="text-muted">Aucune donnée de répartition</p>
                            }
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="card shadow mb-4">
                          <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Clubs par pays</h6>
                          </div>
                          <div className="card-body">
                            {stats.repartitions?.clubsParPays ? 
                              Object.entries(stats.repartitions.clubsParPays).map(([pays, count]) => (
                                <div key={pays} className="d-flex justify-content-between align-items-center mb-2">
                                  <span>{pays}</span>
                                  <span className="badge bg-success">{count}</span>
                                </div>
                              )) : 
                              <p className="text-muted">Aucune donnée de répartition</p>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-info">
                    <h4>📊 Données en cours de chargement...</h4>
                    <p>Les statistiques ne sont pas encore disponibles. Vérifiez la console pour plus de détails.</p>
                  </div>
                )}
              </div>
            )}

            {/* Gestion des compétitions */}
            {activeTab === 'competitions' && (
              <div className="competitions-tab">
                <h3>Gestion des Compétitions ({competitions.length})</h3>
                
                {competitions.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Type</th>
                          <th>Statut</th>
                          <th>Équipes</th>
                          <th>Créateur</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {competitions.map(comp => (
                          <tr key={comp._id}>
                            <td>
                              <strong>{comp.nom}</strong>
                              <br />
                              <small className="text-muted">{comp.description?.substring(0, 50)}...</small>
                            </td>
                            <td>
                              <span className="badge bg-info">{comp.type}</span>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(comp.statut)}`}>
                                {comp.statut}
                              </span>
                            </td>
                            <td>
                              {comp.statistiques?.nombreEquipes || comp.equipesInscrites?.length || 0}
                            </td>
                            <td>{comp.createurId?.pseudo || 'Inconnu'}</td>
                            <td>
                              <div className="btn-group-sm">
                                <button
                                  className="btn btn-info btn-sm me-1"
                                  onClick={() => handleCompetitionAction(comp._id, 'force_end', 'Fin forcée par admin')}
                                >
                                  🏁
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => {
                                    if (window.confirm('Supprimer cette compétition ?')) {
                                      handleCompetitionAction(comp._id, 'delete', 'Suppression admin');
                                    }
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <h4>🏆 Aucune compétition trouvée</h4>
                    <p>Les données de compétitions ne sont pas encore chargées ou il n'y en a aucune.</p>
                  </div>
                )}
              </div>
            )}

            {/* Gestion des litiges */}
            {activeTab === 'litiges' && (
              <div className="litiges-tab">
                <h3>Gestion des Litiges ({litiges.length})</h3>
                {litiges.length === 0 ? (
                  <div className="alert alert-success">
                    <h4>✅ Aucun litige en cours</h4>
                    <p>Toutes les compétitions se déroulent sans problème.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Compétition</th>
                          <th>Match</th>
                          <th>Type</th>
                          <th>Score actuel</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {litiges.map((litige, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{litige.competitionNom}</strong>
                            </td>
                            <td>
                              {litige.match.equipe1Nom} vs {litige.match.equipe2Nom}
                            </td>
                            <td>
                              <span className="badge bg-warning">
                                {litige.type === 'poule' ? litige.pouleNom : litige.phase}
                              </span>
                            </td>
                            <td>
                              {litige.match.score1 !== null ? 
                                `${litige.match.score1} - ${litige.match.score2}` : 
                                'Non joué'
                              }
                            </td>
                            <td>
                              <button className="btn btn-primary btn-sm">
                                🔍 Examiner
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 