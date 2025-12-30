import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Wallet,
  Clock,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, addressApi } from '../services/api';

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart, currentRestaurant } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    deliveryInstructions: '',
  });

  const deliveryFee = 0;
  const serviceFee = 0;
  const grandTotal = totalPrice;

  const loadAddresses = useCallback(async () => {
    try {
      const response = await addressApi.getMyAddresses();
      setAddresses(response.data);
      const defaultAddr = response.data.find((a) => a.isDefault) || response.data[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      navigate('/');
      return;
    }
    loadAddresses();
  }, [isAuthenticated, cart, navigate, loadAddresses]);

  const formatAddress = (address) => {
    if (!address) return '';
    if (address.fullAddress) return address.fullAddress;
    const parts = [
      address.streetAddress,
      address.apartment ? `Apt ${address.apartment}` : null,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await addressApi.add(newAddress);
      setAddresses([...addresses, response.data]);
      setSelectedAddress(response.data);
      setShowAddressModal(false);
      setNewAddress({
        label: '',
        streetAddress: '',
        apartment: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        deliveryInstructions: '',
      });
    } catch (err) {
      setError('Failed to add address');
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        restaurantId: currentRestaurant.id,
        deliveryAddress: formatAddress(selectedAddress),
        deliveryLat: selectedAddress.latitude,
        deliveryLng: selectedAddress.longitude,
        customerNotes: comment,
        paymentMethod,
        items: cart.map((item) => ({
          menuItemId: item.dish.id,
          name: item.dish.name,
          quantity: item.quantity,
          price: item.dish.price,
        })),
      };

      const response = await orderApi.create(orderData);
      clearCart();
      navigate(`/order/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={24} />
        </Link>
        <h1>Checkout</h1>
      </header>

      <div className="checkout-content">
        <div className="checkout-main">
          {/* Delivery Address */}
          <section className="checkout-section">
            <h2>
              <MapPin size={20} />
              Delivery Address
            </h2>
            {addresses.length > 0 ? (
              <div className="address-list">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <div className="address-info">
                      <p className="address-street">
                        {addr.label || 'Delivery Address'}
                      </p>
                      <p className="address-details">{formatAddress(addr)}</p>
                    </div>
                    <div className="address-radio">
                      <div
                        className={`radio ${selectedAddress?.id === addr.id ? 'checked' : ''}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-addresses">No saved addresses</p>
            )}
            <button
              className="add-address-btn"
              onClick={() => setShowAddressModal(true)}
            >
              <Plus size={20} />
              Add Address
            </button>
          </section>

          {/* Payment Method */}
          <section className="checkout-section">
            <h2>
              <CreditCard size={20} />
              Payment Method
            </h2>
            <div className="payment-methods">
              <div
                className={`payment-card ${
                  paymentMethod === 'CREDIT_CARD' ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod('CREDIT_CARD')}
              >
                <CreditCard size={24} />
                <span>Credit Card</span>
              </div>
              <div
                className={`payment-card ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('CASH')}
              >
                <Wallet size={24} />
                <span>Cash</span>
              </div>
            </div>
          </section>

          {/* Comment */}
          <section className="checkout-section">
            <h2>Order Notes</h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Special requests for your order..."
              rows={3}
            />
          </section>
        </div>

        {/* Order Summary */}
        <div className="checkout-sidebar">
          <div className="order-summary">
            <h2>Your Order</h2>
            <p className="restaurant-name">{currentRestaurant?.name}</p>

            <div className="order-items">
              {cart.map((item) => (
                <div key={item.dish.id} className="order-item">
                  <span className="item-quantity">{item.quantity}x</span>
                  <span className="item-name">{item.dish.name}</span>
                  <span className="item-price">
                    ${item.dish.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>${totalPrice}</span>
              </div>
              <div className="total-row">
                <span>Delivery</span>
                <span>${deliveryFee}</span>
              </div>
              <div className="total-row">
                <span>Service Fee</span>
                <span>${serviceFee}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>${grandTotal}</span>
              </div>
            </div>

            <div className="delivery-time">
              <Clock size={18} />
              <span>Delivery time will be confirmed after checkout</span>
            </div>

            {error && <div className="checkout-error">{error}</div>}

            <button
              className="submit-order-btn"
              onClick={handleSubmitOrder}
              disabled={loading || !selectedAddress}
            >
              {loading ? 'Processing...' : 'Place Order'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>New Address</h2>
            <form onSubmit={handleAddAddress}>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, label: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    value={newAddress.streetAddress}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, streetAddress: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apartment</label>
                  <input
                    type="text"
                    value={newAddress.apartment}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, apartment: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={newAddress.postalCode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, postalCode: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={newAddress.country}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, country: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Delivery Instructions</label>
                <input
                  type="text"
                  value={newAddress.deliveryInstructions}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      deliveryInstructions: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddressModal(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
