import React, { useState } from 'react';
import { authAPI } from '../services/api';

export default function APITest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    addResult('🔍 Début des tests de connexion...', 'info');

    try {
      // Test 1: Vérifier la configuration de l'API
      addResult('1️⃣ Test de la configuration API...', 'info');
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://club-pro-commu.onrender.com/api'
        : 'http://localhost:3001/api';
      addResult(`URL API: ${apiUrl}`, 'success');

      // Test 2: Test de connectivité
      addResult('2️⃣ Test de connectivité...', 'info');
      try {
        const response = await fetch(`${apiUrl}/auth/me`);
        addResult(`✅ API accessible (status: ${response.status})`, 'success');
      } catch (error) {
        addResult(`❌ Erreur de connectivité: ${error.message}`, 'error');
      }

      // Test 3: Test de connexion
      addResult('3️⃣ Test de connexion...', 'info');
      try {
        await authAPI.login({
          emailOrPseudo: 'test@test.com',
          password: 'wrongpassword'
        });
        addResult('❌ Erreur attendue: Connexion échouée', 'error');
      } catch (error) {
        addResult(`✅ Test de connexion: ${error.message}`, 'success');
      }

      // Test 4: Vérifier le localStorage
      addResult('4️⃣ Test du localStorage...', 'info');
      const token = localStorage.getItem('token');
      if (token) {
        addResult(`✅ Token trouvé: ${token.substring(0, 20)}...`, 'success');
      } else {
        addResult('ℹ️ Aucun token stocké', 'info');
      }

      // Test 5: Test de l'environnement
      addResult('5️⃣ Test de l\'environnement...', 'info');
      addResult(`NODE_ENV: ${process.env.NODE_ENV}`, 'info');
      addResult(`User Agent: ${navigator.userAgent}`, 'info');

    } catch (error) {
      addResult(`❌ Erreur générale: ${error.message}`, 'error');
    }

    setLoading(false);
    addResult('✅ Tests terminés', 'success');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-bug me-2"></i>
            Test de Diagnostic API
          </h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <button 
              className="btn btn-primary me-2" 
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
            <button 
              className="btn btn-secondary" 
              onClick={clearResults}
            >
              <i className="fas fa-trash me-2"></i>
              Effacer les résultats
            </button>
          </div>

          <div className="results-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`alert alert-${result.type === 'error' ? 'danger' : result.type === 'success' ? 'success' : 'info'} mb-2`}
              >
                <small className="text-muted me-2">{result.timestamp}</small>
                {result.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 