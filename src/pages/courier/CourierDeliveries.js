import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Navigation,
  User,
  RefreshCw,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courierApi } from '../../services/api';

const statusConfig = {
  PENDING: { label: 'Waiting for courier', color: '#FFA000' },
  ASSIGNED: { label: 'Assigned', color: '#1976D2' },
  PICKED_UP: { label: 'Picked Up', color: '#7B1FA2' },
  IN_TRANSIT: { label: 'In Transit', color: '#E64A19' },
  DELIVERED: { label: 'Delivered', color: '#388E3C' },
  CANCELLED: { label: 'Cancelled', color: '#D32F2F' },
};

const CourierDeliveries = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('available');
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const [availableRes, myRes] = await Promise.all([
        courierApi.getAvailableDeliveries(),
        courierApi.getMyDeliveriesAsCourier(),
      ]);
      setAvailableDeliveries(availableRes.data || []);
      setMyDeliveries(myRes.data || []);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDeliveries();
  }, [isAuthenticated, navigate, loadDeliveries]);

  const handleAccept = async (deliveryId) => {
    try {
      await courierApi.acceptDelivery(deliveryId);
      loadDeliveries();
    } catch (err) {
      console.error('Failed to accept delivery:', err);
    }
  };

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await courierApi.updateDeliveryStatus(deliveryId, newStatus);
      setMyDeliveries((prev) =>
        prev.map((d) => (d.id === deliveryId ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleComplete = async (deliveryId) => {
    try {
      await courierApi.completeDelivery(deliveryId);
      loadDeliveries();
    } catch (err) {
      console.error('Failed to complete delivery:', err);
    }
  };

  const activeDeliveries = myDeliveries.filter(
    (d) => !['DELIVERED', 'CANCELLED'].includes(d.status)
  );
  const completedDeliveries = myDeliveries.filter(
    (d) => d.status === 'DELIVERED'
  );

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="panel-page courier-panel">
      <div className="panel-sidebar">
        <div className="panel-logo">
          <span>Courier</span>
        </div>
        <nav className="panel-nav">
          <Link to="/courier-panel" className="nav-item">
            <Package size={20} />
            Dashboard
          </Link>
          <Link to="/courier-panel/deliveries" className="nav-item active">
            <Navigation size={20} />
            Deliveries
          </Link>
          <Link to="/courier-panel/profile" className="nav-item">
            <User size={20} />
            Profile
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
          <h1>Deliveries</h1>
          <button className="btn-secondary" onClick={loadDeliveries}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="tabs">
          <button
            className={tab === 'available' ? 'active' : ''}
            onClick={() => setTab('available')}
          >
            Available ({availableDeliveries.length})
          </button>
          <button
            className={tab === 'active' ? 'active' : ''}
            onClick={() => setTab('active')}
          >
            My Active ({activeDeliveries.length})
          </button>
          <button
            className={tab === 'completed' ? 'active' : ''}
            onClick={() => setTab('completed')}
          >
            Completed
          </button>
        </div>

        <div className="deliveries-content">
          {tab === 'available' && (
            <>
              {availableDeliveries.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <p>No available orders</p>
                </div>
              ) : (
                <div className="deliveries-grid">
                  {availableDeliveries.map((delivery) => (
                    <div key={delivery.id} className="delivery-card available">
                      <div className="delivery-header">
                        <h3>Order #{delivery.orderId}</h3>
                        <span className="amount">${delivery.amount}</span>
                      </div>

                      <div className="delivery-restaurant">
                        <strong>{delivery.restaurantName}</strong>
                        <p>
                          <MapPin size={14} />
                          {delivery.restaurantAddress}
                        </p>
                      </div>

                      <div className="delivery-customer">
                        <p>
                          <MapPin size={14} />
                          {delivery.deliveryAddress}
                        </p>
                        <p>
                          <Clock size={14} />
                          ~{delivery.estimatedTime} min
                        </p>
                      </div>

                      <button
                        className="btn-primary"
                        onClick={() => handleAccept(delivery.id)}
                      >
                        <Play size={18} />
                        Accept Order
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'active' && (
            <>
              {activeDeliveries.length === 0 ? (
                <div className="empty-state">
                  <Navigation size={48} />
                  <p>No active deliveries</p>
                </div>
              ) : (
                <div className="deliveries-grid">
                  {activeDeliveries.map((delivery) => {
                    const status = statusConfig[delivery.status];
                    return (
                      <div key={delivery.id} className="delivery-card active">
                        <div className="delivery-header">
                          <h3>Order #{delivery.orderId}</h3>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: `${status.color}20`, color: status.color }}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="delivery-restaurant">
                          <strong>{delivery.restaurantName}</strong>
                          <p>
                            <MapPin size={14} />
                            {delivery.restaurantAddress}
                          </p>
                          {delivery.restaurantPhone && (
                            <a href={`tel:${delivery.restaurantPhone}`} className="phone-link">
                              <Phone size={14} />
                              {delivery.restaurantPhone}
                            </a>
                          )}
                        </div>

                        <div className="delivery-customer">
                          <strong>Customer: {delivery.customerName}</strong>
                          <p>
                            <MapPin size={14} />
                            {delivery.deliveryAddress}
                          </p>
                          {delivery.customerPhone && (
                            <a href={`tel:${delivery.customerPhone}`} className="phone-link">
                              <Phone size={14} />
                              {delivery.customerPhone}
                            </a>
                          )}
                        </div>

                        <div className="delivery-amount">
                          <span>Order Amount:</span>
                          <strong>${delivery.amount}</strong>
                        </div>

                        <div className="delivery-actions">
                          {delivery.status === 'ASSIGNED' && (
                            <button
                              className="btn-primary"
                              onClick={() => handleStatusUpdate(delivery.id, 'PICKED_UP')}
                            >
                              <Package size={18} />
                              Picked Up
                            </button>
                          )}
                          {delivery.status === 'PICKED_UP' && (
                            <button
                              className="btn-primary"
                              onClick={() => handleStatusUpdate(delivery.id, 'IN_TRANSIT')}
                            >
                              <Navigation size={18} />
                              In Transit
                            </button>
                          )}
                          {delivery.status === 'IN_TRANSIT' && (
                            <button
                              className="btn-success"
                              onClick={() => handleComplete(delivery.id)}
                            >
                              <CheckCircle size={18} />
                              Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'completed' && (
            <>
              {completedDeliveries.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={48} />
                  <p>No completed deliveries</p>
                </div>
              ) : (
                <div className="deliveries-list-simple">
                  {completedDeliveries.map((delivery) => (
                    <div key={delivery.id} className="delivery-row">
                      <div className="delivery-row-info">
                        <span className="order-id">#{delivery.orderId}</span>
                        <span className="restaurant">{delivery.restaurantName}</span>
                        <span className="address">{delivery.deliveryAddress}</span>
                      </div>
                      <div className="delivery-row-meta">
                        <span className="amount">${delivery.amount}</span>
                        <span className="date">
                          {new Date(delivery.completedAt).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourierDeliveries;
