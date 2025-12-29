import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Menu,
  ShoppingBag,
  BarChart3,
  Settings,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { restaurantOwnerApi } from '../../services/api';

const statusConfig = {
  PENDING: { label: 'Pending', color: '#FFA000', next: 'CONFIRMED' },
  CONFIRMED: { label: 'Confirmed', color: '#1976D2', next: 'PREPARING' },
  PREPARING: { label: 'Preparing', color: '#7B1FA2', next: 'READY' },
  READY: { label: 'Ready', color: '#00796B', next: null },
  DELIVERING: { label: 'Delivering', color: '#E64A19', next: null },
  DELIVERED: { label: 'Delivered', color: '#388E3C', next: null },
  CANCELLED: { label: 'Cancelled', color: '#D32F2F', next: null },
};

const RestaurantOrders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const restaurantRes = await restaurantOwnerApi.getMyRestaurant();
      setRestaurant(restaurantRes.data);

      if (restaurantRes.data?.id) {
        const ordersRes = await restaurantOwnerApi.getRestaurantOrders(
          restaurantRes.data.id,
          { status: filter === 'all' ? undefined : filter }
        );
        setOrders(ordersRes.data.content || ordersRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate, loadOrders]);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['DELIVERED', 'CANCELLED'].includes(order.status);
    if (filter === 'completed') return order.status === 'DELIVERED';
    if (filter === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await restaurantOwnerApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <Link to="/restaurant-panel/menu" className="nav-item">
            <Menu size={20} />
            Menu
          </Link>
          <Link to="/restaurant-panel/orders" className="nav-item active">
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
            <h1>Orders</h1>
            <p>{filteredOrders.length} orders</p>
          </div>
          <button className="btn-secondary" onClick={loadOrders}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

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

        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>No orders</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="order-card-panel">
                  <div
                    className="order-header"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="order-info">
                      <span className="order-id">#{order.id}</span>
                      <span className="order-time">{formatDate(order.createdAt)}</span>
                    </div>
                    <div
                      className="order-status"
                      style={{ backgroundColor: `${status.color}20`, color: status.color }}
                    >
                      {status.label}
                    </div>
                    <div className="order-total">${order.totalAmount}</div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {isExpanded && (
                    <div className="order-details">
                      <div className="order-customer">
                        <h4>Customer</h4>
                        <p>{order.customerName || 'Not specified'}</p>
                        <p>{order.customerPhone || 'No phone'}</p>
                      </div>

                      <div className="order-address">
                        <h4>Delivery Address</h4>
                        <p>{order.deliveryAddress || 'Pickup'}</p>
                      </div>

                      <div className="order-items-list">
                        <h4>Order Items</h4>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {order.comment && (
                        <div className="order-comment">
                          <h4>Note</h4>
                          <p>{order.comment}</p>
                        </div>
                      )}

                      <div className="order-actions">
                        {status.next && (
                          <button
                            className="btn-primary"
                            onClick={() => handleStatusUpdate(order.id, status.next)}
                          >
                            {status.next === 'CONFIRMED' && (
                              <>
                                <CheckCircle size={18} />
                                Confirm
                              </>
                            )}
                            {status.next === 'PREPARING' && (
                              <>
                                <Clock size={18} />
                                Start Preparing
                              </>
                            )}
                            {status.next === 'READY' && (
                              <>
                                <Package size={18} />
                                Mark Ready
                              </>
                            )}
                          </button>
                        )}
                        {order.status === 'PENDING' && (
                          <button
                            className="btn-danger"
                            onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                          >
                            <XCircle size={18} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrders;
