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
  Eye,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const AdminRestaurants = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllRestaurants({
        search,
        status: statusFilter || undefined,
        page,
        size: 20,
      });
      setRestaurants(response.data.content || response.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadRestaurants();
  }, [isAuthenticated, navigate, loadRestaurants]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadRestaurants();
  };

  const handleApprove = async (restaurantId) => {
    try {
      await adminApi.approveRestaurant(restaurantId);
      loadRestaurants();
    } catch (err) {
      console.error('Failed to approve restaurant:', err);
    }
  };

  const handleSuspend = async (restaurantId) => {
    const reason = window.prompt('Enter suspension reason:');
    if (!reason) return;
    try {
      await adminApi.suspendRestaurant(restaurantId, reason);
      loadRestaurants();
    } catch (err) {
      console.error('Failed to suspend restaurant:', err);
    }
  };

  const statusLabels = {
    PENDING: 'Pending',
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    INACTIVE: 'Inactive',
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
          <Link to="/admin/restaurants" className="nav-item active">
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
          <h1>Restaurants</h1>
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
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="restaurants-grid admin">
              {restaurants.length === 0 ? (
                <div className="empty-state">
                  <Store size={48} />
                  <p>No restaurants found</p>
                </div>
              ) : (
                restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="restaurant-card-admin">
                    <div className="card-image">
                      {restaurant.image ? (
                        <img src={restaurant.image} alt={restaurant.name} />
                      ) : (
                        <div className="placeholder">
                          <Store size={32} />
                        </div>
                      )}
                      <span className={`status-badge ${restaurant.status?.toLowerCase()}`}>
                        {statusLabels[restaurant.status] || restaurant.status}
                      </span>
                    </div>

                    <div className="card-content">
                      <h3>{restaurant.name}</h3>
                      <p className="cuisine">{restaurant.cuisine}</p>
                      <p className="address">{restaurant.address}</p>

                      <div className="card-meta">
                        {restaurant.rating && (
                          <span className="rating">
                            <Star size={14} fill="currentColor" />
                            {restaurant.rating}
                          </span>
                        )}
                        <span className="orders">
                          {restaurant.totalOrders || 0} orders
                        </span>
                      </div>

                      <div className="card-actions">
                        <button
                          onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        {restaurant.status === 'PENDING' && (
                          <button
                            className="approve"
                            onClick={() => handleApprove(restaurant.id)}
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {restaurant.status === 'ACTIVE' && (
                          <button
                            className="suspend"
                            onClick={() => handleSuspend(restaurant.id)}
                            title="Suspend"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        {restaurant.status === 'SUSPENDED' && (
                          <button
                            className="approve"
                            onClick={() => handleApprove(restaurant.id)}
                            title="Reactivate"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
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

export default AdminRestaurants;
