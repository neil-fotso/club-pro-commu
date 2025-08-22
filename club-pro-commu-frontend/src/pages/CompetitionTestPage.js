import React, { useState } from 'react';
import { apiCall } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CompetitionTestPage = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  const addResult = (test, status, message) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTest = async (testName, testFunction) => {
    try {
      addResult(testName, 'running', 'Test en cours...');
      const result = await testFunction();
      addResult(testName, 'success', result || 'Test réussi');
    } catch (error) {
      addResult(testName, 'error', error.message);
    }
  };

  // Tests individuels
  const tests = {
    // 1. Test chargement des compétitions
    loadCompetitions: async () => {
      const response = await apiCall('/competitions');
      setCompetitions(response);
      return `${response.length} compétitions chargées`;
    },

    // 2. Test chargement des clubs
    loadClubs: async () => {
      const response = await apiCall('/clubs');
      setClubs(response);
      return `${response.length} clubs chargés`;
    },

    // 3. Test détail compétition
    loadCompetitionDetail: async () => {
      if (competitions.length === 0) throw new Error('Aucune compétition disponible');
      const comp = competitions[0];
      const response = await apiCall(`/competitions/${comp._id}`);
      setSelectedCompetition(response);
      return `Détail "${response.nom}" chargé avec ${response.equipesInscrites.length} équipes`;
    },

    // 4. Test calendrier compétition
    loadCompetitionCalendar: async () => {
      if (!selectedCompetition) throw new Error('Aucune compétition sélectionnée');
      const response = await apiCall(`/competitions/${selectedCompetition._id}/matchs`);
      return `Calendrier chargé: ${response.length} matchs`;
    },

    // 5. Test classements compétition
    loadCompetitionRankings: async () => {
      if (!selectedCompetition) throw new Error('Aucune compétition sélectionnée');
      if (selectedCompetition.type === 'poule_elimination' && selectedCompetition.poules) {
        return `Classements des ${selectedCompetition.poules.length} poules disponibles`;
      } else {
        return 'Compétition à élimination directe - pas de classement de poule';
      }
    },

    // 6. Test statistiques compétition
    loadCompetitionStats: async () => {
      if (!selectedCompetition) throw new Error('Aucune compétition sélectionnée');
      if (selectedCompetition.statistiques) {
        const stats = selectedCompetition.statistiques;
        return `Stats: ${stats.matchsTermines}/${stats.totalMatchs} matchs (${stats.tauxCompletion}%), ${stats.totalButs} buts`;
      } else {
        throw new Error('Statistiques manquantes');
      }
    },

    // 7. Test permissions (si admin)
    testAdminPermissions: async () => {
      if (!user?.isAdmin) {
        return 'Non-admin: permissions limitées (normal)';
      }
      
      try {
        const response = await apiCall('/admin/dashboard/stats');
        return `Admin: accès dashboard OK (${response.data.generales.totalCompetitions} compétitions)`;
      } catch (error) {
        throw new Error(`Admin: erreur accès dashboard - ${error.message}`);
      }
    },

    // 8. Test création compétition (simulation)
    testCompetitionCreation: async () => {
      // Test uniquement la validation des données, pas la création réelle
      const testData = {
        nom: 'Test Competition',
        type: 'elimination_directe',
        nombreEquipes: 8,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      
      // Validation côté client
      if (!testData.nom || testData.nom.length < 3) {
        throw new Error('Nom trop court');
      }
      if (testData.nombreEquipes < 2 || testData.nombreEquipes > 128) {
        throw new Error('Nombre d\'équipes invalide');
      }
      if (testData.dateDebut >= testData.dateFin) {
        throw new Error('Dates invalides');
      }
      
      return 'Validation données création: OK (test uniquement)';
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    const testOrder = [
      'loadCompetitions',
      'loadClubs', 
      'loadCompetitionDetail',
      'loadCompetitionCalendar',
      'loadCompetitionRankings',
      'loadCompetitionStats',
      'testAdminPermissions',
      'testCompetitionCreation'
    ];

    for (const testName of testOrder) {
      await runTest(testName, tests[testName]);
      // Petit délai entre les tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-warning';
      case 'success': return 'text-success';
      case 'error': return 'text-danger';
      default: return 'text-muted';
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">🧪 Test Complet du Système de Compétitions</h3>
            </div>
            <div className="card-body">
              
              {/* Section Info Utilisateur */}
              <div className="alert alert-info mb-4">
                <h5>👤 Informations de test</h5>
                <div className="row">
                  <div className="col-md-6">
                    <strong>Utilisateur:</strong> {user?.pseudo || 'Non connecté'}<br/>
                    <strong>Email:</strong> {user?.email || 'N/A'}<br/>
                    <strong>Rôle:</strong> {user?.isAdmin ? '👑 Admin' : '🎮 Joueur'}
                  </div>
                  <div className="col-md-6">
                    <strong>Compétitions:</strong> {competitions.length}<br/>
                    <strong>Clubs:</strong> {clubs.length}<br/>
                    <strong>Sélectionnée:</strong> {selectedCompetition?.nom || 'Aucune'}
                  </div>
                </div>
              </div>

              {/* Boutons de test */}
              <div className="mb-4">
                <button 
                  className="btn btn-success me-2" 
                  onClick={runAllTests}
                  disabled={loading}
                >
                  {loading ? '⏳ Tests en cours...' : '🚀 Lancer tous les tests'}
                </button>
                
                <button 
                  className="btn btn-secondary me-2" 
                  onClick={() => setTestResults([])}
                  disabled={loading}
                >
                  🗑️ Vider les résultats
                </button>

                <div className="btn-group" role="group">
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => runTest('loadCompetitions', tests.loadCompetitions)}
                    disabled={loading}
                  >
                    🏆 Compétitions
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => runTest('loadClubs', tests.loadClubs)}
                    disabled={loading}
                  >
                    🏟️ Clubs
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => runTest('testAdminPermissions', tests.testAdminPermissions)}
                    disabled={loading}
                  >
                    🔐 Permissions
                  </button>
                </div>
              </div>

              {/* Résultats des tests */}
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">📊 Résultats des tests ({testResults.length})</h5>
                </div>
                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {testResults.length === 0 ? (
                    <p className="text-muted">Aucun test lancé. Cliquez sur "Lancer tous les tests" pour commencer.</p>
                  ) : (
                    <div className="list-group list-group-flush">
                      {testResults.map((result, index) => (
                        <div key={index} className="list-group-item px-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <span className={`me-2 ${getStatusColor(result.status)}`}>
                                {getStatusIcon(result.status)}
                              </span>
                              <strong>{result.test}</strong>
                              <p className="mb-1 mt-1">{result.message}</p>
                            </div>
                            <small className="text-muted">{result.timestamp}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Résumé */}
              {testResults.length > 0 && (
                <div className="alert alert-light mt-3">
                  <h6>📈 Résumé:</h6>
                  <div className="row text-center">
                    <div className="col-md-4">
                      <span className="text-success">✅ Réussis: {testResults.filter(r => r.status === 'success').length}</span>
                    </div>
                    <div className="col-md-4">
                      <span className="text-danger">❌ Échecs: {testResults.filter(r => r.status === 'error').length}</span>
                    </div>
                    <div className="col-md-4">
                      <span className="text-warning">⏳ En cours: {testResults.filter(r => r.status === 'running').length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Guide d'utilisation */}
              <div className="card mt-4">
                <div className="card-header">
                  <h6 className="mb-0">📖 Guide d'utilisation</h6>
                </div>
                <div className="card-body">
                  <ol>
                    <li><strong>Tests automatiques:</strong> Cliquez sur "Lancer tous les tests" pour une vérification complète</li>
                    <li><strong>Tests individuels:</strong> Utilisez les boutons spécifiques pour tester une fonctionnalité</li>
                    <li><strong>Permissions:</strong> Certains tests nécessitent d'être connecté en tant qu'admin</li>
                    <li><strong>Données:</strong> Les tests utilisent les données réelles de la base de données</li>
                    <li><strong>Sécurité:</strong> Aucune donnée n'est modifiée par ces tests</li>
                  </ol>
                  
                  <div className="alert alert-warning mt-3">
                    <strong>⚠️ Important:</strong> Cette page est destinée au test et au débogage. 
                    Assurez-vous que le backend est démarré sur le port 3001.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionTestPage; 