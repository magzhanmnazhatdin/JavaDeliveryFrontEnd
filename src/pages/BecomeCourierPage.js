import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Phone, Mail, User, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BecomeCourierPage = () => {
  const { user, isAuthenticated, loading: authLoading, becomeCourier, hasRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // If user is already a courier, redirect to courier panel
    if (!authLoading && hasRole('COURIER')) {
      navigate('/courier-panel');
      return;
    }

    // Pre-fill form with user data
    if (user) {
      setFormData({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phone: '',
        email: user.email || '',
      });
    }
  }, [authLoading, isAuthenticated, user, hasRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await becomeCourier(formData);

    if (result.success) {
      navigate('/courier-panel');
    } else {
      // If user is already a courier, redirect to courier panel
      if (result.error && result.error.toLowerCase().includes('already a courier')) {
        navigate('/courier-panel');
      } else {
        setError(result.error);
        setLoading(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="become-page">
      <header className="become-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={24} />
        </Link>
        <h1>Become a Courier</h1>
      </header>

      <div className="become-container">
        <div className="become-hero">
          <div className="hero-icon">
            <Truck size={64} />
          </div>
          <h2>Start Delivering Today</h2>
          <p>Join our courier team and earn money on your schedule</p>
        </div>

        <div className="become-benefits">
          <div className="benefit">
            <Check size={20} />
            <span>Flexible hours - work when you want</span>
          </div>
          <div className="benefit">
            <Check size={20} />
            <span>Competitive earnings per delivery</span>
          </div>
          <div className="benefit">
            <Check size={20} />
            <span>Weekly payments</span>
          </div>
          <div className="benefit">
            <Check size={20} />
            <span>Be your own boss</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="become-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <User size={16} />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Phone size={16} />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-large" disabled={loading}>
            <Truck size={20} />
            {loading ? 'Processing...' : 'Become a Courier'}
          </button>
        </form>

        <p className="become-note">
          By clicking "Become a Courier", you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default BecomeCourierPage;
