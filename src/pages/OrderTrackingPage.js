import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Truck,
  Home,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderApi, deliveryApi } from '../services/api';

const orderSteps = [
  { key: 'PENDING', label: 'Order Placed', icon: Package },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'ACCEPTED_BY_RESTAURANT', label: 'Accepted by restaurant', icon: Package },
  { key: 'PREPARING', label: 'Preparing', icon: Clock },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: Package },
  { key: 'PICKED_UP', label: 'Picked Up', icon: Truck },
  { key: 'IN_DELIVERY', label: 'On the Way', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      const [orderRes, deliveryRes] = await Promise.all([
        orderApi.getById(id),
        deliveryApi.getByOrderId(id).catch(() => ({ data: null })),
      ]);
      setOrder(orderRes.data);
      setDelivery(deliveryRes.data);
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrder();
    const interval = setInterval(loadOrder, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [id, isAuthenticated, navigate, loadOrder]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await orderApi.cancel(id, 'Cancelled by user');
      loadOrder();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return orderSteps.findIndex((step) => step.key === order.status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRestaurantId = (value) => {
    if (!value) return 'Unknown';
    return value.toString().slice(0, 8);
  };

  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'DEBIT_CARD':
        return 'Debit Card';
      case 'CASH':
        return 'Cash';
      case 'DIGITAL_WALLET':
        return 'Digital Wallet';
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      default:
        return 'Unknown';
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="error-page">
        <p>{error || 'Order not found'}</p>
        <Link to="/orders" className="back-link">
          Back to orders
        </Link>
      </div>
    );
  }

  const currentStep = Math.max(0, getCurrentStepIndex());
  const isCancelled = order.status === 'CANCELLED';
  const isRejected = order.status === 'REJECTED';
  const isDelivered = order.status === 'DELIVERED';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  const itemsSubtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  return (
    <div className="order-tracking-page">
      <header className="tracking-header">
        <Link to="/orders" className="back-button">
          <ArrowLeft size={24} />
        </Link>
        <h1>Order #{order.id}</h1>
        <button className="refresh-btn" onClick={loadOrder}>
          <RefreshCw size={20} />
        </button>
      </header>

      <div className="tracking-content">
        {/* Order Status */}
        <section className="status-section">
          {isCancelled ? (
            <div className="cancelled-status">
              <XCircle size={48} />
              <h2>Order Cancelled</h2>
              <p>Your order was cancelled.</p>
            </div>
          ) : isRejected ? (
            <div className="cancelled-status">
              <XCircle size={48} />
              <h2>Order Rejected</h2>
              <p>{order.rejectionReason || 'The restaurant rejected the order.'}</p>
            </div>
          ) : isDelivered ? (
            <div className="delivered-status">
              <CheckCircle size={48} />
              <h2>Order Delivered</h2>
              <p>Thank you for your order!</p>
            </div>
          ) : (
            <>
              <div className="current-status">
                <h2>{orderSteps[currentStep]?.label}</h2>
                {order.estimatedDeliveryTime && (
                  <p>Estimated delivery: {formatDate(order.estimatedDeliveryTime)}</p>
                )}
              </div>

              <div className="status-timeline">
                {orderSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div
                      key={step.key}
                      className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="step-icon">
                        <StepIcon size={20} />
                      </div>
                      <div className="step-label">{step.label}</div>
                      {index < orderSteps.length - 1 && (
                        <div className="step-line" />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Courier Info */}
        {delivery?.courier && !isCancelled && !isRejected && !isDelivered && (
          <section className="courier-section">
            <h3>Courier</h3>
            <div className="courier-card">
              <div className="courier-avatar">
                {delivery.courier.name?.charAt(0)}
              </div>
              <div className="courier-info">
                <h4>{delivery.courier.name}</h4>
                <p>{delivery.courier.phone}</p>
              </div>
              <div className="courier-actions">
                {delivery.courier.phone && (
                  <a href={`tel:${delivery.courier.phone}`} className="action-btn">
                    <Phone size={20} />
                  </a>
                )}
                <button className="action-btn">
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Delivery Address */}
        <section className="address-section">
          <h3>Delivery Address</h3>
          <div className="address-card">
            <MapPin size={20} />
            <div>
              <p>{order.deliveryAddress}</p>
              {order.customerNotes && (
                <p className="order-comment">Note: {order.customerNotes}</p>
              )}
            </div>
          </div>
        </section>

        {/* Order Details */}
        <section className="details-section">
          <h3>Order Details</h3>
          <div className="restaurant-info">
            <div className="restaurant-thumb placeholder-image">
              <Package size={18} />
            </div>
            <div>
              <h4>Restaurant {formatRestaurantId(order.restaurantId)}</h4>
              <p>Ordered on {formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="order-items-list">
            {order.items?.map((item, idx) => (
              <div key={idx} className="order-item">
                <span className="item-quantity">{item.quantity}x</span>
                <span className="item-name">{item.name}</span>
                <span className="item-price">${item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${Number(itemsSubtotal).toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${Number(order.totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="payment-info">
            <span>Payment method:</span>
            <span>{formatPaymentMethod(order.payment?.paymentMethod)}</span>
          </div>
        </section>

        {/* Actions */}
        {canCancel && (
          <section className="actions-section">
            <button
              className="cancel-order-btn"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
