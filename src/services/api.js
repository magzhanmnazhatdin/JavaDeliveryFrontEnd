import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/api/auth/');
      if (!isAuthRequest) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  refreshToken: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
  logout: () => api.post('/api/auth/logout'),
  getCurrentUser: () => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/me', data),
  // Role upgrade endpoints
  becomeCourier: (data) => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/api/auth/become-courier', { ...data, refreshToken });
  },
  becomeRestaurant: (data) => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/api/auth/become-restaurant', { ...data, refreshToken });
  },
};

// Restaurant API
export const restaurantApi = {
  getAll: (params) => api.get('/api/restaurants', { params }),
  getById: (id) => api.get(`/api/restaurants/${id}`),
  getMenu: (id, availableOnly = true) =>
    api.get(`/api/restaurants/${id}/menu`, { params: { availableOnly } }),
  getCategories: (id) => api.get(`/api/restaurants/${id}/menu/categories`),
};

// Menu API
export const menuApi = {
  getItem: (id) => api.get(`/api/menu-items/${id}`),
};

// Order API
export const orderApi = {
  create: (orderData) => api.post('/api/orders', orderData),
  getMyOrders: (params) => api.get('/api/orders/my-orders', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  cancel: (id, reason) => api.post(`/api/orders/${id}/cancel`, { reason }),
  update: (id, data) => api.put(`/api/orders/${id}`, data),
};

// Payment API
export const paymentApi = {
  process: (paymentData) => api.post('/api/payments/process', paymentData),
  getById: (id) => api.get(`/api/payments/${id}`),
  getByOrderId: (orderId) => api.get(`/api/payments/order/${orderId}`),
  getMyPayments: () => api.get('/api/payments/my-payments'),
};

// Delivery API
export const deliveryApi = {
  getByOrderId: (orderId) => api.get(`/api/deliveries/order/${orderId}`),
  getMyDeliveries: (customerId) => api.get(`/api/deliveries/customer/${customerId}`),
};

// Address API
export const addressApi = {
  getMyAddresses: () => api.get('/api/addresses'),
  getDefault: () => api.get('/api/addresses/default'),
  add: (addressData) => api.post('/api/addresses', addressData),
  update: (id, data) => api.put(`/api/addresses/${id}`, data),
  delete: (id) => api.delete(`/api/addresses/${id}`),
  setDefault: (id) => api.post(`/api/addresses/${id}/set-default`),
};

// Favorites API
export const favoritesApi = {
  add: (restaurantId) => api.post(`/api/favorites/restaurants/${restaurantId}`),
  remove: (restaurantId) => api.delete(`/api/favorites/restaurants/${restaurantId}`),
  getAll: () => api.get('/api/favorites/restaurants'),
  check: (restaurantId) => api.get(`/api/favorites/restaurants/${restaurantId}/check`),
};

// Preferences API
export const preferencesApi = {
  get: () => api.get('/api/preferences'),
  update: (data) => api.put('/api/preferences', data),
};

// ============ RESTAURANT OWNER API ============
export const restaurantOwnerApi = {
  // Restaurant management
  getMyRestaurant: () => api.get('/api/restaurants/me'),
  createRestaurant: (data) => api.post('/api/restaurants', data),
  updateRestaurant: (id, data) => api.put(`/api/restaurants/${id}`, data),
  uploadImage: (id, formData) =>
    api.post(`/api/restaurants/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Menu management
  addMenuItem: (restaurantId, data) =>
    api.post(`/api/restaurants/${restaurantId}/menu`, data),
  updateMenuItem: (itemId, data) =>
    api.put(`/api/menu-items/${itemId}`, data),
  deleteMenuItem: (itemId) =>
    api.delete(`/api/menu-items/${itemId}`),
  toggleMenuItemAvailability: (itemId, available) =>
    api.patch(`/api/menu-items/${itemId}/availability`, null, {
      params: { available },
    }),

  // Order management for restaurant
  getRestaurantOrders: (restaurantId, params) =>
    api.get(`/api/orders/restaurant/${restaurantId}`, { params }),
  updateOrderStatus: (orderId, status, reason) =>
    api.patch(`/api/orders/${orderId}/status`, { status, reason }),

  // Statistics
  getStatistics: (restaurantId, params) =>
    api.get(`/api/orders/restaurant/${restaurantId}`, { params }),
};

// ============ RESTAURANT ORDERS API ============
export const restaurantOrdersApi = {
  getByRestaurant: (restaurantId, params) =>
    api.get(`/api/restaurant-orders/restaurant/${restaurantId}`, { params }),
  getById: (id) => api.get(`/api/restaurant-orders/${id}`),
  accept: (id, data) => api.post(`/api/restaurant-orders/${id}/accept`, data || null),
  reject: (id, data) => api.post(`/api/restaurant-orders/${id}/reject`, data),
  startPreparing: (id) => api.post(`/api/restaurant-orders/${id}/start-preparing`),
  markReady: (id) => api.post(`/api/restaurant-orders/${id}/ready`),
  markPickedUp: (id) => api.post(`/api/restaurant-orders/${id}/picked-up`),
};

// ============ COURIER API ============
export const courierApi = {
  // Delivery management
  getAvailableDeliveries: () => api.get('/api/deliveries/available'),
  getMyDeliveriesAsCourier: () => api.get('/api/deliveries/courier/me'),
  acceptDelivery: (deliveryId) => api.post(`/api/deliveries/${deliveryId}/accept`),
  updateDeliveryStatus: (deliveryId, status) =>
    api.patch(`/api/deliveries/${deliveryId}/status`, { status }),
  updateLocation: (location) =>
    api.patch('/api/couriers/me/location', location),

  // Courier profile
  getCourierProfile: () => api.get('/api/couriers/me'),
  updateCourierProfile: (data) => api.put('/api/couriers/me', data),
  toggleAvailability: () => api.patch('/api/couriers/me/toggle-availability'),

  // Statistics
  getCourierStats: () => api.get('/api/deliveries/courier/me'),
};

// ============ ADMIN API ============
export const adminApi = {
  // User management
  getAllUsers: (params = {}) => {
    const { search, role, ...rest } = params;
    if (search) {
      return api.get('/api/users/search', { params: { query: search, ...rest } });
    }
    if (role) {
      return api.get(`/api/users/role/${role}`, { params: rest });
    }
    return api.get('/api/users', { params: rest });
  },
  getUserById: (id) => api.get(`/api/users/${id}`),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  updateUserStatus: (id, status) =>
    api.patch(`/api/users/${id}/status`, null, { params: { status } }),
  deleteUser: (id) => api.delete(`/api/users/${id}`),

  // Restaurant management
  getAllRestaurants: (params = {}) =>
    api.get('/api/restaurants', { params: { activeOnly: false, ...params } }),
  activateRestaurant: (id) => api.patch(`/api/restaurants/${id}/activate`),
  deactivateRestaurant: (id) => api.patch(`/api/restaurants/${id}/deactivate`),
  deleteRestaurant: (id) => api.delete(`/api/restaurants/${id}`),

  // Order management
  getAllOrders: (params) => api.get('/api/orders', { params }),
  getOrdersByStatus: (status, params) =>
    api.get(`/api/orders/status/${status}`, { params }),
  getOrderById: (id) => api.get(`/api/orders/${id}`),

  // Courier management
  getAllCouriers: (params) => api.get('/api/couriers', { params }),
  updateCourierStatus: (id, status) =>
    api.patch(`/api/couriers/${id}/status`, { status }),

  // Statistics
  getDashboardStats: () => api.get('/api/users', { params: { size: 1 } }),
  getRevenueStats: (params) => api.get('/api/orders', { params }),
};

export default api;
