import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, recipeService } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smartplate_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartplate_token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('smartplate_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('smartplate_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('smartplate_token');
      localStorage.removeItem('smartplate_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('smartplate_token', res.data.token);
        localStorage.setItem('smartplate_user', JSON.stringify(res.data.user));
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await authService.register({ name, email, password, confirmPassword });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('smartplate_token', res.data.token);
        localStorage.setItem('smartplate_user', JSON.stringify(res.data.user));
        showToast(`Account created! Welcome, ${res.data.user.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('smartplate_token');
      localStorage.removeItem('smartplate_user');
      showToast('Logged out successfully', 'info');
    }
  };

  const updateProfile = async (name, email) => {
    try {
      const res = await authService.updateProfile({ name, email });
      if (res.data.success) {
        setUser((prev) => ({ ...prev, ...res.data.user }));
        localStorage.setItem('smartplate_user', JSON.stringify({ ...user, ...res.data.user }));
        showToast('Profile updated successfully', 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      if (res.data.success) {
        showToast('Password changed successfully', 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const toggleFavorite = async (recipeId) => {
    if (!user) {
      showToast('Please log in to save recipes to your favorites', 'info');
      return false;
    }
    try {
      const res = await recipeService.toggleFavorite(recipeId);
      if (res.data.success) {
        const isFav = res.data.isFavorite;
        setUser((prev) => {
          if (!prev) return prev;
          const currentFavs = prev.favorites || [];
          const updatedFavs = isFav
            ? [...currentFavs, recipeId]
            : currentFavs.filter((id) => (id._id || id).toString() !== recipeId.toString());
          const updatedUser = { ...prev, favorites: updatedFavs };
          localStorage.setItem('smartplate_user', JSON.stringify(updatedUser));
          return updatedUser;
        });
        showToast(res.data.message, 'success');
        return isFav;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const isFavorite = (recipeId) => {
    if (!user || !user.favorites) return false;
    return user.favorites.some(
      (f) => (f._id || f).toString() === recipeId?.toString()
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        fetchCurrentUser,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
