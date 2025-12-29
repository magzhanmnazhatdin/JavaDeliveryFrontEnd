import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Navigation,
  User,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Clock,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courierApi } from '../../services/api';

const CourierDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes, deliveriesRes] = await Promise.all([
        courierApi.getCourierProfile(),
        courierApi.getCourierStats(),
        courierApi.getMyDeliveriesAsCourier(),
      ]);
      setProfile(profileRes.data);
      setStats(statsRes.data);
      setActiveDeliveries(
        (deliveriesRes.data || []).filter(
          (d) => !['DELIVERED', 'CANCELLED'].includes(d.status)
        )
      );
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDashboard();
  }, [isAuthenticated, navigate, loadDashboard]);

  const toggleAvailability = async () => {
    try {
      await courierApi.toggleAvailability();
      setProfile((prev) => ({ ...prev, available: !prev?.available }));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
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

  return (
    <div className="panel-page courier-panel">
      <div className="panel-sidebar">
        <div className="panel-logo">
          <span>Courier</span>
        </div>
        <nav className="panel-nav">
          <Link to="/courier-panel" className="nav-item active">
            <Package size={20} />
            Dashboard
          </Link>
          <Link to="/courier-panel/deliveries" className="nav-item">
            <Navigation size={20} />
            Deliveries
          </Link>
          <Link to="/courier-panel/profile" className="nav-item">
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
          <div>
            <h1>Courier Dashboard</h1>
            <p>Hello, {user?.firstName || 'courier'}!</p>
          </div>
          <button
            className={`availability-toggle ${profile?.available ? 'available' : ''}`}
            onClick={toggleAvailability}
          >
            {profile?.available ? (
              <>
                <ToggleRight size={24} />
                Online
              </>
            ) : (
              <>
                <ToggleLeft size={24} />
                Offline
              </>
            )}
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon completed">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.deliveriesToday || 0}</span>
              <span className="stat-label">Deliveries Today</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">${stats?.earningsToday || 0}</span>
              <span className="stat-label">Earned Today</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{activeDeliveries.length}</span>
              <span className="stat-label">Active Deliveries</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.totalDeliveries || 0}</span>
              <span className="stat-label">Total Deliveries</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Active Deliveries</h2>
            <Link to="/courier-panel/deliveries" className="link-btn">
              All Deliveries
            </Link>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>No active deliveries</p>
              <Link to="/courier-panel/deliveries" className="btn-primary">
                Find Orders
              </Link>
            </div>
          ) : (
            <div className="deliveries-list">
              {activeDeliveries.slice(0, 3).map((delivery) => (
                <Link
                  to={`/courier-panel/delivery/${delivery.id}`}
                  key={delivery.id}
                  className="delivery-card"
                >
                  <div className="delivery-info">
                    <h3>Order #{delivery.orderId}</h3>
                    <p className="restaurant">{delivery.restaurantName}</p>
                  </div>
                  <div className="delivery-address">
                    <MapPin size={16} />
                    <span>{delivery.deliveryAddress}</span>
                  </div>
                  <div className="delivery-meta">
                    <span className={`status ${delivery.status.toLowerCase()}`}>
                      {delivery.status === 'ASSIGNED' && 'Assigned'}
                      {delivery.status === 'PICKED_UP' && 'Picked Up'}
                      {delivery.status === 'IN_TRANSIT' && 'In Transit'}
                    </span>
                    <span className="amount">${delivery.amount}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourierDashboard;
