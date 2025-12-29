import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Store,
  ShoppingBag,
  Truck,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats();
      setStats(response.data);
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

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="panel-page admin-panel">
      <div className="panel-sidebar">
        <div className="panel-logo">
          <span>Admin Panel</span>
        </div>
        <nav className="panel-nav">
          <Link to="/admin" className="nav-item active">
            <BarChart3 size={20} />
            Dashboard
          </Link>
          <Link to="/admin/users" className="nav-item">
            <Users size={20} />
            Users
          </Link>
          <Link to="/admin/restaurants" className="nav-item">
            <Store size={20} />
            Restaurants
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <ShoppingBag size={20} />
            Orders
          </Link>
          <Link to="/admin/couriers" className="nav-item">
            <Truck size={20} />
            Couriers
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
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.firstName || 'admin'}!</p>
          </div>
        </div>

        <div className="stats-grid large">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.totalUsers || 0}</span>
              <span className="stat-label">Users</span>
            </div>
            {stats?.newUsersToday > 0 && (
              <span className="stat-change positive">
                <TrendingUp size={14} />
                +{stats.newUsersToday} today
              </span>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-icon restaurants">
              <Store size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.totalRestaurants || 0}</span>
              <span className="stat-label">Restaurants</span>
            </div>
            {stats?.pendingRestaurants > 0 && (
              <span className="stat-change warning">
                <AlertCircle size={14} />
                {stats.pendingRestaurants} pending
              </span>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">
              <ShoppingBag size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.ordersToday || 0}</span>
              <span className="stat-label">Orders Today</span>
            </div>
            {stats?.ordersChange && (
              <span className={`stat-change ${stats.ordersChange > 0 ? 'positive' : 'negative'}`}>
                {stats.ordersChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stats.ordersChange > 0 ? '+' : ''}{stats.ordersChange}%
              </span>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <BarChart3 size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">${stats?.revenueToday || 0}</span>
              <span className="stat-label">Revenue Today</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon couriers">
              <Truck size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.activeCouriers || 0}</span>
              <span className="stat-label">Couriers Online</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.activeOrders || 0}</span>
              <span className="stat-label">Active Orders</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Needs Attention</h2>
            </div>
            <div className="alerts-list">
              {stats?.pendingRestaurants > 0 && (
                <Link to="/admin/restaurants?status=pending" className="alert-item warning">
                  <AlertCircle size={20} />
                  <span>{stats.pendingRestaurants} restaurants pending approval</span>
                </Link>
              )}
              {stats?.pendingCouriers > 0 && (
                <Link to="/admin/couriers?status=pending" className="alert-item warning">
                  <AlertCircle size={20} />
                  <span>{stats.pendingCouriers} courier applications</span>
                </Link>
              )}
              {stats?.problemOrders > 0 && (
                <Link to="/admin/orders?status=problem" className="alert-item danger">
                  <AlertCircle size={20} />
                  <span>{stats.problemOrders} problem orders</span>
                </Link>
              )}
              {!stats?.pendingRestaurants && !stats?.pendingCouriers && !stats?.problemOrders && (
                <div className="alert-item success">
                  <CheckCircle size={20} />
                  <span>All clear, no urgent tasks</span>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/admin/users" className="action-btn">
                <Users size={20} />
                Manage Users
              </Link>
              <Link to="/admin/restaurants" className="action-btn">
                <Store size={20} />
                Moderate Restaurants
              </Link>
              <Link to="/admin/orders" className="action-btn">
                <ShoppingBag size={20} />
                Monitor Orders
              </Link>
              <Link to="/admin/couriers" className="action-btn">
                <Truck size={20} />
                Manage Couriers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
