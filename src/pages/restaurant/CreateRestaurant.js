import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { restaurantOwnerApi } from '../../services/api';

const CreateRestaurant = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    city: '',
    email: '',
    openingTime: '',
    closingTime: '',
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await restaurantOwnerApi.createRestaurant(formData);
      navigate('/restaurant-panel');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-restaurant-page">
      <header className="page-header">
        <Link to="/restaurant-panel" className="back-button">
          <ArrowLeft size={24} />
        </Link>
        <h1>Create Restaurant</h1>
      </header>

      <div className="create-form-container">
        {error && <div className="error-message">{error}</div>}

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label>Restaurant Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tasty Pizza"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Tell us about your restaurant, cuisine specialties..."
              />
            </div>

            <div className="form-group">
              <label>City *</label>
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
                <MapPin size={16} />
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, Street, Building"
                required
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

          <div className="form-actions">
            <Link to="/restaurant-panel" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? 'Creating...' : 'Create Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRestaurant;
