import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Ensure axios sends cookies with requests (needed for session cookies)
axios.defaults.withCredentials = true; 

const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: getUserFromStorage(),
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      const storedUser = getUserFromStorage();
      if (storedUser) {
        setAuth({
          token,
          isAuthenticated: true,
          loading: false,
          user: storedUser,
        });
      } else {
        logout();
      }
    } else {
      setAuth({
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      });
    }
  };

  useEffect(() => {
    loadUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/captcha`);
      return { success: true, captchaText: res.data.captchaText };
    } catch (error) {
      console.error('Fetch CAPTCHA error:', error.response?.data?.msg || error.message);
      return { success: false, error: error.response?.data?.msg || 'Failed to fetch CAPTCHA' };
    }
  };

  const login = async (loginId, userCaptchaInput) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { loginId, userCaptchaInput });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      setAuth({
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
        user: res.data.user,
      });
      return { success: true };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Better to delete instead of setting to null
      delete axios.defaults.headers.common['x-auth-token'];
      console.error('Login error:', error.response?.data?.msg || error.message);
      setAuth(prevAuth => ({
        ...prevAuth,
        isAuthenticated: false,
        loading: false,
        token: null,
        user: null,
      }));
      return {
        success: false,
        error: error.response?.data?.msg || 'Login failed',
        newCaptchaText: error.response?.data?.newCaptchaText,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['x-auth-token'];
    setAuth({
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, fetchCaptcha, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
