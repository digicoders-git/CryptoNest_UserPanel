// Wallet utility functions for global wallet management

export const getWalletBalance = () => {
  const balance = localStorage.getItem('walletBalance') || sessionStorage.getItem('walletBalance');
  return balance ? parseFloat(balance) : 0;
};

export const updateWalletBalance = (newBalance) => {
  localStorage.setItem('walletBalance', newBalance.toString());
  sessionStorage.setItem('walletBalance', newBalance.toString());
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('walletBalanceUpdate', {
    detail: { balance: newBalance }
  }));
};

export const deductFromWallet = (amount) => {
  const currentBalance = getWalletBalance();
  if (currentBalance >= amount) {
    const newBalance = currentBalance - amount;
    updateWalletBalance(newBalance);
    return { success: true, newBalance };
  }
  return { success: false, message: 'Insufficient balance' };
};

export const addToWallet = (amount) => {
  const currentBalance = getWalletBalance();
  const newBalance = currentBalance + amount;
  updateWalletBalance(newBalance);
  return { success: true, newBalance };
};

// Listen for wallet balance updates
export const onWalletBalanceChange = (callback) => {
  const handleBalanceUpdate = (event) => {
    callback(event.detail.balance);
  };
  
  window.addEventListener('walletBalanceUpdate', handleBalanceUpdate);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('walletBalanceUpdate', handleBalanceUpdate);
  };
};