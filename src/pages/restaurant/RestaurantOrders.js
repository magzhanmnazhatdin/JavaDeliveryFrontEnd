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
import { restaurantOrdersApi, restaurantOwnerApi } from '../../services/api';

const statusConfig = {
  PENDING: { label: 'Pending', color: '#FFA000', action: 'accept', rejectable: true },
  ACCEPTED: { label: 'Accepted', color: '#0288D1', action: 'startPreparing' },
  PREPARING: { label: 'Preparing', color: '#7B1FA2', action: 'markReady' },
  READY: { label: 'Ready for Pickup', color: '#00796B', action: 'markPickedUp' },
  PICKED_UP: { label: 'Picked Up', color: '#5D4037' },
  CANCELLED: { label: 'Cancelled', color: '#D32F2F' },
  REJECTED: { label: 'Rejected', color: '#C62828' },
};

const actionConfig = {
  accept: { label: 'Accept', icon: CheckCircle },
  startPreparing: { label: 'Start Preparing', icon: Clock },
  markReady: { label: 'Mark Ready', icon: Package },
  markPickedUp: { label: 'Picked Up', icon: Package },
};

const RestaurantOrders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const restaurantRes = await restaurantOwnerApi.getMyRestaurant();
      setRestaurant(restaurantRes.data);

      if (restaurantRes.data?.id) {
        const ordersRes = await restaurantOrdersApi.getByRestaurant(
          restaurantRes.data.id
        );
        setOrders(ordersRes.data || []);
      }
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
      return !['PICKED_UP', 'CANCELLED', 'REJECTED'].includes(order.status);
    if (filter === 'completed') return order.status === 'PICKED_UP';
    if (filter === 'cancelled') return ['CANCELLED', 'REJECTED'].includes(order.status);
    return true;
  });

  const handleStatusUpdate = async (orderId, action) => {
    try {
      let updatedStatus = null;
      switch (action) {
        case 'accept':
          await restaurantOrdersApi.accept(orderId);
          updatedStatus = 'ACCEPTED';
          break;
        case 'startPreparing':
          await restaurantOrdersApi.startPreparing(orderId);
          updatedStatus = 'PREPARING';
          break;
        case 'markReady':
          await restaurantOrdersApi.markReady(orderId);
          updatedStatus = 'READY';
          break;
        case 'markPickedUp':
          await restaurantOrdersApi.markPickedUp(orderId);
          updatedStatus = 'PICKED_UP';
          break;
        case 'reject':
          await restaurantOrdersApi.reject(orderId, { reason: 'Rejected by restaurant' });
          updatedStatus = 'REJECTED';
          break;
        default:
          return;
      }

      if (updatedStatus) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: updatedStatus } : o))
        );
        setOrderDetails((prev) =>
          prev[orderId]
            ? { ...prev, [orderId]: { ...prev[orderId], status: updatedStatus } }
            : prev
        );
      }
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
              const details = orderDetails[order.id];
              const displayId = order.orderId || order.id;
              const action = status.action;
              const actionMeta = actionConfig[action];
              const ActionIcon = actionMeta?.icon;

              return (
                <div key={order.id} className="order-card-panel">
                  <div
                    className="order-header"
                    onClick={async () => {
                      if (!isExpanded && !orderDetails[order.id]) {
                        try {
                          const detailRes = await restaurantOrdersApi.getById(order.id);
                          setOrderDetails((prev) => ({
                            ...prev,
                            [order.id]: detailRes.data,
                          }));
                        } catch (err) {
                          console.error('Failed to load order details:', err);
                        }
                      }
                      setExpandedOrder(isExpanded ? null : order.id);
                    }}
                  >
                    <div className="order-info">
                      <span className="order-id">#{displayId}</span>
                      <span className="order-time">{formatDate(order.createdAt)}</span>
                    </div>
                    <div
                      className="order-status"
                      style={{ backgroundColor: `${status.color}20`, color: status.color }}
                    >
                      {status.label}
                    </div>
                    <div className="order-total">
                      ${Number(order.totalPrice || 0).toFixed(2)}
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {isExpanded && (
                    <div className="order-details">
                      <div className="order-customer">
                        <h4>Customer</h4>
                        <p>Customer</p>
                        <p>No phone</p>
                      </div>

                      <div className="order-address">
                        <h4>Delivery Address</h4>
                        <p>{details?.deliveryAddress || order.deliveryAddress || 'Pickup'}</p>
                      </div>

                      <div className="order-items-list">
                        <h4>Order Items</h4>
                        {(details?.items || order.items)?.length ? (
                          (details?.items || order.items).map((item, idx) => {
                            const itemName = item.nameSnapshot || item.name || 'Item';
                            const itemPrice = Number(item.priceSnapshot ?? item.price ?? 0);
                            return (
                            <div key={idx} className="order-item-row">
                              <span>
                                {item.quantity}x {itemName}
                              </span>
                              <span>${(itemPrice * item.quantity).toFixed(2)}</span>
                            </div>
                            );
                          })
                        ) : (
                          <p>No item details</p>
                        )}
                      </div>

                      {details?.customerNotes && (
                        <div className="order-comment">
                          <h4>Note</h4>
                          <p>{details.customerNotes}</p>
                        </div>
                      )}

                      <div className="order-actions">
                        {actionMeta && (
                          <button
                            className="btn-primary"
                            onClick={() => handleStatusUpdate(order.id, action)}
                          >
                            <ActionIcon size={18} />
                            {actionMeta.label}
                          </button>
                        )}
                        {status.rejectable && (
                          <button
                            className="btn-danger"
                            onClick={() => handleStatusUpdate(order.id, 'reject')}
                          >
                            <XCircle size={18} />
                            Reject
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
