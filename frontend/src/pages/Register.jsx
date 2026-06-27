import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Briefcase } from 'lucide-react';
import { api } from '../utils/api';

export default function Register({ onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [category, setCategory] = useState('Potter');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const categories = ['Cobbler', 'Potter', 'Tailor', 'Artisan', 'Small Vendor', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple validations
    if (!name || !email || !password || !phone || !locationStr) {
      setError('Please fill in all standard fields.');
      setLoading(false);
      return;
    }

    if (role === 'entrepreneur' && !category) {
      setError('Please select a skill category.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        location: locationStr
      };

      if (role === 'entrepreneur') {
        payload.category = category;
      }

      const data = await api.post('/auth/register', payload);
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        onRegisterSuccess(data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', width: '100%' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Join HunarHub
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Create an account to start selling or buying local skills</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role selection toggle */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">I want to register as a:</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setRole('customer')}
              >
                Customer / Buyer
              </button>
              <button
                type="button"
                className={`btn ${role === 'entrepreneur' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setRole('entrepreneur')}
              >
                Micro-Entrepreneur
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="First and last name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location (Area/Neighborhood)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="e.g. Madhapur, Hyderabad"
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Conditional Category field if role is entrepreneur */}
          {role === 'entrepreneur' && (
            <div className="form-group animate-fade-in" style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem', marginTop: '1rem' }}>
              <label className="form-label">Skill / Business Category</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Briefcase size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                * Your profile will require verification by our admin team before appearing in search listings.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '600' }}>
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
