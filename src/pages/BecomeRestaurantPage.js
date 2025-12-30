import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Phone, Mail, MapPin, Clock, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BecomeRestaurantPage = () => {
  const { user, isAuthenticated, loading: authLoading, becomeRestaurant, hasRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    openingTime: '09:00',
    closingTime: '22:00',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // If user already has a restaurant, redirect to restaurant panel
    if (!authLoading && hasRole('RESTAURANT_OWNER')) {
      navigate('/restaurant-panel');
      return;
    }

    // Pre-fill email from user data
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [authLoading, isAuthenticated, user, hasRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await becomeRestaurant(formData);

    if (result.success) {
      navigate('/restaurant-panel');
    } else {
      // If user already has a restaurant, redirect to restaurant panel
      if (result.error && result.error.toLowerCase().includes('already has a restaurant')) {
        navigate('/restaurant-panel');
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
        <h1>Open Your Restaurant</h1>
      </header>

      <div className="become-container">
        <div className="become-hero">
          <div className="hero-icon">
            <Store size={64} />
          </div>
          <h2>Partner With Us</h2>
          <p>Grow your restaurant business with our delivery platform</p>
        </div>

        <div className="become-benefits">
          <div className="benefit">
            <Check size={20} />
            <span>Reach thousands of new customers</span>
          </div>
          <div className="benefit">
            <Check size={20} />
            <span>Easy-to-use restaurant dashboard</span>
          </div>
          <div className="benefit">
            <Check size={20} />
            <span>Real-time order management</span>
          </div>
          <div className="benefit">
            <Check size={20} />
            <span>Analytics and insights</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="become-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Restaurant Information</h3>

            <div className="form-group">
              <label>
                <Store size={16} />
                Restaurant Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your restaurant name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell customers about your restaurant, cuisine, specialties..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Location</h3>

            <div className="form-group">
              <label>
                <MapPin size={16} />
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
                required
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>

            <div className="form-group">
              <label>
                <Phone size={16} />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
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
                placeholder="restaurant@email.com"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Working Hours</h3>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Clock size={16} />
                  Opening Time
                </label>
                <input
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Closing Time</label>
                <input
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-large" disabled={loading}>
            <Store size={20} />
            {loading ? 'Processing...' : 'Open Restaurant'}
          </button>
        </form>

        <p className="become-note">
          By clicking "Open Restaurant", you agree to our Restaurant Partner Agreement and Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default BecomeRestaurantPage;
