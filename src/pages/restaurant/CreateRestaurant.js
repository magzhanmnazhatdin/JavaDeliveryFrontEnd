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
    cuisine: '',
    address: '',
    phone: '',
    deliveryTime: '30',
    minOrder: '1000',
    image: '',
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
      const data = {
        ...formData,
        deliveryTime: parseInt(formData.deliveryTime) || 30,
        minOrder: parseFloat(formData.minOrder) || 0,
      };

      await restaurantOwnerApi.createRestaurant(data);
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
              <label>Cuisine Type *</label>
              <select
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                required
              >
                <option value="">Select cuisine type</option>
                <option value="Burgers">Burgers</option>
                <option value="Pizza">Pizza</option>
                <option value="Sushi">Sushi</option>
                <option value="Asian">Asian</option>
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Desserts">Desserts</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
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
          </div>

          <div className="form-section">
            <h3>Delivery Settings</h3>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Clock size={16} />
                  Delivery Time (min)
                </label>
                <input
                  type="number"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  min="10"
                  max="180"
                />
              </div>

              <div className="form-group">
                <label>Minimum Order ($)</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  min="0"
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
