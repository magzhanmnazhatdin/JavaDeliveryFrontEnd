import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, MapPin, Clock, Star, ChevronRight, X, Plus, Minus, Heart } from 'lucide-react';

const FoodDeliveryApp = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const categories = [
    'Все', 'Бургеры', 'Пицца', 'Суши', 'Азиатская', 'Десерты', 'Напитки'
  ];

  const restaurants = [
    {
      id: 1,
      name: 'Tokyo Fusion',
      cuisine: 'Суши',
      rating: 4.8,
      deliveryTime: '25-35',
      minOrder: 1500,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      dishes: [
        { id: 101, name: 'Филадельфия', price: 890, image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=200&h=200&fit=crop' },
        { id: 102, name: 'Калифорния', price: 750, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop' }
      ]
    },
    {
      id: 2,
      name: 'Burger House',
      cuisine: 'Бургеры',
      rating: 4.9,
      deliveryTime: '20-30',
      minOrder: 800,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      dishes: [
        { id: 201, name: 'Классик Бургер', price: 650, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
        { id: 202, name: 'Двойной Чизбургер', price: 890, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop' }
      ]
    },
    {
      id: 3,
      name: 'Italiano Vero',
      cuisine: 'Пицца',
      rating: 4.7,
      deliveryTime: '30-40',
      minOrder: 1200,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      dishes: [
        { id: 301, name: 'Маргарита', price: 790, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop' },
        { id: 302, name: 'Пепперони', price: 950, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=200&fit=crop' }
      ]
    },
    {
      id: 4,
      name: 'Dragon Wok',
      cuisine: 'Азиатская',
      rating: 4.6,
      deliveryTime: '25-35',
      minOrder: 900,
      image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
      dishes: [
        { id: 401, name: 'Пад Тай', price: 680, image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=200&h=200&fit=crop' },
        { id: 402, name: 'Том Ям', price: 720, image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200&h=200&fit=crop' }
      ]
    },
    {
      id: 5,
      name: 'Sweet Paradise',
      cuisine: 'Десерты',
      rating: 4.9,
      deliveryTime: '15-25',
      minOrder: 500,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
      dishes: [
        { id: 501, name: 'Чизкейк', price: 450, image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=200&h=200&fit=crop' },
        { id: 502, name: 'Тирамису', price: 490, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop' }
      ]
    },
    {
      id: 6,
      name: 'Fresh Bar',
      cuisine: 'Напитки',
      rating: 4.5,
      deliveryTime: '10-20',
      minOrder: 400,
      image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop',
      dishes: [
        { id: 601, name: 'Смузи манго', price: 380, image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=200&h=200&fit=crop' },
        { id: 602, name: 'Латте', price: 320, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop' }
      ]
    }
  ];

  const filteredRestaurants = restaurants.filter(r => {
    const matchesCategory = selectedCategory === 'Все' || r.cuisine === selectedCategory;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (restaurant, dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item => 
          item.dish.id === dish.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { restaurant, dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId, delta) => {
    setCart(prev => {
      const updated = prev.map(item => 
        item.dish.id === dishId 
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0);
      return updated;
    });
  };

  const toggleFavorite = (restaurantId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(restaurantId)) {
        newFavorites.delete(restaurantId);
      } else {
        newFavorites.add(restaurantId);
      }
      return newFavorites;
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #FF3B30;
          --primary-dark: #E02D22;
          --bg-main: #FAFAFA;
          --bg-card: #FFFFFF;
          --text-primary: #1A1A1A;
          --text-secondary: #666666;
          --text-muted: #999999;
          --border: #E8E8E8;
          --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
          --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
          --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
          --radius-sm: 12px;
          --radius-md: 16px;
          --radius-lg: 24px;
        }

        body {
          font-family: 'Manrope', -apple-system, sans-serif;
          background: var(--bg-main);
          color: var(--text-primary);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .app {
          min-height: 100vh;
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        /* Header */
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--primary) 0%, #FF6B66 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          padding: 10px 16px;
          border-radius: var(--radius-sm);
          background: var(--bg-main);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .location:hover {
          background: #F0F0F0;
        }

        .search-wrapper {
          flex: 1;
          position: relative;
          max-width: 600px;
        }

        .search-input {
          width: 100%;
          padding: 14px 48px;
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s;
          background: var(--bg-card);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .cart-button {
          position: relative;
          padding: 12px 24px;
          background: var(--text-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        .cart-button:hover {
          background: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--primary);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          animation: pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        /* Categories */
        .categories {
          max-width: 1400px;
          margin: 32px auto;
          padding: 0 24px;
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          animation: fadeInUp 0.6s 0.2s ease-out backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .categories::-webkit-scrollbar {
          display: none;
        }

        .category-chip {
          padding: 12px 24px;
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          color: var(--text-secondary);
        }

        .category-chip:hover {
          border-color: var(--text-primary);
        }

        .category-chip.active {
          background: var(--text-primary);
          color: white;
          border-color: var(--text-primary);
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .restaurants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
          animation: fadeInUp 0.6s 0.3s ease-out backwards;
        }

        .restaurant-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
        }

        .restaurant-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .restaurant-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .restaurant-card:hover .restaurant-image {
          transform: scale(1.05);
        }

        .favorite-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }

        .favorite-btn:hover {
          transform: scale(1.1);
        }

        .favorite-btn.active {
          background: var(--primary);
          color: white;
        }

        .restaurant-info {
          padding: 20px;
        }

        .restaurant-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .restaurant-name {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }

        .restaurant-cuisine {
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFF3E0;
          color: #F57C00;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
        }

        .restaurant-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dishes-preview {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .dishes-preview::-webkit-scrollbar {
          display: none;
        }

        .dish-mini {
          min-width: 140px;
          background: var(--bg-main);
          border-radius: var(--radius-sm);
          padding: 12px;
          transition: all 0.2s;
        }

        .dish-mini:hover {
          background: #F0F0F0;
        }

        .dish-mini-image {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .dish-mini-name {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dish-mini-price {
          color: var(--text-primary);
          font-weight: 700;
          font-size: 14px;
        }

        .add-dish-btn {
          width: 100%;
          margin-top: 8px;
          padding: 6px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-dish-btn:hover {
          background: var(--primary-dark);
        }

        /* Cart Sidebar */
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          opacity: 0;
          animation: fadeIn 0.3s ease-out forwards;
        }

        .cart-sidebar {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 100%;
          max-width: 480px;
          background: var(--bg-card);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          transform: translateX(100%);
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideInRight {
          to { transform: translateX(0); }
        }

        .cart-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 700;
        }

        .close-cart {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: var(--bg-main);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-cart:hover {
          background: #E8E8E8;
          transform: rotate(90deg);
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .cart-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
        }

        .cart-empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          opacity: 0.3;
        }

        .cart-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--bg-main);
          border-radius: var(--radius-md);
          margin-bottom: 12px;
          animation: slideInRight 0.3s ease-out;
        }

        .cart-item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 12px;
        }

        .cart-item-info {
          flex: 1;
        }

        .cart-item-name {
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .cart-item-restaurant {
          color: var(--text-muted);
          font-size: 13px;
          margin-bottom: 8px;
        }

        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quantity-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--border);
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .quantity-btn:hover {
          border-color: var(--primary);
          background: var(--primary);
          color: white;
        }

        .quantity {
          font-weight: 700;
          font-size: 16px;
          min-width: 24px;
          text-align: center;
        }

        .cart-item-price {
          font-weight: 700;
          font-size: 18px;
          color: var(--primary);
        }

        .cart-footer {
          padding: 24px;
          border-top: 1px solid var(--border);
          background: var(--bg-main);
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 18px;
        }

        .cart-total-label {
          font-weight: 600;
        }

        .cart-total-price {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 28px;
          color: var(--primary);
        }

        .checkout-btn {
          width: 100%;
          padding: 18px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .checkout-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .checkout-btn:active {
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header-content {
            flex-wrap: wrap;
            gap: 16px;
          }

          .logo {
            font-size: 24px;
          }

          .location {
            order: 3;
            width: 100%;
          }

          .search-wrapper {
            order: 2;
            flex: 1;
            max-width: none;
          }

          .cart-button {
            order: 1;
          }

          .restaurants-grid {
            grid-template-columns: 1fr;
          }

          .cart-sidebar {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .header-content {
            padding: 16px;
          }

          .main-content {
            padding: 0 16px 60px;
          }

          .categories {
            padding: 0 16px;
            gap: 8px;
          }

          .category-chip {
            padding: 10px 20px;
            font-size: 13px;
          }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <ShoppingBag size={20} />
            </div>
            FoodHub
          </div>
          
          <div className="location">
            <MapPin size={16} />
            <span>Алматы, Достык 123</span>
          </div>

          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Поиск ресторанов и блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="cart-button" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={20} />
            <span>Корзина</span>
            {totalItems > 0 && <div className="cart-badge">{totalItems}</div>}
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="categories">
        {categories.map(category => (
          <button
            key={category}
            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Restaurants Grid */}
      <main className="main-content">
        <div className="restaurants-grid">
          {filteredRestaurants.map((restaurant, index) => (
            <div 
              key={restaurant.id} 
              className="restaurant-card"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <img 
                src={restaurant.image} 
                alt={restaurant.name}
                className="restaurant-image"
              />
              <button 
                className={`favorite-btn ${favorites.has(restaurant.id) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(restaurant.id);
                }}
              >
                <Heart size={20} fill={favorites.has(restaurant.id) ? 'currentColor' : 'none'} />
              </button>

              <div className="restaurant-info">
                <div className="restaurant-header">
                  <div>
                    <h3 className="restaurant-name">{restaurant.name}</h3>
                    <p className="restaurant-cuisine">{restaurant.cuisine}</p>
                  </div>
                  <div className="rating">
                    <Star size={14} fill="currentColor" />
                    {restaurant.rating}
                  </div>
                </div>

                <div className="restaurant-meta">
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{restaurant.deliveryTime} мин</span>
                  </div>
                  <div className="meta-item">
                    <span>От {restaurant.minOrder} ₸</span>
                  </div>
                </div>

                <div className="dishes-preview">
                  {restaurant.dishes.map(dish => (
                    <div key={dish.id} className="dish-mini">
                      <img 
                        src={dish.image} 
                        alt={dish.name}
                        className="dish-mini-image"
                      />
                      <div className="dish-mini-name">{dish.name}</div>
                      <div className="dish-mini-price">{dish.price} ₸</div>
                      <button 
                        className="add-dish-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(restaurant, dish);
                        }}
                      >
                        Добавить
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2 className="cart-title">Корзина</h2>
              <button className="close-cart" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag className="cart-empty-icon" size={80} />
                  <p>Корзина пуста</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.dish.id} className="cart-item">
                    <img 
                      src={item.dish.image} 
                      alt={item.dish.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.dish.name}</div>
                      <div className="cart-item-restaurant">{item.restaurant.name}</div>
                      <div className="cart-item-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.dish.id, -1)}
                        >
                          <Minus size={16} />
                        </button>
                        <div className="quantity">{item.quantity}</div>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.dish.id, 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      {item.dish.price * item.quantity} ₸
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span className="cart-total-label">Итого:</span>
                  <span className="cart-total-price">{totalPrice} ₸</span>
                </div>
                <button className="checkout-btn">
                  Оформить заказ
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FoodDeliveryApp;