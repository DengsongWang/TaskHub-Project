import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 添加缺失的 tokenRefreshed 状态
  const [tokenRefreshed, setTokenRefreshed] = useState(false);

  // 当组件挂载时尝试从token恢复用户会话
  useEffect(() => {
    const loadUser = async () => {
      // 先检查localStorage，再检查sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        try {
          setLoading(true);
          const response = await authService.getCurrentUser();
          setCurrentUser(response.data);
          setTokenRefreshed(true);
        } catch (err) {
          console.error('Failed to load user', err);
          // 清除无效令牌
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setCurrentUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
  
    loadUser();
  }, []);

  // 用户登录方法
  const login = async (credentials, rememberMe = false) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      
      if (rememberMe) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('remember', 'true');
      } else {
        sessionStorage.setItem('token', response.data.access_token);
        localStorage.removeItem('remember');
        localStorage.removeItem('token'); // 确保清除localStorage中的token
      }
      // 获取用户信息
      const userResponse = await authService.getCurrentUser();
      setCurrentUser(userResponse.data);
      setTokenRefreshed(true);
      return true;
    } catch (err) {
      console.error("Auth error in login:", err);
      setError(err.response?.data?.error || 'Login failed');
      return false;
    }
  };

  // 用户注册方法
  const register = async (userData) => {
    try {
      setError(null);
      await authService.register(userData);
      // 注册成功后自动登录
      return await login({
        username: userData.username,
        password: userData.password
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  // 用户注销方法
  const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('remember');
  sessionStorage.removeItem('token');
  setCurrentUser(null);
  setTokenRefreshed(false);
};

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    tokenRefreshed // 导出token刷新状态供组件使用
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
