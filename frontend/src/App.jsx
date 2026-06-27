import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileDetails from './pages/ProfileDetails';
import Dashboard from './pages/Dashboard';
import { api } from './utils/api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session on startup
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await api.get('/auth/me');
          if (data.success) {
            setUser(data.user);
          } else {
            // Token expired or invalid
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Session restore failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-main)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
            />
            
            <Route 
              path="/register" 
              element={user ? <Navigate to="/dashboard" /> : <Register onRegisterSuccess={handleLoginSuccess} />} 
            />
            
            <Route 
              path="/profiles/:userId" 
              element={<ProfileDetails currentUser={user} />} 
            />
            
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-card)', marginTop: '4rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong>HunarHub</strong> © 2026 – Digital Inclusion for Local Craftsmanship.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/" style={{ color: 'var(--text-muted)' }}>Marketplace</Link>
              <Link to="/register" style={{ color: 'var(--text-muted)' }}>Onboard Skills</Link>
              <a href="#privacy" style={{ color: 'var(--text-muted)' }}>Terms & Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
