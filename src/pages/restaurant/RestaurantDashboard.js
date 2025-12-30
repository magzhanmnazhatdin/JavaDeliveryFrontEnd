import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Menu,
  ShoppingBag,
  BarChart3,
  Settings,
  Plus,
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
        const ordersRes = await restaurantOwnerApi.getRestaurantOrders(
          restaurantRes.data.id,
          { size: 50, sort: 'createdAt,desc' }
        );
        const orders = ordersRes.data.content || ordersRes.data || [];
        setRecentOrders(orders.slice(0, 5));

        const today = new Date();
        const isToday = (value) => {
          const date = new Date(value);
          return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
          );
        };

        const ordersToday = orders.filter((order) => isToday(order.createdAt));
        const revenueToday = ordersToday.reduce(
          (sum, order) => sum + Number(order.totalPrice || 0),
          0
        );
        const pendingOrders = orders.filter((order) =>
          ['PENDING', 'CONFIRMED', 'ACCEPTED_BY_RESTAURANT', 'PREPARING'].includes(order.status)
        ).length;
        const completedToday = ordersToday.filter(
          (order) => order.status === 'DELIVERED'
        ).length;

        setStats({
          ordersToday: ordersToday.length,
          revenueToday,
          pendingOrders,
          completedToday,
        });
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
    ACCEPTED_BY_RESTAURANT: 'Accepted',
    PREPARING: 'Preparing',
    READY_FOR_PICKUP: 'Ready for Pickup',
    PICKED_UP: 'Picked Up',
    IN_DELIVERY: 'In Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
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
                      <td>Customer</td>
                      <td>${Number(order.totalPrice || 0).toFixed(2)}</td>
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
