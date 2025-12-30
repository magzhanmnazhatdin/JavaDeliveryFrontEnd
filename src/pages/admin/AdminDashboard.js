import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Store,
  ShoppingBag,
  Truck,
  BarChart3,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const AdminDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const pageParams = { size: 1 };
      const [
        usersRes,
        restaurantsRes,
        couriersRes,
        ordersRes,
        pendingRes,
        confirmedRes,
        acceptedRes,
        preparingRes,
        readyRes,
        pickedUpRes,
        inDeliveryRes,
      ] = await Promise.all([
        adminApi.getAllUsers(pageParams),
        adminApi.getAllRestaurants(),
        adminApi.getAllCouriers(),
        adminApi.getAllOrders(pageParams),
        adminApi.getOrdersByStatus('PENDING', pageParams),
        adminApi.getOrdersByStatus('CONFIRMED', pageParams),
        adminApi.getOrdersByStatus('ACCEPTED_BY_RESTAURANT', pageParams),
        adminApi.getOrdersByStatus('PREPARING', pageParams),
        adminApi.getOrdersByStatus('READY_FOR_PICKUP', pageParams),
        adminApi.getOrdersByStatus('PICKED_UP', pageParams),
        adminApi.getOrdersByStatus('IN_DELIVERY', pageParams),
      ]);

      const getTotal = (res) =>
        res?.data?.totalElements ??
        res?.data?.content?.length ??
        res?.data?.length ??
        0;

      const totalUsers = getTotal(usersRes);
      const totalRestaurants = getTotal(restaurantsRes);
      const totalCouriers = getTotal(couriersRes);
      const availableCouriers = (couriersRes.data || []).filter(
        (courier) => courier.status === 'AVAILABLE'
      ).length;
      const totalOrders = getTotal(ordersRes);
      const activeOrders =
        getTotal(pendingRes) +
        getTotal(confirmedRes) +
        getTotal(acceptedRes) +
        getTotal(preparingRes) +
        getTotal(readyRes) +
        getTotal(pickedUpRes) +
        getTotal(inDeliveryRes);

      setStats({
        totalUsers,
        totalRestaurants,
        totalOrders,
        activeOrders,
        totalCouriers,
        availableCouriers,
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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
    loadDashboard();
  }, [authLoading, isAuthenticated, navigate, loadDashboard]);

  if (authLoading || loading) {
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
          </div>

          <div className="stat-card">
            <div className="stat-icon restaurants">
              <Store size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.totalRestaurants || 0}</span>
              <span className="stat-label">Restaurants</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">
              <ShoppingBag size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.totalOrders || 0}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon couriers">
              <Truck size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.totalCouriers || 0}</span>
              <span className="stat-label">Couriers</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats?.availableCouriers || 0}</span>
              <span className="stat-label">Couriers Available</span>
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
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/admin/users" className="action-btn">
                <Users size={20} />
                Manage Users
              </Link>
              <Link to="/admin/restaurants" className="action-btn">
                <Store size={20} />
                Manage Restaurants
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
