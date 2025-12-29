import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
} from 'lucide-react';
import { restaurantApi } from '../services/api';
import { useCart } from '../context/CartContext';

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart, cart, setIsCartOpen, totalItems } = useCart();

  const loadRestaurant = useCallback(async () => {
    try {
      setLoading(true);
      const [restaurantRes, menuRes, categoriesRes] = await Promise.all([
        restaurantApi.getById(id),
        restaurantApi.getMenu(id),
        restaurantApi.getCategories(id),
      ]);
      setRestaurant(restaurantRes.data);
      setMenu(menuRes.data);
      setCategories(['All', ...categoriesRes.data]);
    } catch (err) {
      setError('Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  const filteredMenu =
    selectedCategory === 'All'
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  const getItemQuantity = (dishId) => {
    const item = cart.find((i) => i.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="error-page">
        <p>{error || 'Restaurant not found'}</p>
        <Link to="/" className="back-link">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="restaurant-page">
      <header className="restaurant-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={24} />
        </Link>
        <button className="cart-float" onClick={() => setIsCartOpen(true)}>
          <ShoppingBag size={20} />
          {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
        </button>
      </header>

      <div
        className="restaurant-hero"
        style={{ backgroundImage: `url(${restaurant.image})` }}
      >
        <div className="hero-overlay">
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="restaurant-info-section">
        <h1 className="restaurant-title">{restaurant.name}</h1>
        <p className="restaurant-cuisine">{restaurant.cuisine}</p>

        <div className="restaurant-stats">
          <div className="stat">
            <Star size={18} fill="#F57C00" color="#F57C00" />
            <span>{restaurant.rating}</span>
          </div>
          <div className="stat">
            <Clock size={18} />
            <span>{restaurant.deliveryTime} min</span>
          </div>
          <div className="stat">
            <MapPin size={18} />
            <span>{restaurant.address}</span>
          </div>
        </div>

        <p className="restaurant-description">{restaurant.description}</p>
        <p className="min-order">Minimum order: ${restaurant.minOrder}</p>
      </div>

      <div className="menu-categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="menu-section">
        <h2>Menu</h2>
        <div className="menu-grid">
          {filteredMenu.map((item) => {
            const quantity = getItemQuantity(item.id);
            return (
              <div key={item.id} className="menu-item">
                <img src={item.image} alt={item.name} className="menu-item-image" />
                <div className="menu-item-info">
                  <h3>{item.name}</h3>
                  <p className="menu-item-description">{item.description}</p>
                  <div className="menu-item-footer">
                    <span className="menu-item-price">${item.price}</span>
                    {quantity > 0 ? (
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            addToCart(restaurant, item, -1)
                          }
                        >
                          <Minus size={16} />
                        </button>
                        <span>{quantity}</span>
                        <button onClick={() => addToCart(restaurant, item, 1)}>
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="add-btn"
                        onClick={() => addToCart(restaurant, item, 1)}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
