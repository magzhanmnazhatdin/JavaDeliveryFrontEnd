import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Menu,
  ShoppingBag,
  BarChart3,
  Settings,
  Save,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { restaurantOwnerApi } from '../../services/api';

const RestaurantSettings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    openingTime: '',
    closingTime: '',
    isActive: true,
  });

  const loadRestaurant = useCallback(async () => {
    try {
      setLoading(true);
      const response = await restaurantOwnerApi.getMyRestaurant();
      setRestaurant(response.data);
      setFormData({
        name: response.data.name || '',
        description: response.data.description || '',
        address: response.data.address || '',
        city: response.data.city || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        openingTime: response.data.openingTime || '',
        closingTime: response.data.closingTime || '',
        isActive: response.data.isActive ?? true,
      });
    } catch (err) {
      console.error('Failed to load restaurant:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadRestaurant();
  }, [isAuthenticated, navigate, loadRestaurant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await restaurantOwnerApi.updateRestaurant(restaurant.id, formData);
      setMessage({ type: 'success', text: 'Settings saved' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!restaurant) {
    navigate('/restaurant-panel');
    return null;
  }

  return (
    <div className="panel-page">
      <div className="panel-sidebar">
        <div className="panel-logo">
          <span>{restaurant.name}</span>
        </div>
        <nav className="panel-nav">
          <Link to="/restaurant-panel" className="nav-item">
            <BarChart3 size={20} />
            Dashboard
          </Link>
          <Link to="/restaurant-panel/menu" className="nav-item">
            <Menu size={20} />
            Menu
          </Link>
          <Link to="/restaurant-panel/orders" className="nav-item">
            <ShoppingBag size={20} />
            Orders
          </Link>
          <Link to="/restaurant-panel/settings" className="nav-item active">
            <Settings size={20} />
            Settings
          </Link>
          <div className="nav-divider"></div>
          <Link to="/" className="nav-item">
            <Home size={20} />
            Home
          </Link>
        </nav>
      </div>

      <div className="panel-content">
        <div className="panel-header">
          <h1>Restaurant Settings</h1>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label>Restaurant Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Tell us about your restaurant..."
              />
            </div>

          </div>

          <div className="form-section">
            <h3>Contact Information</h3>

            <div className="form-group">
              <label>
                <MapPin size={16} />
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street, Building"
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>

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
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.com"
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

          <div className="form-section">
            <h3>Status</h3>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Restaurant is active and accepting orders
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantSettings;
