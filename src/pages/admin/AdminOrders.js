import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Store,
  ShoppingBag,
  Truck,
  BarChart3,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const statusConfig = {
  PENDING: { label: 'Pending', color: '#FFA000', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: '#1976D2', icon: Package },
  PREPARING: { label: 'Preparing', color: '#7B1FA2', icon: Package },
  READY: { label: 'Ready', color: '#00796B', icon: Package },
  DELIVERING: { label: 'Delivering', color: '#E64A19', icon: Truck },
  DELIVERED: { label: 'Delivered', color: '#388E3C', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: '#D32F2F', icon: XCircle },
};

const AdminOrders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllOrders({
        search,
        status: statusFilter || undefined,
        page,
        size: 20,
      });
      setOrders(response.data.content || response.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate, loadOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadOrders();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="panel-page admin-panel">
      <div className="panel-sidebar">
        <div className="panel-logo">
          <span>Admin Panel</span>
        </div>
        <nav className="panel-nav">
          <Link to="/admin" className="nav-item">
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
          <Link to="/admin/orders" className="nav-item active">
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
          <h1>Orders</h1>
          <button className="btn-secondary" onClick={loadOrders}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="filters-bar">
          <form className="search-form" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="DELIVERING">Delivering</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Restaurant</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const status = statusConfig[order.status] || statusConfig.PENDING;
                      const StatusIcon = status.icon;

                      return (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>{order.restaurantName}</td>
                          <td>
                            <div className="customer-info">
                              <span>{order.customerName}</span>
                              <small>{order.customerEmail}</small>
                            </div>
                          </td>
                          <td>${order.totalAmount}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: `${status.color}20`,
                                color: status.color,
                              }}
                            >
                              <StatusIcon size={14} />
                              {status.label}
                            </span>
                          </td>
                          <td className="actions">
                            <button
                              onClick={() => navigate(`/order/${order.id}`)}
                              title="Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <span>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
