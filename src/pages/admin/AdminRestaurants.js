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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllRestaurants();
      setRestaurants(response.data || []);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
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
    loadRestaurants();
  }, [authLoading, isAuthenticated, navigate, loadRestaurants]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
  };

  const handleActivate = async (restaurantId) => {
    try {
      await adminApi.activateRestaurant(restaurantId);
      loadRestaurants();
    } catch (err) {
      console.error('Failed to activate restaurant:', err);
    }
  };

  const handleDeactivate = async (restaurantId) => {
    try {
      await adminApi.deactivateRestaurant(restaurantId);
      loadRestaurants();
    } catch (err) {
      console.error('Failed to deactivate restaurant:', err);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      !search ||
      restaurant.name?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (!statusFilter) return true;
    return statusFilter === 'ACTIVE' ? restaurant.isActive : !restaurant.isActive;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRestaurants.length / pageSize));
  const visibleRestaurants = filteredRestaurants.slice(
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
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {(authLoading || loading) ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="restaurants-grid admin">
              {visibleRestaurants.length === 0 ? (
                <div className="empty-state">
                  <Store size={48} />
                  <p>No restaurants found</p>
                </div>
              ) : (
                visibleRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className="restaurant-card-admin">
                    <div className="card-image">
                      <div className="placeholder">
                        <Store size={32} />
                      </div>
                      <span className={`status-badge ${restaurant.isActive ? 'active' : 'inactive'}`}>
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="card-content">
                      <h3>{restaurant.name}</h3>
                      {restaurant.description && (
                        <p className="cuisine">{restaurant.description}</p>
                      )}
                      <p className="address">
                        {restaurant.address}
                        {restaurant.city ? `, ${restaurant.city}` : ''}
                      </p>

                      <div className="card-meta">
                        {restaurant.averageRating && (
                          <span className="rating">
                            <Star size={14} fill="currentColor" />
                            {Number(restaurant.averageRating).toFixed(1)}
                          </span>
                        )}
                        <span className="orders">
                          {restaurant.totalReviews || 0} reviews
                        </span>
                      </div>

                      <div className="card-actions">
                        <button
                          onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        {restaurant.isActive ? (
                          <button
                            className="suspend"
                            onClick={() => handleDeactivate(restaurant.id)}
                            title="Deactivate"
                          >
                            <XCircle size={16} />
                          </button>
                        ) : (
                          <button
                            className="approve"
                            onClick={() => handleActivate(restaurant.id)}
                            title="Activate"
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
