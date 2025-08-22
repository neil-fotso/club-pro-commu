import React, { useState } from 'react';

const APITestPage = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Test en cours...\n');
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      
      const API_URL = process.env.NODE_ENV === 'production' 
        ? 'https://club-pro-commu.onrender.com/api'
        : 'http://localhost:3001/api';
      
      setResult(prev => prev + `API URL: ${API_URL}\n`);
      setResult(prev => prev + `Token: ${token ? 'Présent' : 'Absent'}\n\n`);

      // Test 1: Stats
      setResult(prev => prev + '🧪 Test API Stats...\n');
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setResult(prev => prev + `Statut: ${response.status}\n`);
      
      if (response.ok) {
        const data = await response.json();
        setResult(prev => prev + `✅ Succès!\n`);
        setResult(prev => prev + `Données: ${JSON.stringify(data, null, 2)}\n`);
      } else {
        const errorText = await response.text();
        setResult(prev => prev + `❌ Erreur: ${errorText}\n`);
      }

    } catch (error) {
      setResult(prev => prev + `❌ Exception: ${error.message}\n`);
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>🧪 Test API Admin</h2>
      
      <div className="mb-3">
        <button 
          className="btn btn-primary" 
          onClick={testAPI}
          disabled={loading}
        >
          {loading ? 'Test en cours...' : 'Tester API Stats'}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Résultats du test</h5>
        </div>
        <div className="card-body">
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            border: '1px solid #dee2e6',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            maxHeight: '500px',
            overflow: 'auto'
          }}>
            {result || 'Aucun test effectué'}
          </pre>
        </div>
      </div>

      <div className="mt-3">
        <h5>Informations de debug:</h5>
        <ul>
          <li>Token présent: {localStorage.getItem('token') ? '✅' : '❌'}</li>
          <li>Node ENV: {process.env.NODE_ENV}</li>
          <li>API URL: {process.env.NODE_ENV === 'production' 
            ? 'https://club-pro-commu.onrender.com/api'
            : 'http://localhost:3001/api'}</li>
        </ul>
      </div>
    </div>
  );
};

export default APITestPage; 