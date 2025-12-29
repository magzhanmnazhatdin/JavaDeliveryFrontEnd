import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  X,
  Plus,
  Minus,
  Heart,
  User,
  Utensils,
} from 'lucide-react';
import { restaurantApi, favoritesApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  const { cart, isCartOpen, setIsCartOpen, updateQuantity, totalPrice, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'burgers', name: 'Burgers', icon: '🍔' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'sushi', name: 'Sushi', icon: '🍣' },
    { id: 'asian', name: 'Asian', icon: '🍜' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
  ];

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await restaurantApi.getAll({ activeOnly: true });
      setRestaurants(response.data.content || response.data || []);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const response = await favoritesApi.getAll();
      setFavorites(new Set(response.data));
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated, loadRestaurants, loadFavorites]);

  const toggleFavorite = async (restaurantId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (favorites.has(restaurantId)) {
        await favoritesApi.remove(restaurantId);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(restaurantId);
          return next;
        });
      } else {
        await favoritesApi.add(restaurantId);
        setFavorites((prev) => new Set([...prev, restaurantId]));
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCategory = selectedCategory === 'All' || r.cuisine === selectedCategory;
    const matchesSearch =
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
    setIsCartOpen(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-text">delivery</span>
          </Link>

          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="icon-btn location-btn">
              <MapPin size={18} />
            </button>

            <button className="icon-btn cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={18} />
              {totalItems > 0 && <span className="badge">{totalItems}</span>}
            </button>

            {isAuthenticated ? (
              <Link to="/profile" className="icon-btn user-btn">
                <User size={18} />
              </Link>
            ) : (
              <Link to="/login" className="text-btn">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1>Food Delivery</h1>
        <p>Best restaurants in your city</p>
      </section>

      {/* Categories */}
      <div className="categories">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-chip ${selectedCategory === category.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.name)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Restaurants */}
      <main className="main-content">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state">
            <Utensils size={48} strokeWidth={1} />
            <h3>No restaurants found</h3>
            <p>Try changing your search criteria</p>
          </div>
        ) : (
          <div className="restaurants-grid">
            {filteredRestaurants.map((restaurant) => (
              <Link
                to={`/restaurant/${restaurant.id}`}
                key={restaurant.id}
                className="restaurant-card"
              >
                <div className="card-image">
                  {restaurant.image ? (
                    <img src={restaurant.image} alt={restaurant.name} />
                  ) : (
                    <div className="placeholder-image">
                      <Utensils size={32} strokeWidth={1} />
                    </div>
                  )}
                  <button
                    className={`favorite-btn ${favorites.has(restaurant.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(restaurant.id);
                    }}
                  >
                    <Heart size={16} fill={favorites.has(restaurant.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="card-content">
                  <h3>{restaurant.name}</h3>
                  <p className="cuisine">{restaurant.cuisine}</p>

                  <div className="card-meta">
                    {restaurant.rating && (
                      <span className="rating">
                        <Star size={12} fill="currentColor" />
                        {restaurant.rating}
                      </span>
                    )}
                    {restaurant.deliveryTime && (
                      <span className="time">
                        <Clock size={12} />
                        {restaurant.deliveryTime} min
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div className="overlay" onClick={() => setIsCartOpen(false)} />
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2>Cart</h2>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.dish.id} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">{item.dish.name}</span>
                      <span className="item-price">${item.dish.price}</span>
                    </div>
                    <div className="item-controls">
                      <button onClick={() => updateQuantity(item.dish.id, -1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.dish.id, 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span className="total-price">${totalPrice}</span>
                </div>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Checkout
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
