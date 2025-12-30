import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addressApi } from '../services/api';

const ProfilePage = () => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAddresses = useCallback(async () => {
    try {
      const response = await addressApi.getMyAddresses();
      setAddresses(response.data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
    loadAddresses();
  }, [isAuthenticated, user, navigate, loadAddresses]);

  const formatAddress = (address) => {
    if (!address) return '';
    if (address.fullAddress) return address.fullAddress;
    const parts = [
      address.streetAddress,
      address.apartment ? `Apt ${address.apartment}` : null,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await updateProfile(formData);
    if (result.success) {
      setEditing(false);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressApi.delete(id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressApi.setDefault(id);
      loadAddresses();
    } catch (err) {
      setError('Failed to set default address');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={24} />
        </Link>
        <h1>Profile</h1>
      </header>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="user-card">
            <div className="user-avatar">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </div>
            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <p>{user.email}</p>
          </div>

          <nav className="profile-nav">
            <button
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              Personal Info
              <ChevronRight size={16} />
            </button>
            <button
              className={activeTab === 'addresses' ? 'active' : ''}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={20} />
              Delivery Addresses
              <ChevronRight size={16} />
            </button>
            <Link to="/orders">
              <Settings size={20} />
              Order History
              <ChevronRight size={16} />
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              Log Out
            </button>
          </nav>
        </div>

        <div className="profile-main">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Personal Info</h2>
                {!editing && (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    <Edit2 size={16} />
                    Edit
                  </button>
                )}
              </div>

              {error && <div className="profile-error">{error}</div>}

              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>
                    <Mail size={18} />
                    Email
                  </label>
                  <input type="email" value={user.email} disabled />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <User size={18} />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={!editing}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <User size={18} />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={18} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!editing}
                  />
                </div>

                {editing && (
                  <div className="form-actions">
                    <button type="button" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Delivery Addresses</h2>
                <button className="add-btn">
                  <Plus size={16} />
                  Add Address
                </button>
              </div>

              <div className="addresses-list">
                {addresses.length === 0 ? (
                  <p className="no-data">No saved addresses</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="address-card">
                      <div className="address-info">
                        <p className="address-main">
                          {addr.label || 'Delivery Address'}
                        </p>
                        <p className="address-details">
                          {formatAddress(addr)}
                        </p>
                        {addr.isDefault && (
                          <span className="default-badge">Default</span>
                        )}
                      </div>
                      <div className="address-actions">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            title="Set as default"
                          >
                            Set as default
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
