import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Award, ShieldAlert, BookOpen, Compass, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

export default function Home() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Cobbler', 'Potter', 'Tailor', 'Artisan', 'Small Vendor'];

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      let queryParams = [];
      if (category !== 'All') queryParams.push(`category=${category}`);
      if (location) queryParams.push(`location=${encodeURIComponent(location)}`);
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      
      const queryStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const data = await api.get(`/profiles${queryStr}`);
      
      if (data.success) {
        setProfiles(data.profiles);
      } else {
        setError(data.message || 'Failed to fetch profiles');
      }
    } catch (err) {
      setError('An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [category]); // Fetch on category tab change directly

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProfiles();
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Empowering <span>Local Talent</span> & Micro-Entrepreneurs
        </h1>
        <p className="hero-subtitle">
          Discover traditional artisans, potters, skilled tailors, cobblers, and small vendors in your area. Book custom services or buy authentic handmade products directly, bypassing middle-men.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-verified" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>✓ 100% verified skills</span>
          <span className="badge badge-category" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ffb300' }}>★ Zero middleman commission</span>
          <span className="badge badge-category" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#00e676' }}>♥ Direct community support</span>
        </div>
      </section>

      {/* Advanced Search & Filtering Bar */}
      <form onSubmit={handleSearchSubmit} className="search-container">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search skills (e.g. Clay, Stitching, Repair)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <MapPin size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Location/Neighborhood..." 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Filter Marketplace
        </button>
      </form>

      {/* Category Selection Tabs */}
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`tab-btn ${category === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listing Section */}
      <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-family-display)' }}>
        Available Local Talents ({profiles.length})
      </h2>

      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No micro-entrepreneurs found matching your search filters.</p>
          <p style={{ fontSize: '0.9rem' }}>Try clearing filters or looking in a broader location scope.</p>
        </div>
      ) : (
        <div className="grid-cols-1-2-3">
          {profiles.map((profile) => (
            <div key={profile._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-category">{profile.category}</span>
                {profile.verified && (
                  <span className="badge badge-verified" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                    <ShieldCheck size={12} />
                    Verified
                  </span>
                )}
              </div>
              
              <h3 className="card-title" style={{ fontSize: '1.35rem', fontWeight: '700' }}>
                {profile.businessName || profile.user?.name}
              </h3>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} />
                {profile.user?.location || 'Local Area'}
              </p>
              
              {/* Rating */}
              <div style={{ marginBottom: '1rem' }}>
                <span className="rating-stars">
                  <Star size={16} fill="currentColor" />
                  <span className="rating-value">{profile.rating?.average || '0.0'}</span>
                </span>
                <span className="rating-count">({profile.rating?.count || 0} reviews)</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
                  • {profile.experience} yrs exp
                </span>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flexGrow: 1, lineBreak: 'anywhere' }}>
                {profile.bio ? (profile.bio.length > 120 ? `${profile.bio.substring(0, 120)}...` : profile.bio) : 'No bio provided. Artisan is ready to receive customized orders.'}
              </p>

              {/* Skills Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem' }}>
                {profile.skills && profile.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    #{skill}
                  </span>
                ))}
                {profile.skills && profile.skills.length > 3 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                    +{profile.skills.length - 3} more
                  </span>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Availability: <strong style={{ color: profile.isAvailable ? 'var(--success)' : 'var(--danger)' }}>{profile.isAvailable ? 'Active' : 'Busy'}</strong>
                </span>
                <Link to={`/profiles/${profile.user?._id}`} className="btn btn-primary btn-sm">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Objectives / Details Section for Premium Aesthetics */}
      <section style={{ marginTop: '5rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontFamily: 'var(--font-family-display)', fontSize: '2.25rem' }}>
          Platform Mission & Social Impact
        </h2>
        <div className="grid-cols-1-2" style={{ gap: '2rem' }}>
          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255, 255, 255, 0.01)' }}>
            <Compass size={40} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Primary Objectives</h3>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                <li><strong>Digitally Connect:</strong> Bring local micro-entrepreneurs directly onto a streamlined customer discovery grid.</li>
                <li><strong>All-in-One Service & Shop:</strong> Enable direct service bookings (e.g. tailoring, repairs) alongside physical handmade sales in a single marketplace.</li>
                <li><strong>Preserve Traditional Skills:</strong> Elevate pottery, handicraft weaving, custom carpentry, and heritage skills in the digital age.</li>
              </ul>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255, 255, 255, 0.01)' }}>
            <Award size={40} style={{ color: 'var(--success)', flexShrink: 0 }} />
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Expected Impact</h3>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                <li><strong>Increase Family Income:</strong> Boost overall earnings for small street vendors and home craftsmen by over 40% through remote access.</li>
                <li><strong>Encourage Local Commerce:</strong> Provide sustainable, eco-friendly shopping circles that source goods right in the community.</li>
                <li><strong>Support Digital Literacy:</strong> Equip micro-entrepreneurs with simple dashboards to manage slots, product lists, and status tracking.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
