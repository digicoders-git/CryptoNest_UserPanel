import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/api`;

// Get auth token
const getAuthToken = () => localStorage.getItem('token');

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Package/Plan APIs
export const packageAPI = {
  getPlans: () => apiClient.get('/package/plans'),
  upgrade: () => apiClient.post('/package/upgrade'),
};

// GTN Token APIs
export const gtnAPI = {
  getStatus: () => apiClient.get('/gtn/status'),
  buyPreLaunch: () => apiClient.post('/gtn/buy-prelaunch'),
  stakeToken: (tokenId) => apiClient.post('/gtn/stake', { tokenId }),
  burnToken: (tokenId) => apiClient.post('/gtn/burn', { tokenId }),
  getMyTokens: () => apiClient.get('/gtn/my-tokens'),
};

// Wallet APIs
export const walletAPI = {
  getBalance: () => apiClient.get('/wallet/balance'),
  getProfit: () => apiClient.get('/wallet/profit'),
  withdraw: (amount, walletAddress) => apiClient.post('/wallet/withdraw', { amount, walletAddress }),
};

// User APIs
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  getTransactions: () => apiClient.get('/user/transactions'),
  getTeam: () => apiClient.get('/user/team'),
};

export default {
  packageAPI,
  gtnAPI,
  walletAPI,
  userAPI,
};