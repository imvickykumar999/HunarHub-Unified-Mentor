import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Award, Calendar, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

export default function ProfileDetails({ currentUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Service Request form state
  const [serviceType, setServiceType] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState(null);

  // Buy Product Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyError, setBuyError] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await api.get(`/profiles/${userId}`);
        if (profileRes.success) {
          setProfile(profileRes.profile);
        } else {
          setError(profileRes.message || 'Profile not found');
        }

        const productsRes = await api.get(`/products?entrepreneur=${userId}`);
        if (productsRes.success) {
          setProducts(productsRes.products);
        }
      } catch (err) {
        setError('Error loading profile data.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId]);

  const handleBookService = async (e) => {
    e.preventDefault();
    setRequestError(null);
    setRequestSuccess(false);

    if (!currentUser) {
      setRequestError('You must register or log in as a customer to place service requests.');
      return;
    }

    if (currentUser.role !== 'customer') {
      setRequestError('Only customer accounts can submit service requests.');
      return;
    }

    if (!serviceType || !reqDescription || !proposedDate) {
      setRequestError('Please fill in service type, description and preferred date.');
      return;
    }

    try {
      const data = await api.post('/requests', {
        entrepreneurId: userId,
        serviceType,
        description: reqDescription,
        proposedDate,
        proposedPrice: proposedPrice ? Number(proposedPrice) : 0,
        notes: reqNotes
      });

      if (data.success) {
        setRequestSuccess(true);
        setServiceType('');
        setReqDescription('');
        setProposedDate('');
        setProposedPrice('');
        setReqNotes('');
      } else {
        setRequestError(data.message || 'Failed to place request.');
      }
    } catch (err) {
      setRequestError('Network error while booking.');
    }
  };

  const handleBuyProductSubmit = async (e) => {
    e.preventDefault();
    setBuyError(null);
    setBuySuccess(false);

    if (!currentUser) {
      setBuyError('You must log in as a customer to purchase items.');
      return;
    }

    if (currentUser.role !== 'customer') {
      setBuyError('Only customer accounts can purchase products.');
      return;
    }

    if (!shippingAddress) {
      setBuyError('Shipping address is required.');
      return;
    }

    try {
      const data = await api.post('/orders', {
        productId: selectedProduct._id,
        quantity,
        shippingAddress
      });

      if (data.success) {
        setBuySuccess(true);
        // Refresh product list to show decremented stock
        const productsRes = await api.get(`/products?entrepreneur=${userId}`);
        if (productsRes.success) {
          setProducts(productsRes.products);
        }
        setTimeout(() => {
          setSelectedProduct(null);
          setBuySuccess(false);
          setQuantity(1);
          setShippingAddress('');
        }, 2000);
      } else {
        setBuyError(data.message || 'Purchase failed.');
      }
    } catch (err) {
      setBuyError('Network error during purchase.');
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!profile) return <div className="alert alert-danger">Profile not found</div>;

  return (
    <div>
      {/* Detail Header */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2.5rem', background: 'radial-gradient(circle at 100% 0%, rgba(251, 191, 36, 0.05) 0%, var(--bg-card) 60%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-category">{profile.category}</span>
                {profile.verified && (
                  <span className="badge badge-verified" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                    <ShieldCheck size={12} />
                    Verified Partner
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {profile.businessName || profile.user?.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1.05rem' }}>
                <MapPin size={18} />
                {profile.user?.location || 'Local Neighborhood'}
              </p>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="rating-stars" style={{ fontSize: '1.25rem' }}>
                  <Star size={20} fill="currentColor" />
                  <span className="rating-value" style={{ fontSize: '1.25rem' }}>{profile.rating?.average || '0.0'}</span>
                </span>
                <span className="rating-count" style={{ fontSize: '1rem' }}>({profile.rating?.count || 0} reviews)</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                Experience: <strong>{profile.experience} Years</strong>
              </p>
              <p style={{ color: 'var(--text-muted)' }}>
                Availability: <strong style={{ color: profile.isAvailable ? 'var(--success)' : 'var(--danger)' }}>{profile.isAvailable ? 'Available for work' : 'Busy / Not taking bookings'}</strong>
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>About the Entrepreneur</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {profile.bio || 'This artisan is passionate about their work and is eager to showcase their custom creations or assist you with services. Get in touch directly using the request form.'}
            </p>
          </div>

          {/* Contact details */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
            {currentUser ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} style={{ color: 'var(--primary)' }} />
                  <span>Phone: <strong>{profile.user?.phone || 'Not provided'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} style={{ color: 'var(--primary)' }} />
                  <span>Email: <strong>{profile.user?.email || 'Not provided'}</strong></span>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                🔑 <Link to="/login" style={{ textDecoration: 'underline' }}>Log in</Link> or <Link to="/register" style={{ textDecoration: 'underline' }}>Register</Link> to view contact numbers and email addresses.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-cols-1-2" style={{ gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Handmade Products Shop */}
        <div>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-family-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={24} style={{ color: 'var(--primary)' }} />
            Handmade Shop ({products.length})
          </h2>

          {products.length === 0 ? (
            <div style={{ padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              This entrepreneur hasn't listed any physical products for sale yet. Feel free to submit a service request for custom work!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {products.map((prod) => (
                <div key={prod._id} className="card" style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{prod.name}</h3>
                      <span className="badge badge-category" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>{prod.category}</span>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                      ₹{prod.price}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {prod.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      In Stock: <strong style={{ color: prod.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>{prod.stock > 0 ? `${prod.stock} items` : 'Out of stock'}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="btn btn-primary btn-sm"
                      disabled={prod.stock === 0}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Service request / Booking Form */}
        <div>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-family-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={24} style={{ color: 'var(--primary)' }} />
            Book a Service Request
          </h2>

          <div className="card" style={{ padding: '2rem' }}>
            {requestSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }} className="animate-fade-in">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Check size={28} />
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>Request Submitted!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  The entrepreneur has been notified of your service request. Track status in your dashboard.
                </p>
                <button onClick={() => setRequestSuccess(false)} className="btn btn-secondary btn-sm">
                  Place another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookService}>
                {requestError && <div className="alert alert-danger" style={{ fontSize: '0.9rem' }}>{requestError}</div>}
                
                <div className="form-group">
                  <label className="form-label">Service Type / Heading</label>
                  <input
                    type="text"
                    placeholder="e.g. Clay vase restoration, dress resizing"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Describe Your Requirements</label>
                  <textarea
                    placeholder="Provide details about the work needed, measurements, specifications..."
                    value={reqDescription}
                    onChange={(e) => setReqDescription(e.target.value)}
                    className="form-control"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Date</label>
                  <input
                    type="date"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Price Budget (₹, Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Instructions / Notes</label>
                  <textarea
                    placeholder="Any specific delivery instructions, material details..."
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                    className="form-control"
                    rows="2"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                  disabled={!profile.isAvailable}
                >
                  {profile.isAvailable ? 'Submit Booking Request' : 'Artisan Currently Busy'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Buy Product Modal */}
      {selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontFamily: 'var(--font-family-display)', marginBottom: '1rem' }}>
              Confirm Purchase
            </h2>
            
            {buySuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Check size={28} />
                </div>
                <h3>Purchase Successful!</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Order has been created. Check status on your dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBuyProductSubmit}>
                {buyError && <div className="alert alert-danger">{buyError}</div>}
                
                <p style={{ marginBottom: '1rem' }}>
                  You are ordering <strong>{selectedProduct.name}</strong> from {profile.businessName || profile.user?.name}.
                </p>

                <div className="form-group">
                  <label className="form-label">Unit Price: ₹{selectedProduct.price}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(selectedProduct.stock, Math.max(1, Number(e.target.value))))}
                      className="form-control"
                      style={{ width: '80px' }}
                      required
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      (Max {selectedProduct.stock} available)
                    </span>
                  </div>
                </div>

                <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem' }}>
                    Total Price: ₹{selectedProduct.price * quantity}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Shipping Address</label>
                  <textarea
                    placeholder="Enter full shipping/delivery address..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="form-control"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Confirm Order
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
