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
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const AdminCouriers = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const loadCouriers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllCouriers();
      setCouriers(response.data || []);
    } catch (err) {
      console.error('Failed to load couriers:', err);
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
    loadCouriers();
  }, [authLoading, isAuthenticated, navigate, loadCouriers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
  };

  const handleActivate = async (courierId) => {
    try {
      await adminApi.updateCourierStatus(courierId, 'AVAILABLE');
      loadCouriers();
    } catch (err) {
      console.error('Failed to update courier status:', err);
    }
  };

  const handleDeactivate = async (courierId) => {
    try {
      await adminApi.updateCourierStatus(courierId, 'OFFLINE');
      loadCouriers();
    } catch (err) {
      console.error('Failed to update courier status:', err);
    }
  };

  const filteredCouriers = couriers.filter((courier) => {
    const matchesSearch =
      !search ||
      courier.name?.toLowerCase().includes(search.toLowerCase()) ||
      courier.email?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (!statusFilter) return true;
    return courier.status === statusFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCouriers.length / pageSize));
  const visibleCouriers = filteredCouriers.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

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
          <Link to="/admin/orders" className="nav-item">
            <ShoppingBag size={20} />
            Orders
          </Link>
          <Link to="/admin/couriers" className="nav-item active">
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
          <h1>Couriers</h1>
        </div>

        <div className="filters-bar">
          <form className="search-form" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name..."
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
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>

        {(authLoading || loading) ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="couriers-grid">
              {visibleCouriers.length === 0 ? (
                <div className="empty-state">
                  <Truck size={48} />
                  <p>No couriers found</p>
                </div>
              ) : (
                visibleCouriers.map((courier) => (
                  <div key={courier.id} className="courier-card">
                    <div className="courier-header">
                      <div className="courier-avatar">
                        {courier.name?.charAt(0)}
                      </div>
                      <div className="courier-info">
                        <h3>{courier.name || 'Courier'}</h3>
                        <span className={`status ${courier.status?.toLowerCase()}`}>
                          {courier.status || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="courier-details">
                      {courier.phone && (
                        <div className="detail">
                          <Phone size={14} />
                          {courier.phone}
                        </div>
                      )}
                      {courier.email && (
                        <div className="detail">
                          <Mail size={14} />
                          {courier.email}
                        </div>
                      )}
                    </div>

                    <div className="courier-stats">
                      <div className="stat">
                        <span className="value">—</span>
                        <span className="label">Deliveries</span>
                      </div>
                      <div className="stat">
                        <span className="value">—</span>
                        <span className="label">Rating</span>
                      </div>
                    </div>

                    <div className="courier-actions">
                      {courier.status === 'OFFLINE' && (
                        <button
                          className="approve"
                          onClick={() => handleActivate(courier.id)}
                        >
                          <CheckCircle size={16} />
                          Set Available
                        </button>
                      )}
                      {courier.status === 'AVAILABLE' && (
                        <button
                          className="suspend"
                          onClick={() => handleDeactivate(courier.id)}
                        >
                          <XCircle size={16} />
                          Set Offline
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
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

export default AdminCouriers;
