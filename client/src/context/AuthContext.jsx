import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('trio_treats_token') || null);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('trio_treats_admin_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Check saved session on load
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.user) {
            setUser(res.user);
          }
        } catch (e) {
          console.warn('Session expired, clearing token');
          localStorage.removeItem('trio_treats_token');
          setToken(null);
          setUser(null);
        }
      }

      if (adminToken) {
        const savedAdmin = localStorage.getItem('trio_treats_admin_profile');
        if (savedAdmin) {
          try {
            setAdmin(JSON.parse(savedAdmin));
          } catch (e) {}
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token, adminToken]);

  // Customer Register
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.token) {
      localStorage.setItem('trio_treats_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  // Customer Login
  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.token) {
      localStorage.setItem('trio_treats_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  // Admin Login
  const adminLogin = async (credentials) => {
    const res = await api.post('/auth/admin/login', credentials);
    if (res.token) {
      localStorage.setItem('trio_treats_admin_token', res.token);
      localStorage.setItem('trio_treats_admin_profile', JSON.stringify(res.admin));
      setAdminToken(res.token);
      setAdmin(res.admin);
    }
    return res;
  };

  // Customer Logout
  const logout = () => {
    localStorage.removeItem('trio_treats_token');
    setToken(null);
    setUser(null);
  };

  // Admin Logout
  const adminLogout = () => {
    localStorage.removeItem('trio_treats_admin_token');
    localStorage.removeItem('trio_treats_admin_profile');
    setAdminToken(null);
    setAdmin(null);
  };

  // Save new delivery address
  const saveAddress = async (addressData) => {
    if (!token) return;
    const res = await api.post('/auth/addresses', addressData);
    if (res.addresses && user) {
      setUser({ ...user, savedAddresses: res.addresses });
    }
    return res;
  };

  // Delete saved address
  const deleteAddress = async (addressId) => {
    if (!token) return;
    const res = await api.delete(`/auth/addresses/${addressId}`);
    if (res.addresses && user) {
      setUser({ ...user, savedAddresses: res.addresses });
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        token,
        adminToken,
        isLoading,
        isAuthenticated: !!user,
        isAdminAuthenticated: !!admin,
        register,
        login,
        adminLogin,
        logout,
        adminLogout,
        saveAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
