import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Menu,
  ShoppingBag,
  BarChart3,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { restaurantOwnerApi, restaurantApi } from '../../services/api';

const MenuManagement = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true,
  });

  const loadMenu = useCallback(async () => {
    try {
      setLoading(true);
      const restaurantRes = await restaurantOwnerApi.getMyRestaurant();
      setRestaurant(restaurantRes.data);

      if (restaurantRes.data?.id) {
        const [menuRes, categoriesRes] = await Promise.all([
          restaurantApi.getMenu(restaurantRes.data.id, false),
          restaurantApi.getCategories(restaurantRes.data.id),
        ]);
        setMenuItems(menuRes.data);
        setCategories(['All', ...categoriesRes.data]);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadMenu();
  }, [isAuthenticated, navigate, loadMenu]);

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      available: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || '',
      image: item.image || '',
      available: item.available,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingItem) {
        await restaurantOwnerApi.updateMenuItem(editingItem.id, data);
      } else {
        await restaurantOwnerApi.addMenuItem(restaurant.id, data);
      }

      setShowModal(false);
      loadMenu();
    } catch (err) {
      console.error('Failed to save menu item:', err);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await restaurantOwnerApi.deleteMenuItem(itemId);
      loadMenu();
    } catch (err) {
      console.error('Failed to delete menu item:', err);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await restaurantOwnerApi.toggleMenuItemAvailability(item.id);
      setMenuItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, available: !i.available } : i
        )
      );
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
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
    navigate('/restaurant-panel');
    return null;
  }

  return (
    <div className="panel-page">
      <div className="panel-sidebar">
        <div className="panel-logo">
          <span>{restaurant.name}</span>
        </div>
        <nav className="panel-nav">
          <Link to="/restaurant-panel" className="nav-item">
            <BarChart3 size={20} />
            Dashboard
          </Link>
          <Link to="/restaurant-panel/menu" className="nav-item active">
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
          <div>
            <h1>Menu Management</h1>
            <p>{menuItems.length} items in menu</p>
          </div>
          <button className="btn-primary" onClick={openAddModal}>
            <Plus size={20} />
            Add Item
          </button>
        </div>

        <div className="menu-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <Menu size={48} />
              <p>No items in this category</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className={`menu-card ${!item.available ? 'unavailable' : ''}`}>
                <div className="menu-card-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="placeholder">
                      <Menu size={24} />
                    </div>
                  )}
                  {!item.available && (
                    <div className="unavailable-overlay">Unavailable</div>
                  )}
                </div>
                <div className="menu-card-content">
                  <h3>{item.name}</h3>
                  <p className="description">{item.description}</p>
                  <div className="menu-card-footer">
                    <span className="price">${item.price}</span>
                    <span className="category">{item.category}</span>
                  </div>
                  <div className="menu-card-actions">
                    <button onClick={() => handleToggleAvailability(item)} title="Toggle availability">
                      {item.available ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button onClick={() => openEditModal(item)} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="delete" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowModal(false)} />
          <div className="modal">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Main Dishes"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  />
                  Available for order
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  {editingItem ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default MenuManagement;
