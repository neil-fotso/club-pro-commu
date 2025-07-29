import React, { useState } from 'react';

export default function APITest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      
      if (response.ok) {
        addResult('Connexion Backend', true, 'Backend accessible', data);
      } else {
        addResult('Connexion Backend', false, `Erreur ${response.status}: ${data.message}`);
      }
    } catch (error) {
      addResult('Connexion Backend', false, `Erreur réseau: ${error.message}`);
    }
    setLoading(false);
  };

  const testLoginAPI = async () => {
    setLoading(true);
    try {
      const testCredentials = {
        email: 'test@example.com',
        password: 'testpassword'
      };
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCredentials)
      });
      
      const data = await response.json();
      
      if (response.status === 401) {
        addResult('API Login', true, 'API fonctionnelle - Identifiants invalides (normal)', data);
      } else if (response.ok) {
        addResult('API Login', true, 'Connexion réussie avec test', data);
      } else {
        addResult('API Login', false, `Erreur ${response.status}: ${data.message}`, data);
      }
    } catch (error) {
      addResult('API Login', false, `Erreur réseau: ${error.message}`);
    }
    setLoading(false);
  };

  const testRegisterAPI = async () => {
    setLoading(true);
    try {
      const testUser = {
        pseudo: 'testuser',
        pseudoPlateforme: 'testuser',
        email: 'test@example.com',
        password: 'testpassword123',
        plateforme: 'PS5',
        postePrincipal: 'BU',
        age: '25',
        pays: 'France'
      };
      
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      });
      
      const data = await response.json();
      
      if (response.status === 400 && data.message.includes('existe déjà')) {
        addResult('API Register', true, 'API fonctionnelle - Utilisateur existe déjà (normal)', data);
      } else if (response.ok) {
        addResult('API Register', true, 'Inscription réussie', data);
      } else {
        addResult('API Register', false, `Erreur ${response.status}: ${data.message}`, data);
      }
    } catch (error) {
      addResult('API Register', false, `Erreur réseau: ${error.message}`);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="fas fa-bug me-2"></i>
                Tests API - Diagnostic Connexion
              </h3>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5>Tests disponibles :</h5>
                <div className="d-flex gap-2 flex-wrap">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={testBackendConnection}
                    disabled={loading}
                  >
                    <i className="fas fa-server me-2"></i>
                    Test Backend
                  </button>
                  <button 
                    className="btn btn-outline-success"
                    onClick={testLoginAPI}
                    disabled={loading}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Test Login API
                  </button>
                  <button 
                    className="btn btn-outline-info"
                    onClick={testRegisterAPI}
                    disabled={loading}
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Test Register API
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={clearResults}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Effacer
                  </button>
                </div>
              </div>

              {loading && (
                <div className="alert alert-info">
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Test en cours...
                </div>
              )}

              {testResults.length > 0 && (
                <div className="mt-4">
                  <h5>Résultats des tests :</h5>
                  <div className="list-group">
                    {testResults.map((result, index) => (
                      <div 
                        key={index} 
                        className={`list-group-item list-group-item-${result.success ? 'success' : 'danger'}`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">
                              <i className={`fas fa-${result.success ? 'check' : 'times'} me-2`}></i>
                              {result.test}
                            </h6>
                            <p className="mb-1">{result.message}</p>
                            {result.data && (
                              <small className="text-muted">
                                Données: {JSON.stringify(result.data)}
                              </small>
                            )}
                          </div>
                          <small className="text-muted">{result.timestamp}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h5>Informations de débogage :</h5>
                <div className="alert alert-light">
                  <strong>URL API :</strong> http://localhost:3001/api<br/>
                  <strong>Backend URL :</strong> http://localhost:3001/api<br/>
                  <strong>Token stocké :</strong> {localStorage.getItem('token') ? 'Oui' : 'Non'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 