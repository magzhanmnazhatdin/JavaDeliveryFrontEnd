import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  MapPin,
  Star,
  ChevronRight,
  X,
  Plus,
  Minus,
  Heart,
  User,
  Utensils,
  Truck,
  Store,
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
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'All',
    ...new Set(restaurants.map((restaurant) => restaurant.city).filter(Boolean)),
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

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesCategory =
      selectedCategory === 'All' || restaurant.city === selectedCategory;
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      restaurant.name?.toLowerCase().includes(search) ||
      restaurant.city?.toLowerCase().includes(search) ||
      restaurant.description?.toLowerCase().includes(search);
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

        {/* Partner/Courier Buttons */}
        {isAuthenticated && (
          <div className="hero-actions">
            {!hasRole('COURIER') && (
              <Link to="/become-courier" className="hero-btn courier-btn">
                <Truck size={20} />
                Become a Courier
              </Link>
            )}
            {!hasRole('RESTAURANT_OWNER') && (
              <Link to="/become-restaurant" className="hero-btn restaurant-btn">
                <Store size={20} />
                Open Restaurant
              </Link>
            )}
            {hasRole('COURIER') && (
              <Link to="/courier-panel" className="hero-btn courier-btn">
                <Truck size={20} />
                Courier Panel
              </Link>
            )}
            {hasRole('RESTAURANT_OWNER') && (
              <Link to="/restaurant-panel" className="hero-btn restaurant-btn">
                <Store size={20} />
                Restaurant Panel
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Categories */}
      <div className="categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            <span className="category-name">{category}</span>
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
                  {restaurant.imageUrl || restaurant.image ? (
                    <img
                      src={restaurant.imageUrl || restaurant.image}
                      alt={restaurant.name}
                    />
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
                  <p className="cuisine">{restaurant.city || restaurant.address}</p>

                  <div className="card-meta">
                    {restaurant.averageRating != null && (
                      <span className="rating">
                        <Star size={12} fill="currentColor" />
                        {Number(restaurant.averageRating).toFixed(1)}
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
