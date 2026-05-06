const BNB_TOKEN_ADDRESS = import.meta.env.VITE_BNB_TOKEN_ADDRESS || '0xB8c77482e45F1F44dE1745F52C74426C631bDD52';
const USDT_TOKEN_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // USDT on BSC Mainnet

const bnbTokenUtils = {
  async getBNBTokenBalance(address) {
    if (!window.ethereum || !address) return '0';
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: BNB_TOKEN_ADDRESS,
          data: `0x70a08231000000000000000000000000${address.slice(2)}`
        }, 'latest']
      });
      
      return (parseInt(balance, 16) / 1e18).toFixed(4);
    } catch (error) {
      console.error('Error fetching BNB token balance:', error);
      return '0';
    }
  },

  async getUSDTBalance(address) {
    if (!window.ethereum || !address) {
      return { success: false, balance: '0' };
    }
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: USDT_TOKEN_ADDRESS,
          data: `0x70a08231000000000000000000000000${address.slice(2)}`
        }, 'latest']
      });
      
      const balanceInUSDT = (parseInt(balance, 16) / 1e18).toFixed(2);
      return { success: true, balance: balanceInUSDT };
    } catch (error) {
      console.error('Error fetching USDT balance:', error);
      return { success: false, balance: '0' };
    }
  },

  async addBNBTokenToWallet() {
    if (!window.ethereum) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: BNB_TOKEN_ADDRESS,
            symbol: 'BNB',
            decimals: 18,
          },
        },
      });
      return true;
    } catch (error) {
      console.error('Error adding BNB token:', error);
      return false;
    }
  }
};

export default bnbTokenUtils;