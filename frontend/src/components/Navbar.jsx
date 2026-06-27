import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, LogOut, LogIn, UserPlus, User } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          HunarHub
          <span className="logo-sub">Local Digital Marketplace</span>
        </Link>

        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>

          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Hello, <strong>{user.name}</strong>
                </span>
                
                {user.role === 'entrepreneur' && (
                  <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>Entrepreneur</span>
                )}
                {user.role === 'admin' && (
                  <span className="badge" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)', fontSize: '0.7rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>Admin</span>
                )}
                
                <button 
                  onClick={handleLogoutClick} 
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary btn-sm"
                style={{ padding: '0.5rem 1rem' }}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
