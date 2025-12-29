import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Menu,
  ShoppingBag,
  BarChart3,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { restaurantOwnerApi } from '../../services/api';

const RestaurantDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const restaurantRes = await restaurantOwnerApi.getMyRestaurant();
      setRestaurant(restaurantRes.data);

      if (restaurantRes.data?.id) {
        const [statsRes, ordersRes] = await Promise.all([
          restaurantOwnerApi.getStatistics(restaurantRes.data.id, { period: 'today' }),
          restaurantOwnerApi.getRestaurantOrders(restaurantRes.data.id, { limit: 5 }),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.content || ordersRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      if (err.response?.status === 404) {
        setRestaurant(null);
      }
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

  const statusLabels = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    READY: 'Ready',
    DELIVERING: 'Delivering',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
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
    return (
      <div className="panel-page">
        <div className="panel-sidebar">
          <div className="panel-logo">
            <span>Restaurant Panel</span>
          </div>
          <nav className="panel-nav">
            <Link to="/" className="nav-item">
              <Home size={20} />
              Home
            </Link>
          </nav>
        </div>
        <div className="panel-content">
          <div className="no-restaurant">
            <Package size={64} />
            <h2>You don't have a restaurant yet</h2>
            <p>Create your restaurant to start receiving orders</p>
            <Link to="/restaurant-panel/create" className="btn-primary">
              <Plus size={20} />
              Create Restaurant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-page">
      <div className="panel-sidebar">
        <div className="panel-logo">
          <span>{restaurant.name}</span>
        </div>
        <nav className="panel-nav">
          <Link to="/restaurant-panel" className="nav-item active">
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
          <Link to="/restaurant-panel/settings" className="nav-item">
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
          <h1>Dashboard</h1>
          <p>Welcome, {user?.firstName || 'owner'}!</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon orders">
              <ShoppingBag size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.ordersToday || 0}</span>
              <span className="stat-label">Orders Today</span>
            </div>
            {stats?.ordersChange > 0 ? (
              <span className="stat-change positive">
                <TrendingUp size={14} />
                +{stats.ordersChange}%
              </span>
            ) : stats?.ordersChange < 0 ? (
              <span className="stat-change negative">
                <TrendingDown size={14} />
                {stats.ordersChange}%
              </span>
            ) : null}
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
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.pendingOrders || 0}</span>
              <span className="stat-label">Pending Orders</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.completedToday || 0}</span>
              <span className="stat-label">Completed Today</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/restaurant-panel/orders" className="link-btn">
              All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customerName || 'Customer'}</td>
                      <td>${order.totalAmount}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleTimeString('en-US')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
