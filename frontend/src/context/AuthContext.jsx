import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, guestsApi } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('luxurystay_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('luxurystay_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('luxurystay_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('luxurystay_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        // If 401 or inactive, clear session
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('luxurystay_token');
          localStorage.removeItem('luxurystay_user');
          setUser(null);
          setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      
      localStorage.setItem('luxurystay_token', receivedToken);
      localStorage.setItem('luxurystay_user', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed. Please check credentials.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const registerGuest = async (formData) => {
    setIsLoading(true);
    try {
      const res = await guestsApi.register(formData);
      return {
        success: true,
        message: res.data?.message || 'Registration successful. Please verify your email to log in.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignored: always clear local storage even if backend fails
    } finally {
      localStorage.removeItem('luxurystay_token');
      localStorage.removeItem('luxurystay_user');
      setUser(null);
      setToken(null);
    }
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isManager: ['admin', 'manager'].includes(user?.role),
    isFrontDesk: ['admin', 'manager', 'receptionist'].includes(user?.role),
    isHousekeeping: user?.role === 'housekeeping',
    isMaintenance: user?.role === 'maintenance',
    isGuest: user?.role === 'guest',
    hasRole,
    login,
    registerGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
