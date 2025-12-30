import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await authApi.getCurrentUser();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { accessToken, refreshToken, user: userData } = response.data;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid email or password',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      // Auto-login after registration
      const { accessToken, refreshToken, user: newUser } = response.data;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data) => {
    try {
      const response = await authApi.updateProfile(data);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
      };
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    // Support both single role and roles array
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.includes(role);
    }
    return user.role === role;
  };

  // Become a courier - adds COURIER role
  const becomeCourier = async (data) => {
    try {
      const response = await authApi.becomeCourier(data);
      const { accessToken, refreshToken, user: updatedUser } = response.data;

      // Update tokens if new ones are provided
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Update user with new roles
      if (updatedUser) {
        setUser(updatedUser);
      } else {
        // Refresh user data to get updated roles
        await checkAuth();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to become courier',
      };
    }
  };

  // Become a restaurant owner - adds RESTAURANT role
  const becomeRestaurant = async (data) => {
    try {
      const response = await authApi.becomeRestaurant(data);
      const { accessToken, refreshToken, user: updatedUser } = response.data;

      // Update tokens if new ones are provided
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Update user with new roles
      if (updatedUser) {
        setUser(updatedUser);
      } else {
        // Refresh user data to get updated roles
        await checkAuth();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to become restaurant owner',
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    hasRole,
    becomeCourier,
    becomeRestaurant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
