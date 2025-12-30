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
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const roleLabels = {
  CUSTOMER: 'Customer',
  RESTAURANT: 'Restaurant',
  COURIER: 'Courier',
  ADMIN: 'Admin',
};

const AdminUsers = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers({
        search,
        role: roleFilter || undefined,
        page,
        size: 20,
      });
      setUsers(response.data.content || response.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUsers();
  }, [authLoading, isAuthenticated, navigate, loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadUsers();
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
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
          <Link to="/admin/users" className="nav-item active">
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
          <h1>Users</h1>
        </div>

        <div className="filters-bar">
          <form className="search-form" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="RESTAURANT">Restaurants</option>
            <option value="COURIER">Couriers</option>
            <option value="ADMIN">Admins</option>
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          {user.fullName || user.email}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role?.toLowerCase()}`}>
                            {roleLabels[user.role] || user.role}
                          </span>
                        </td>
                        <td>{user.status || '—'}</td>
                        <td className="actions">
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="danger"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
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

export default AdminUsers;
