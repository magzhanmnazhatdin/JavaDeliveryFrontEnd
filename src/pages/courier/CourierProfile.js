import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Navigation,
  User,
  Save,
  Phone,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courierApi } from '../../services/api';

const CourierProfile = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const isDevPhone = (phone) => phone && phone.startsWith('dev-');

  const formatPhone = (phone) => {
    if (!phone) return '—';
    if (isDevPhone(phone)) return 'Set phone';
    if (phone.length > 16) {
      return `${phone.slice(0, 6)}...${phone.slice(-4)}`;
    }
    return phone;
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileRes = await courierApi.getCourierProfile();
      setProfile(profileRes.data);
      setFormData({
        name: profileRes.data.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        phone: isDevPhone(profileRes.data.phone) ? '' : profileRes.data.phone || '',
        email: profileRes.data.email || user?.email || '',
      });

      const deliveriesRes = await courierApi.getMyDeliveriesAsCourier();
      const deliveries = deliveriesRes.data || [];
      const totalDeliveries = deliveries.filter((d) => d.status === 'DELIVERED').length;
      setStats({ totalDeliveries });
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
        setFormData({
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          phone: '',
          email: user?.email || '',
        });
        setStats({ totalDeliveries: 0 });
      } else {
        console.error('Failed to load profile:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [authLoading, isAuthenticated, navigate, loadProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {};
      if (formData.name?.trim()) payload.name = formData.name.trim();
      if (formData.phone?.trim()) payload.phone = formData.phone.trim();
      if (formData.email?.trim()) payload.email = formData.email.trim();

      if (Object.keys(payload).length === 0) {
        setMessage({ type: 'error', text: 'Please fill at least one field' });
        setSaving(false);
        return;
      }

      await courierApi.updateCourierProfile(payload);
      setProfile((prev) => ({
        ...prev,
        ...payload,
      }));
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
      setProfile((prev) => {
        if (!prev) return prev;
        const nextStatus = prev.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
        return { ...prev, status: nextStatus };
      });
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading || loading) {
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
              className={`availability-toggle ${profile?.status === 'AVAILABLE' ? 'available' : ''}`}
              onClick={toggleAvailability}
            >
              {profile?.status === 'AVAILABLE' ? (
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
                <span className="value">{profile?.status || '—'}</span>
                <span className="label">Status</span>
              </div>
              <div className="stat">
                <span className="value">{formatPhone(profile?.phone)}</span>
                <span className="label">Phone</span>
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
                  User
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Courier name"
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
                  placeholder="courier@example.com"
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
