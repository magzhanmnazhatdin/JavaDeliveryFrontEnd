import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Customer Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantPage from './pages/RestaurantPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

// Restaurant Panel
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import MenuManagement from './pages/restaurant/MenuManagement';
import RestaurantOrders from './pages/restaurant/RestaurantOrders';
import RestaurantSettings from './pages/restaurant/RestaurantSettings';
import CreateRestaurant from './pages/restaurant/CreateRestaurant';

// Courier Panel
import CourierDashboard from './pages/courier/CourierDashboard';
import CourierDeliveries from './pages/courier/CourierDeliveries';
import CourierProfile from './pages/courier/CourierProfile';

// Admin Panel
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCouriers from './pages/admin/AdminCouriers';

// Styles
import './styles/main.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/restaurant/:id" element={<RestaurantPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order/:id" element={<OrderTrackingPage />} />

            {/* Restaurant Panel Routes */}
            <Route path="/restaurant-panel" element={<RestaurantDashboard />} />
            <Route path="/restaurant-panel/menu" element={<MenuManagement />} />
            <Route path="/restaurant-panel/orders" element={<RestaurantOrders />} />
            <Route path="/restaurant-panel/settings" element={<RestaurantSettings />} />
            <Route path="/restaurant-panel/create" element={<CreateRestaurant />} />

            {/* Courier Panel Routes */}
            <Route path="/courier-panel" element={<CourierDashboard />} />
            <Route path="/courier-panel/deliveries" element={<CourierDeliveries />} />
            <Route path="/courier-panel/profile" element={<CourierProfile />} />

            {/* Admin Panel Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/restaurants" element={<AdminRestaurants />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/couriers" element={<AdminCouriers />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
