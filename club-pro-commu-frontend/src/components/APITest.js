import React, { useState } from 'react';
import { debugAPI } from '../utils/debug';

const APITest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = {};

    try {
      // Test 1: Connexion API
      console.log('🧪 Test 1: Connexion API');
      testResults.connection = await debugAPI.testConnection();
      
      // Test 2: Authentification
      console.log('🧪 Test 2: Authentification');
      testResults.auth = await debugAPI.testAuth();
      
      // Test 3: Recherche joueurs
      console.log('🧪 Test 3: Recherche joueurs');
      testResults.players = await debugAPI.testPlayerSearch();
      
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
      testResults.error = error.message;
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-bug me-2"></i>
          Test de connexion API
        </h5>
      </div>
      <div className="card-body">
        <button 
          className="btn btn-primary mb-3"
          onClick={runTests}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Tests en cours...
            </>
          ) : (
            <>
              <i className="fas fa-play me-2"></i>
              Lancer les tests
            </>
          )}
        </button>

        {Object.keys(results).length > 0 && (
          <div className="mt-3">
            <h6>Résultats des tests :</h6>
            {Object.entries(results).map(([test, result]) => (
              <div key={test} className="mb-2">
                <strong>{test}:</strong>
                <div className="ms-3">
                  {result.success ? (
                    <span className="text-success">
                      <i className="fas fa-check me-1"></i>
                      Succès
                    </span>
                  ) : (
                    <span className="text-danger">
                      <i className="fas fa-times me-1"></i>
                      Échec: {result.error || result.message}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default APITest; 