const networkSwitcher = {
  async switchToNetwork(chainId) {
    if (!window.ethereum) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      return true;
    } catch (error) {
      console.error('Network switch failed:', error);
      return false;
    }
  },
  
  async switchToTargetNetwork() {
    // Always switch to BSC Mainnet for BNB network type
    if (import.meta.env.VITE_NETWORK_TYPE === 'bnb') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }] // BSC Mainnet
        });
        return { success: true };
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x38',
                chainName: 'BSC Mainnet',
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com'],
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18
                }
              }]
            });
            return { success: true };
          } catch (addError) {
            console.error('Failed to add BSC network:', addError);
            return { success: false, error: addError.message };
          }
        }
        return { success: false, error: switchError.message };
      }
    }
    return { success: false, error: 'Network type not supported' };
  }
};

export default networkSwitcher;