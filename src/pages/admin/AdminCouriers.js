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
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const vehicleLabels = {
  WALKING: 'Walking',
  BICYCLE: 'Bicycle',
  SCOOTER: 'Scooter',
  MOTORCYCLE: 'Motorcycle',
  CAR: 'Car',
};

const AdminCouriers = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadCouriers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllCouriers({
        search,
        status: statusFilter || undefined,
        page,
        size: 20,
      });
      setCouriers(response.data.content || response.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load couriers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCouriers();
  }, [isAuthenticated, navigate, loadCouriers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadCouriers();
  };

  const handleApprove = async (courierId) => {
    try {
      await adminApi.approveCourier(courierId);
      loadCouriers();
    } catch (err) {
      console.error('Failed to approve courier:', err);
    }
  };

  const handleSuspend = async (courierId) => {
    if (!window.confirm('Suspend this courier?')) return;
    try {
      await adminApi.suspendCourier(courierId);
      loadCouriers();
    } catch (err) {
      console.error('Failed to suspend courier:', err);
    }
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
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="couriers-grid">
              {couriers.length === 0 ? (
                <div className="empty-state">
                  <Truck size={48} />
                  <p>No couriers found</p>
                </div>
              ) : (
                couriers.map((courier) => (
                  <div key={courier.id} className="courier-card">
                    <div className="courier-header">
                      <div className="courier-avatar">
                        {courier.firstName?.charAt(0)}
                        {courier.lastName?.charAt(0)}
                      </div>
                      <div className="courier-info">
                        <h3>
                          {courier.firstName} {courier.lastName}
                        </h3>
                        <span className={`status ${courier.status?.toLowerCase()}`}>
                          {courier.status === 'PENDING' && 'Pending'}
                          {courier.status === 'ACTIVE' && (courier.available ? 'Online' : 'Offline')}
                          {courier.status === 'SUSPENDED' && 'Suspended'}
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
                      {courier.vehicleType && (
                        <div className="detail">
                          <Truck size={14} />
                          {vehicleLabels[courier.vehicleType] || courier.vehicleType}
                          {courier.vehicleNumber && ` (${courier.vehicleNumber})`}
                        </div>
                      )}
                    </div>

                    <div className="courier-stats">
                      <div className="stat">
                        <span className="value">{courier.totalDeliveries || 0}</span>
                        <span className="label">Deliveries</span>
                      </div>
                      <div className="stat">
                        <span className="value">
                          {courier.rating ? (
                            <>
                              <Star size={12} fill="currentColor" />
                              {courier.rating.toFixed(1)}
                            </>
                          ) : (
                            '—'
                          )}
                        </span>
                        <span className="label">Rating</span>
                      </div>
                    </div>

                    <div className="courier-actions">
                      {courier.status === 'PENDING' && (
                        <>
                          <button
                            className="approve"
                            onClick={() => handleApprove(courier.id)}
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>
                          <button
                            className="reject"
                            onClick={() => handleSuspend(courier.id)}
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}
                      {courier.status === 'ACTIVE' && (
                        <button
                          className="suspend"
                          onClick={() => handleSuspend(courier.id)}
                        >
                          <XCircle size={16} />
                          Suspend
                        </button>
                      )}
                      {courier.status === 'SUSPENDED' && (
                        <button
                          className="approve"
                          onClick={() => handleApprove(courier.id)}
                        >
                          <CheckCircle size={16} />
                          Reactivate
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
