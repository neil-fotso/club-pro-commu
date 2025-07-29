import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import CookieConsent from './components/CookieConsent';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
          <CookieConsent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
