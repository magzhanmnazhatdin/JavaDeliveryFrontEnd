import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';

const statusConfig = {
  PENDING: { label: 'Pending', color: '#FFA000', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: '#1976D2', icon: Package },
  PREPARING: { label: 'Preparing', color: '#7B1FA2', icon: Package },
  READY: { label: 'Ready for Delivery', color: '#00796B', icon: Package },
  DELIVERING: { label: 'On the Way', color: '#E64A19', icon: Package },
  DELIVERED: { label: 'Delivered', color: '#388E3C', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: '#D32F2F', icon: XCircle },
};

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderApi.getMyOrders();
      setOrders(response.data.content || response.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate, loadOrders]);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'active')
      return !['DELIVERED', 'CANCELLED'].includes(order.status);
    if (filter === 'completed') return order.status === 'DELIVERED';
    if (filter === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="orders-page">
      <header className="orders-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={24} />
        </Link>
        <h1>My Orders</h1>
        <button className="refresh-btn" onClick={loadOrders}>
          <RefreshCw size={20} />
        </button>
      </header>

      <div className="orders-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      <div className="orders-content">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">
            <Package size={64} />
            <h2>No Orders</h2>
            <p>
              {filter === 'all'
                ? "You haven't placed any orders yet"
                : 'No orders in this category'}
            </p>
            <Link to="/" className="browse-btn">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;

              return (
                <Link
                  to={`/order/${order.id}`}
                  key={order.id}
                  className="order-card"
                >
                  <div className="order-main">
                    <div className="order-restaurant">
                      <img
                        src={order.restaurantImage}
                        alt={order.restaurantName}
                        className="restaurant-thumb"
                      />
                      <div>
                        <h3>{order.restaurantName}</h3>
                        <p className="order-date">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    <div
                      className="order-status"
                      style={{ backgroundColor: `${status.color}20`, color: status.color }}
                    >
                      <StatusIcon size={16} />
                      {status.label}
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <span key={idx}>
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                    {order.items?.length > 3 && (
                      <span>+{order.items.length - 3} more</span>
                    )}
                  </div>

                  <div className="order-footer">
                    <span className="order-total">${order.totalAmount}</span>
                    <ChevronRight size={20} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
