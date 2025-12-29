import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Navigation,
  User,
  Save,
  Phone,
  Car,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courierApi } from '../../services/api';

const CourierProfile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        courierApi.getCourierProfile(),
        courierApi.getCourierStats(),
      ]);
      setProfile(profileRes.data);
      setStats(statsRes.data);
      setFormData({
        phone: profileRes.data.phone || '',
        vehicleType: profileRes.data.vehicleType || '',
        vehicleNumber: profileRes.data.vehicleNumber || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated, navigate, loadProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await courierApi.updateCourierProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      await courierApi.toggleAvailability();
      setProfile((prev) => ({ ...prev, available: !prev?.available }));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="panel-page courier-panel">
      <div className="panel-sidebar">
        <div className="panel-logo">
          <span>Courier</span>
        </div>
        <nav className="panel-nav">
          <Link to="/courier-panel" className="nav-item">
            <Package size={20} />
            Dashboard
          </Link>
          <Link to="/courier-panel/deliveries" className="nav-item">
            <Navigation size={20} />
            Deliveries
          </Link>
          <Link to="/courier-panel/profile" className="nav-item active">
            <User size={20} />
            Profile
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
          <h1>Courier Profile</h1>
        </div>

        <div className="profile-layout">
          <div className="profile-card">
            <div className="profile-avatar">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <h2>
              {user?.firstName} {user?.lastName}
            </h2>
            <p>{user?.email}</p>

            <button
              className={`availability-toggle ${profile?.available ? 'available' : ''}`}
              onClick={toggleAvailability}
            >
              {profile?.available ? (
                <>
                  <ToggleRight size={20} />
                  Online
                </>
              ) : (
                <>
                  <ToggleLeft size={20} />
                  Offline
                </>
              )}
            </button>

            <div className="profile-stats">
              <div className="stat">
                <span className="value">{stats?.totalDeliveries || 0}</span>
                <span className="label">Total Deliveries</span>
              </div>
              <div className="stat">
                <span className="value">{stats?.rating || '—'}</span>
                <span className="label">Rating</span>
              </div>
              <div className="stat">
                <span className="value">${stats?.totalEarnings || 0}</span>
                <span className="label">Total Earned</span>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>

          <div className="profile-form-section">
            <h3>Profile Settings</h3>

            {message && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit}>
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
                  <Car size={16} />
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <option value="">Select type</option>
                  <option value="WALKING">Walking</option>
                  <option value="BICYCLE">Bicycle</option>
                  <option value="SCOOTER">Scooter</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="CAR">Car</option>
                </select>
              </div>

              <div className="form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  placeholder="A123BC"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                <Save size={18} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierProfile;
