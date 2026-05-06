import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  checkEmail: (email) => api.post('/auth/check-email', { email }), // Email check API
  register: (userData) => api.post('/auth/register', userData), // ✅ API #2,3,4
  login: (credentials) => api.post('/auth/login', credentials), // ✅ API #5,6
  getAllUsers: () => api.get('/auth/Getuser'), // ✅ API #7
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'), // ✅ API #13
  updateProfile: (data) => api.put('/user/update-profile', data), // ✅ Update Profile
  getDashboard: () => api.get('/user/dashboard'), // ✅ API #12
  getTeam: () => api.get('/user/team'), // ✅ API #17
  getTransactions: () => api.get('/user/transactions'), // ✅ API #14
  getMLMTree: () => api.get('/user/mlm-tree'), // ✅ API #15
  getMLMEarnings: () => api.get('/user/mlm-earnings'), // ✅ API #16
};

// Wallet API
export const walletAPI = {
  activate: (paymentData) => api.post('/wallet/activate', paymentData), // ✅ API #8
  withdraw: (amount, walletAddress) => api.post('/wallet/withdraw', { amount, walletAddress }), // ✅ API #10
  getBalance: () => api.get('/wallet/balance'), // ✅ API #9
  getTransactions: () => api.get('/wallet/transactions'),
  recordPayment: (paymentData) => api.post('/wallet/record-payment', paymentData), // Record real crypto payment
  addBalance: (amount) => api.post('/admin/demo-add-balance', { amount }), // Add balance to database
};

// Demo Payment API (NEW)
export const demoAPI = {
  addDemoBalance: (amount) => api.post('/demo/add-demo-balance', { amount }), // ✅ API #11
};

// NFT API
export const nftAPI = {
  initializeSystem: () => api.post('/nft/initialize'), // ✅ API #18
  getNFTStatus: () => api.get('/nft/status'), // ✅ API #19
  getMarketplace: () => api.get('/nft/marketplace'), // ✅ API #20
  buyPreLaunchNFT: () => api.post('/nft/buy-prelaunch'), // ✅ API #21
  buyTradingNFT: () => api.post('/nft/buy-trading'), // ✅ API #22
  sellNFT: (nftId) => api.post(`/nft/sell/${nftId}`), // ✅ API #23
  getMyNFTs: () => api.get('/nft/my-nfts'), // ✅ API #24
  stakeNFT: (nftId) => api.post('/nft/stake', { nftId }), // ✅ API #25
  burnNFT: (nftId) => api.post('/nft/burn', { nftId }), // ✅ API #26
  // Legacy support
  buyNFT: (nftId) => api.post('/nft/buy', { nftId }),
};

// Package API
export const packageAPI = {
  getPlans: () => api.get('/package/plans'), // ✅ API #27
  upgrade: () => api.post('/package/upgrade'), // ✅ API #28
  getCurrent: () => api.get('/package/current'), // ✅ API #29
};

// MLM API
export const mlmAPI = {
  getHierarchy: () => api.get('/mlm/hierarchy'), // ✅ API #30
  getUserTree: (userId) => api.get(`/mlm/user/${userId}/tree`), // ✅ API #31
  getUserStats: (userId) => api.get(`/mlm/user/${userId}/stats`), // ✅ API #32
  getRootUsers: () => api.get('/mlm/root-users'), // ✅ API #33
};

// Contact API
export const contactAPI = {
  create: (contactData) => api.post('/contacts', contactData), // ✅ API #51
  getAll: () => api.get('/contacts'), // ✅ API #52
  getById: (id) => api.get(`/contacts/${id}`), // ✅ API #53
  update: (id, contactData) => api.put(`/contacts/${id}`, contactData), // ✅ API #54
};

export default api;