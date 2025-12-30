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
  ACCEPTED_BY_RESTAURANT: { label: 'Accepted', color: '#0288D1', icon: Package },
  PREPARING: { label: 'Preparing', color: '#7B1FA2', icon: Package },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', color: '#00796B', icon: Package },
  PICKED_UP: { label: 'Picked Up', color: '#5D4037', icon: Package },
  IN_DELIVERY: { label: 'In Delivery', color: '#E64A19', icon: Truck },
  DELIVERED: { label: 'Delivered', color: '#388E3C', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: '#D32F2F', icon: XCircle },
  REJECTED: { label: 'Rejected', color: '#C62828', icon: XCircle },
};

const AdminOrders = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
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
      const params = { page, size: 20 };
      let response;
      if (statusFilter) {
        response = await adminApi.getOrdersByStatus(statusFilter, params);
      } else {
        response = await adminApi.getAllOrders(params);
      }

      let list = response.data.content || response.data || [];
      let pages = response.data.totalPages || 1;

      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        const looksLikeId = /^[0-9a-fA-F-]{36}$/.test(trimmedSearch);
        if (looksLikeId) {
          try {
            const orderRes = await adminApi.getOrderById(trimmedSearch);
            list = [orderRes.data];
            pages = 1;
          } catch (err) {
            list = [];
            pages = 1;
          }
        } else {
          list = list.filter((order) =>
            order.deliveryAddress?.toLowerCase().includes(trimmedSearch.toLowerCase())
          );
          pages = 1;
        }
      }

      setOrders(list);
      setTotalPages(pages);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [authLoading, isAuthenticated, navigate, loadOrders]);

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
              placeholder="Search by ID or address..."
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
            <option value="ACCEPTED_BY_RESTAURANT">Accepted</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_DELIVERY">In Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {(authLoading || loading) ? (
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
                    <th>Address</th>
                    <th>Total</th>
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
                          <td>{order.restaurantId}</td>
                          <td>{order.deliveryAddress || '—'}</td>
                          <td>${Number(order.totalPrice || 0).toFixed(2)}</td>
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
