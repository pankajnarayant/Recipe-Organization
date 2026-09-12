import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartplate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear from storage
      const token = localStorage.getItem('smartplate_token');
      if (token && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('smartplate_token');
        localStorage.removeItem('smartplate_user');
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Recipe Services
export const recipeService = {
  getRecipes: (params) => api.get('/recipes', { params }),
  getRecipeById: (id) => api.get(`/recipes/${id}`),
  createRecipe: (data) => api.post('/recipes', data),
  updateRecipe: (id, data) => api.put(`/recipes/${id}`, data),
  deleteRecipe: (id) => api.delete(`/recipes/${id}`),
  toggleFavorite: (id) => api.post(`/recipes/${id}/favorite`),
  getFavorites: () => api.get('/recipes/favorites'),
};

// Meal Plan Services
export const mealPlanService = {
  getPlanByWeek: (weekStartDate) => api.get(`/meal-plans/${weekStartDate}`),
  addOrUpdateMeal: (data) => api.post('/meal-plans', data),
  removeMealSlot: (slotId) => api.delete(`/meal-plans/slot/${slotId}`),
  clearWeekPlan: (weekStartDate) => api.delete(`/meal-plans/week/${weekStartDate}`),
};

// Shopping List Services
export const shoppingListService = {
  getList: () => api.get('/shopping-list'),
  generateFromPlan: (data) => api.post('/shopping-list/generate', data),
  addManualItem: (data) => api.post('/shopping-list', data),
  updateItem: (id, data) => api.put(`/shopping-list/${id}`, data),
  togglePurchased: (id) => api.put(`/shopping-list/${id}/toggle`),
  deleteItem: (id) => api.delete(`/shopping-list/${id}`),
  clearPurchased: () => api.delete('/shopping-list/purchased'),
  clearAll: () => api.delete('/shopping-list/all'),
};

export default api;
