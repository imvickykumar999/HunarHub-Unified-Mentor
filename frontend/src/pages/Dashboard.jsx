import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Settings, ShoppingBag, Calendar, Check, X, ShieldAlert, Award, 
  Trash2, Plus, Star, ToggleLeft, ToggleRight, DollarSign, Users, LineChart, ShieldCheck
} from 'lucide-react';
import { api } from '../utils/api';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  
  // Generic states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState('success');

  // Customer Dashboard states
  const [customerRequests, setCustomerRequests] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [feedbackTarget, setFeedbackTarget] = useState(null); // { type: 'request'|'order', id: string }
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Entrepreneur Dashboard states
  const [entProfile, setEntProfile] = useState(null);
  const [entRequests, setEntRequests] = useState([]);
  const [entOrders, setEntOrders] = useState([]);
  const [entProducts, setEntProducts] = useState([]);
  // Product Form (Add/Edit)
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('5');
  const [prodCategory, setProdCategory] = useState('Potter');
  // Profile Update Form
  const [bizName, setBizName] = useState('');
  const [bizBio, setBizBio] = useState('');
  const [bizExp, setBizExp] = useState(0);
  const [bizSkills, setBizSkills] = useState('');
  const [bizPricing, setBizPricing] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizLoc, setBizLoc] = useState('');
  const [bizCat, setBizCat] = useState('Potter');

  // Admin Dashboard states
  const [adminStats, setAdminStats] = useState(null);
  const [adminEntrepreneurs, setAdminEntrepreneurs] = useState([]);
  const [adminActivities, setAdminActivities] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Set default tab based on role
    if (user.role === 'customer') {
      setActiveTab('requests');
      loadCustomerData();
    } else if (user.role === 'entrepreneur') {
      setActiveTab('requests');
      loadEntrepreneurData();
    } else if (user.role === 'admin') {
      setActiveTab('analytics');
      loadAdminData();
    }
  }, [user]);

  // Alert helper
  const showAlert = (msg, type = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  /* =========================================================================
     1. CUSTOMER LOGIC
     ========================================================================= */
  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const reqsRes = await api.get('/requests');
      if (reqsRes.success) setCustomerRequests(reqsRes.requests);

      const ordsRes = await api.get('/orders');
      if (ordsRes.success) setCustomerOrders(ordsRes.orders);
    } catch (err) {
      setError('Error loading customer panel.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      const data = await api.put(`/requests/${id}/status`, { status: 'cancelled' });
      if (data.success) {
        showAlert('Service request cancelled successfully.');
        loadCustomerData();
      } else {
        showAlert(data.message, 'danger');
      }
    } catch (err) {
      showAlert('Cancel failed.', 'danger');
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const data = await api.put(`/orders/${id}/status`, { status: 'cancelled' });
      if (data.success) {
        showAlert('Product order cancelled successfully.');
        loadCustomerData();
      } else {
        showAlert(data.message, 'danger');
      }
    } catch (err) {
      showAlert('Cancel failed.', 'danger');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackTarget) return;

    try {
      const endpoint = feedbackTarget.type === 'request' 
        ? `/requests/${feedbackTarget.id}/feedback`
        : `/orders/${feedbackTarget.id}/feedback`;

      const data = await api.post(endpoint, {
        rating: Number(feedbackRating),
        comment: feedbackComment
      });

      if (data.success) {
        showAlert('Thank you for your rating & feedback!');
        setFeedbackTarget(null);
        setFeedbackComment('');
        setFeedbackRating(5);
        loadCustomerData();
      } else {
        showAlert(data.message, 'danger');
      }
    } catch (err) {
      showAlert('Feedback submission failed.', 'danger');
    }
  };


  /* =========================================================================
     2. ENTREPRENEUR LOGIC
     ========================================================================= */
  const loadEntrepreneurData = async () => {
    setLoading(true);
    try {
      const profRes = await api.get('/profiles/me');
      if (profRes.success) {
        const p = profRes.profile;
        setEntProfile(p);
        setBizName(p.businessName || '');
        setBizBio(p.bio || '');
        setBizExp(p.experience || 0);
        setBizSkills(p.skills?.join(', ') || '');
        setBizPricing(p.pricingDetails || '');
        setBizPhone(p.user?.phone || '');
        setBizLoc(p.user?.location || '');
        setBizCat(p.category || 'Potter');
      }

      const reqsRes = await api.get('/requests');
      if (reqsRes.success) setEntRequests(reqsRes.requests);

      const ordsRes = await api.get('/orders');
      if (ordsRes.success) setEntOrders(ordsRes.orders);

      const prodsRes = await api.get(`/products?entrepreneur=${user._id}`);
      if (prodsRes.success) setEntProducts(prodsRes.products);
    } catch (err) {
      setError('Error loading entrepreneur panel.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!entProfile) return;
    try {
      const nextAvailable = !entProfile.isAvailable;
      const data = await api.put('/profiles/me', { isAvailable: nextAvailable });
      if (data.success) {
        setEntProfile(data.profile);
        showAlert(`Availability status updated to ${nextAvailable ? 'Active' : 'Busy'}.`);
      }
    } catch (err) {
      showAlert('Status toggle failed.', 'danger');
    }
  };

  const handleRequestStatusUpdate = async (id, status) => {
    try {
      const data = await api.put(`/requests/${id}/status`, { status });
      if (data.success) {
        showAlert(`Service request is now: ${status}.`);
        loadEntrepreneurData();
      } else {
        showAlert(data.message, 'danger');
      }
    } catch (err) {
      showAlert('Request update failed.', 'danger');
    }
  };

  const handleOrderStatusUpdate = async (id, status) => {
    try {
      const data = await api.put(`/orders/${id}/status`, { status });
      if (data.success) {
        showAlert(`Order has been marked as: ${status}.`);
        loadEntrepreneurData();
      } else {
        showAlert(data.message, 'danger');
      }
    } catch (err) {
      showAlert('Order update failed.', 'danger');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.put('/profiles/me', {
        businessName: bizName,
        bio: bizBio,
        experience: Number(bizExp),
        skills: bizSkills.split(',').map(s => s.trim()).filter(Boolean),
        pricingDetails: bizPricing,
        phone: bizPhone,
        location: bizLoc,
        category: bizCat
      });

      if (data.success) {
        setEntProfile(data.profile);
        showAlert('Artisan Profile updated successfully!');
      } else {
        showAlert(data.message, 'danger');
      }
    } catch (err) {
      showAlert('Profile update failed.', 'danger');
    }
  };

  const openAddProduct = () => {
    setEditProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdStock('5');
    setProdCategory(entProfile?.category || 'Potter');
    setProductFormOpen(true);
  };

  const openEditProduct = (prod) => {
    setEditProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdCategory(prod.category);
    setProductFormOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodDesc) {
      showAlert('Please enter product name, description and pricing.', 'danger');
      return;
    }

    try {
      const payload = {
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        stock: Number(prodStock),
        category: prodCategory
      };

      let res;
      if (editProduct) {
        res = await api.put(`/products/${editProduct._id}`, payload);
      } else {
        res = await api.post('/products', payload);
      }

      if (res.success) {
        showAlert(editProduct ? 'Product edited successfully.' : 'Product added successfully.');
        setProductFormOpen(false);
        loadEntrepreneurData();
      } else {
        showAlert(res.message, 'danger');
      }
    } catch (err) {
      showAlert('Product operation failed.', 'danger');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product listing? This action cannot be undone.')) return;
    try {
      const data = await api.delete(`/products/${id}`);
      if (data.success) {
        showAlert('Product deleted.');
        loadEntrepreneurData();
      } else {
        showAlert(data.message, 'danger');
      }
    } catch (err) {
      showAlert('Delete failed.', 'danger');
    }
  };


  /* =========================================================================
     3. ADMIN LOGIC
     ========================================================================= */
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      if (statsRes.success) setAdminStats(statsRes.stats);

      const entsRes = await api.get('/admin/entrepreneurs');
      if (entsRes.success) setAdminEntrepreneurs(entsRes.profiles);

      const actRes = await api.get('/admin/activities');
      if (actRes.success) setAdminActivities(actRes.activities);
    } catch (err) {
      setError('Error loading administrator panel.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (profileId, currentVerified) => {
    try {
      const data = await api.put(`/admin/entrepreneurs/${profileId}/verify`, {
        verified: !currentVerified
      });
      if (data.success) {
        showAlert(`Entrepreneur profile verification status toggled.`);
        loadAdminData();
      } else {
        showAlert(data.message, 'danger');
      }
    } catch (err) {
      showAlert('Verification toggle failed.', 'danger');
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontFamily: 'var(--font-family-display)' }}>
        User Workspace
      </h1>

      {alertMsg && (
        <div className={`alert alert-${alertType}`} style={{ position: 'sticky', top: '70px', zIndex: 90 }}>
          {alertMsg}
        </div>
      )}

      {/* Tab Selectors depending on Role */}
      {/* ----------------- CUSTOMER ----------------- */}
      {user.role === 'customer' && (
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`btn`} 
            style={{ borderRadius: '0', background: 'none', borderBottom: activeTab === 'requests' ? '3px solid var(--primary)' : 'none', color: activeTab === 'requests' ? 'var(--text-primary)' : 'var(--text-secondary)', paddingBottom: '0.75rem' }}
          >
            <Calendar size={18} /> Service Bookings ({customerRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`btn`} 
            style={{ borderRadius: '0', background: 'none', borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : 'none', color: activeTab === 'orders' ? 'var(--text-primary)' : 'var(--text-secondary)', paddingBottom: '0.75rem' }}
          >
            <ShoppingBag size={18} /> Product Orders ({customerOrders.length})
          </button>
        </div>
      )}

      {/* ----------------- ENTREPRENEUR ----------------- */}
      {user.role === 'entrepreneur' && (
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`btn`} 
            style={{ borderRadius: '0', background: 'none', borderBottom: activeTab === 'requests' ? '3px solid var(--primary)' : 'none', color: activeTab === 'requests' ? 'var(--text-primary)' : 'var(--text-secondary)', paddingBottom: '0.75rem' }}
          >
            Service Bookings ({entRequests.filter(r => r.status === 'pending').length} New)
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`btn`} 
            style={{ borderRadius: '0', background: 'none', borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : 'none', color: activeTab === 'orders' ? 'var(--text-primary)' : 'var(--text-secondary)', paddingBottom: '0.75rem' }}
          >
            Product Orders ({entOrders.filter(o => o.status === 'pending').length} New)
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`btn`} 
            style={{ borderRadius: '0', background: 'none', borderBottom: activeTab === 'products' ? '3px solid var(--primary)' : 'none', color: activeTab === 'products' ? 'var(--text-primary)' : 'var(--text-secondary)', paddingBottom: '0.75rem' }}
          >
            My Products ({entProducts.length})
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`btn`} 
            style={{ borderRadius: '0', background: 'none', borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : 'none', color: activeTab === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)', paddingBottom: '0.75rem' }}
          >
            <Settings size={16} /> Edit Public Profile
          </button>
        </div>
      )}

      {/* ----------------- ADMIN ----------------- */}
      {user.role === 'admin' && (
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`btn`} 
            style={{ borderRadius: '0', background: 'none', borderBottom: activeTab === 'analytics' ? '3px solid var(--primary)' : 'none', color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-secondary)', paddingBottom: '0.75rem' }}
          >
            <LineChart size={16} /> Analytics & Reports
          </button>
          <button 
            onClick={() => setActiveTab('verifications')}
            className={`btn`} 
            style={{ borderRadius: '0', background: 'none', borderBottom: activeTab === 'verifications' ? '3px solid var(--primary)' : 'none', color: activeTab === 'verifications' ? 'var(--text-primary)' : 'var(--text-secondary)', paddingBottom: '0.75rem' }}
          >
            <ShieldAlert size={16} /> Verification Requests ({adminEntrepreneurs.filter(e => !e.verified).length})
          </button>
        </div>
      )}


      {/* =========================================================================
         TAB PANELS: CUSTOMER
         ========================================================================= */}
      {user.role === 'customer' && activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {customerRequests.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>You have not submitted any service bookings yet.</p>
          ) : (
            customerRequests.map((req) => (
              <div key={req._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>{req.serviceType}</h3>
                  <span className={`badge ${req.status === 'completed' ? 'badge-verified' : req.status === 'pending' ? 'badge-pending' : 'badge-category'}`} style={{ color: req.status === 'rejected' || req.status === 'cancelled' ? 'var(--danger)' : '' }}>
                    {req.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Entrepreneur: <strong>{req.entrepreneur?.name}</strong> ({req.entrepreneur?.location})
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Proposed Date: {new Date(req.proposedDate).toLocaleDateString()} | Budget: ₹{req.proposedPrice || 'Flexible'}
                </p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  {req.description}
                </p>
                
                {req.feedback && req.feedback.rating ? (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--primary)' }}>★ {req.feedback.rating}/5</span> - <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>"{req.feedback.comment}"</span>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  {req.status === 'pending' && (
                    <button onClick={() => handleCancelRequest(req._id)} className="btn btn-danger btn-sm">
                      Cancel Request
                    </button>
                  )}
                  {req.status === 'completed' && !req.feedback?.rating && (
                    <button onClick={() => setFeedbackTarget({ type: 'request', id: req._id })} className="btn btn-primary btn-sm">
                      Submit Feedback
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {user.role === 'customer' && activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {customerOrders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>You have not placed any orders yet.</p>
          ) : (
            customerOrders.map((ord) => (
              <div key={ord._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>{ord.product?.name || 'Handmade Product'}</h3>
                  <span className={`badge ${ord.status === 'delivered' ? 'badge-verified' : ord.status === 'pending' ? 'badge-pending' : 'badge-category'}`} style={{ color: ord.status === 'cancelled' ? 'var(--danger)' : '' }}>
                    {ord.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Artisan Seller: <strong>{ord.entrepreneur?.name}</strong> | Quantity: {ord.quantity} | Total paid: ₹{ord.totalPrice}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Ordered on: {new Date(ord.createdAt).toLocaleDateString()}
                </p>
                
                {ord.feedback && ord.feedback.rating ? (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--primary)' }}>★ {ord.feedback.rating}/5</span> - <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>"{ord.feedback.comment}"</span>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  {ord.status === 'pending' && (
                    <button onClick={() => handleCancelOrder(ord._id)} className="btn btn-danger btn-sm">
                      Cancel Order
                    </button>
                  )}
                  {ord.status === 'delivered' && !ord.feedback?.rating && (
                    <button onClick={() => setFeedbackTarget({ type: 'order', id: ord._id })} className="btn btn-primary btn-sm">
                      Submit Review
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}


      {/* =========================================================================
         TAB PANELS: ENTREPRENEUR
         ========================================================================= */}
      {user.role === 'entrepreneur' && (
        <div style={{ marginBottom: '2rem' }}>
          {/* Dashboard Earnings / Availability Overview Card */}
          <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, var(--bg-card) 100%)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Wallet / Total Earnings</span>
                <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>₹{entProfile?.earnings || 0}</h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Rating</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={16} fill="var(--primary)" color="var(--primary)" />
                  <strong style={{ fontSize: '1.25rem' }}>{entProfile?.rating?.average || '0.0'}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({entProfile?.rating?.count || 0} reviews)</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>My Status</span>
                <span className={`badge ${entProfile?.verified ? 'badge-verified' : 'badge-pending'}`}>
                  {entProfile?.verified ? 'Verified Creator' : 'Pending Verification'}
                </span>
              </div>
              <button 
                onClick={handleToggleAvailability}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
              >
                {entProfile?.isAvailable ? <ToggleRight size={24} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={24} style={{ color: 'var(--text-muted)' }} />}
                <span>{entProfile?.isAvailable ? 'Taking Bookings' : 'Set as Busy'}</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Service Requests (Accept/Reject) */}
          {activeTab === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {entRequests.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>No service requests have been placed with you yet.</p>
              ) : (
                entRequests.map((req) => (
                  <div key={req._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem' }}>{req.serviceType}</h3>
                      <span className={`badge ${req.status === 'completed' ? 'badge-verified' : req.status === 'pending' ? 'badge-pending' : 'badge-category'}`} style={{ color: req.status === 'rejected' || req.status === 'cancelled' ? 'var(--danger)' : '' }}>
                        {req.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Customer: <strong>{req.customer?.name}</strong> | Phone: {req.customer?.phone} | Location: {req.customer?.location}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Suggested Date: {new Date(req.proposedDate).toLocaleDateString()} | Budget Offered: ₹{req.proposedPrice || 'Flexible'}
                    </p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                      {req.description}
                    </p>

                    {req.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
                        Customer note: {req.notes}
                      </p>
                    )}

                    {req.feedback && req.feedback.rating ? (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--primary)' }}>★ {req.feedback.rating}/5 Rating</span> - <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>"{req.feedback.comment}"</span>
                      </div>
                    ) : null}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => handleRequestStatusUpdate(req._id, 'accepted')} className="btn btn-success btn-sm">
                            <Check size={14} /> Accept Request
                          </button>
                          <button onClick={() => handleRequestStatusUpdate(req._id, 'rejected')} className="btn btn-danger btn-sm">
                            <X size={14} /> Reject Request
                          </button>
                        </>
                      )}
                      {req.status === 'accepted' && (
                        <button onClick={() => handleRequestStatusUpdate(req._id, 'completed')} className="btn btn-success btn-sm">
                          Mark as Completed & Collect
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Product Orders (Ship/Deliver) */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {entOrders.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>No orders have been received yet.</p>
              ) : (
                entOrders.map((ord) => (
                  <div key={ord._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem' }}>{ord.product?.name || 'Product'}</h3>
                      <span className={`badge ${ord.status === 'delivered' ? 'badge-verified' : ord.status === 'pending' ? 'badge-pending' : 'badge-category'}`} style={{ color: ord.status === 'cancelled' ? 'var(--danger)' : '' }}>
                        {ord.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Buyer: <strong>{ord.customer?.name}</strong> | Phone: {ord.customer?.phone} | Qty: {ord.quantity} | Total: ₹{ord.totalPrice}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Delivery Location: {ord.shippingAddress}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Date placed: {new Date(ord.createdAt).toLocaleDateString()}
                    </p>

                    {ord.feedback && ord.feedback.rating ? (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--primary)' }}>★ {ord.feedback.rating}/5 Rating</span> - <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>"{ord.feedback.comment}"</span>
                      </div>
                    ) : null}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                      {ord.status === 'pending' && (
                        <button onClick={() => handleOrderStatusUpdate(ord._id, 'shipped')} className="btn btn-primary btn-sm">
                          Ship Package
                        </button>
                      )}
                      {ord.status === 'shipped' && (
                        <button onClick={() => handleOrderStatusUpdate(ord._id, 'delivered')} className="btn btn-success btn-sm">
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Products Catalog (CRUD) */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-family-display)' }}>My Product Listings</h3>
                <button onClick={openAddProduct} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {productFormOpen && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
                  <h3 style={{ marginBottom: '1.25rem' }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <form onSubmit={handleProductSubmit}>
                    <div className="form-group">
                      <label className="form-label">Product Name</label>
                      <input 
                        type="text" 
                        value={prodName} 
                        onChange={(e) => setProdName(e.target.value)} 
                        className="form-control" 
                        placeholder="e.g. Clay tea cups (Set of 6)"
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea 
                        value={prodDesc} 
                        onChange={(e) => setProdDesc(e.target.value)} 
                        className="form-control" 
                        placeholder="Describe materials, sizing, and details..."
                        rows="3"
                        required 
                      ></textarea>
                    </div>
                    <div className="grid-cols-1-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Price (₹)</label>
                        <input 
                          type="number" 
                          value={prodPrice} 
                          onChange={(e) => setProdPrice(e.target.value)} 
                          className="form-control" 
                          min="0"
                          placeholder="e.g. 299"
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Stock Quantity</label>
                        <input 
                          type="number" 
                          value={prodStock} 
                          onChange={(e) => setProdStock(e.target.value)} 
                          className="form-control" 
                          min="0"
                          required 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select 
                        value={prodCategory} 
                        onChange={(e) => setProdCategory(e.target.value)} 
                        className="form-control"
                      >
                        {['Cobbler', 'Potter', 'Tailor', 'Artisan', 'Small Vendor', 'Other'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        {editProduct ? 'Save Changes' : 'Publish Product'}
                      </button>
                      <button type="button" onClick={() => setProductFormOpen(false)} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {entProducts.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>You have not listed any products yet. Click 'Add Product' to list items.</p>
              ) : (
                <div className="grid-cols-1-2">
                  {entProducts.map(p => (
                    <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '1.15rem' }}>{p.name}</h4>
                          <span style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: '700' }}>₹{p.price}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Stock: {p.stock} | Category: {p.category}</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{p.description}</p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                        <button onClick={() => openEditProduct(p)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-danger btn-sm" style={{ flex: 0, padding: '0.5rem' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Profile Configuration */}
          {activeTab === 'profile' && (
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-family-display)' }}>Update Public Business Details</h3>
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label className="form-label">Business / Shop Name</label>
                  <input 
                    type="text" 
                    value={bizName} 
                    onChange={(e) => setBizName(e.target.value)} 
                    className="form-control" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skill / Business Category</label>
                  <select 
                    value={bizCat} 
                    onChange={(e) => setBizCat(e.target.value)} 
                    className="form-control"
                  >
                    {['Cobbler', 'Potter', 'Tailor', 'Artisan', 'Small Vendor', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Professional Bio / Story</label>
                  <textarea 
                    value={bizBio} 
                    onChange={(e) => setBizBio(e.target.value)} 
                    className="form-control" 
                    rows="4" 
                    required 
                  ></textarea>
                </div>

                <div className="grid-cols-1-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input 
                      type="number" 
                      value={bizExp} 
                      onChange={(e) => setBizExp(e.target.value)} 
                      className="form-control" 
                      min="0"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pricing Overview</label>
                    <input 
                      type="text" 
                      value={bizPricing} 
                      onChange={(e) => setBizPricing(e.target.value)} 
                      className="form-control" 
                      placeholder="e.g. Alterations from ₹100, custom design ₹1000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills / Keywords (comma separated)</label>
                  <input 
                    type="text" 
                    value={bizSkills} 
                    onChange={(e) => setBizSkills(e.target.value)} 
                    className="form-control" 
                    placeholder="e.g. Leather sewing, heel adjustment, polishing" 
                  />
                </div>

                <div className="grid-cols-1-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Contact Number</label>
                    <input 
                      type="text" 
                      value={bizPhone} 
                      onChange={(e) => setBizPhone(e.target.value)} 
                      className="form-control" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location (Area/City)</label>
                    <input 
                      type="text" 
                      value={bizLoc} 
                      onChange={(e) => setBizLoc(e.target.value)} 
                      className="form-control" 
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Save Profile Details
                </button>
              </form>
            </div>
          )}
        </div>
      )}


      {/* =========================================================================
         TAB PANELS: ADMIN
         ========================================================================= */}
      {user.role === 'admin' && (
        <div>
          {/* Tab 1: Analytics Dashboard */}
          {activeTab === 'analytics' && adminStats && (
            <div>
              {/* Stats Cards grid */}
              <div className="grid-cols-1-2-3" style={{ gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Talents</span>
                    <h3>{adminStats.entrepreneurCount} ({adminStats.verifiedCount} Verified)</h3>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Sales Volume</span>
                    <h3>₹{adminStats.totalSalesVolume}</h3>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--info-light)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LineChart size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Service Booking Conv. Rate</span>
                    <h3>{adminStats.requestConversionRate}%</h3>
                  </div>
                </div>
              </div>

              {/* Detailed metrics card */}
              <div className="grid-cols-1-2" style={{ gap: '2rem' }}>
                <div className="card">
                  <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-family-display)' }}>General Platform Stats</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 0' }}>Total Accounts Registered</td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>{adminStats.totalUsers}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 0' }}>Total Customers</td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>{adminStats.customerCount}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 0' }}>Total Completed Services</td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: '700', color: 'var(--success)' }}>{adminStats.completedRequests} / {adminStats.totalRequests} total</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 0' }}>Total Physical Orders</td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>{adminStats.orderCount}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.75rem 0' }}>Avg. Entrepreneur Earnings</td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>₹{adminStats.avgEarnings}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-family-display)' }}>Talents by Category</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(adminStats.categoryBreakdown).map(([cat, count]) => (
                      <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{cat}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '60%' }}>
                          <div style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${adminStats.entrepreneurCount > 0 ? (count / adminStats.entrepreneurCount) * 100 : 0}%`, backgroundColor: 'var(--primary)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', width: '30px', textAlign: 'right' }}>{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Verify / Approve Entrepreneurs */}
          {activeTab === 'verifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {adminEntrepreneurs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>No registered entrepreneurs yet.</p>
              ) : (
                adminEntrepreneurs.map((profile) => (
                  <div key={profile._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{profile.businessName || profile.user?.name}</h3>
                        <span className="badge badge-category" style={{ fontSize: '0.65rem' }}>{profile.category}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Creator: <strong>{profile.user?.name}</strong> | Email: {profile.user?.email} | Phone: {profile.user?.phone}
                      </p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Location: {profile.user?.location} | Experience: {profile.experience} years
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge ${profile.verified ? 'badge-verified' : 'badge-pending'}`} style={{ marginRight: '1rem' }}>
                        {profile.verified ? 'Verified Partner' : 'Unverified'}
                      </span>
                      <button
                        onClick={() => handleVerifyToggle(profile._id, profile.verified)}
                        className={`btn ${profile.verified ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      >
                        {profile.verified ? 'Revoke Approval' : 'Approve & Verify'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}


      {/* =========================================================================
         FEEDBACK POPUP MODAL
         ========================================================================= */}
      {feedbackTarget && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontFamily: 'var(--font-family-display)', marginBottom: '1.25rem' }}>
              Submit Feedback & Rating
            </h2>
            
            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">How would you rate this service/product?</label>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFeedbackRating(num)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                    >
                      <Star 
                        size={36} 
                        fill={num <= feedbackRating ? 'var(--primary)' : 'none'} 
                        color={num <= feedbackRating ? 'var(--primary)' : 'var(--text-muted)'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Review Comment</label>
                <textarea
                  placeholder="Share details of your experience with the entrepreneur (quality, timing, pricing accuracy)..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="form-control"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setFeedbackTarget(null)}
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
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
