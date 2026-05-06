// Fallback Wallet Connection - Direct wallet connections
export const fallbackWalletConnection = {
  
  // Simple wallet availability check
  isAnyWalletAvailable() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  },

  // Check if MetaMask is available
  isMetaMaskAvailable() {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask;
  },

  // Check if Trust Wallet is available - Enhanced detection
  isTrustWalletAvailable() {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      return false;
    }
    
    // Multiple Trust Wallet detection methods
    return window.ethereum.isTrust || 
           window.ethereum.isTrustWallet || 
           window.trustwallet ||
           (window.ethereum.providers && window.ethereum.providers.some(p => p.isTrust)) ||
           (typeof window.trustWallet !== 'undefined');
  },

  // Direct MetaMask connection
  async connectMetaMask() {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      console.log('🔄 Attempting direct MetaMask connection...');
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      console.log('✅ Direct MetaMask connection successful:', {
        address,
        chainId: parseInt(chainId, 16)
      });

      return {
        success: true,
        account: address,
        chainId: parseInt(chainId, 16),
        method: 'direct_metamask'
      };
    } catch (error) {
      console.error('❌ Direct MetaMask connection failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect MetaMask'
      };
    }
  },

  // Direct Trust Wallet connection - Enhanced
  async connectTrustWallet() {
    try {
      if (!window.ethereum) {
        throw new Error('Trust Wallet not available');
      }

      console.log('🔄 Attempting Trust Wallet connection...');
      
      // Try to select Trust Wallet provider if multiple providers exist
      let provider = window.ethereum;
      if (window.ethereum.providers && window.ethereum.providers.length > 0) {
        const trustProvider = window.ethereum.providers.find(p => p.isTrust || p.isTrustWallet);
        if (trustProvider) {
          provider = trustProvider;
          console.log('🔄 Using Trust Wallet provider from multiple providers');
        }
      }
      
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const chainId = await provider.request({
        method: 'eth_chainId'
      });

      // Auto-switch to BSC if not already on BSC
      const currentChainId = parseInt(chainId, 16);
      if (currentChainId !== 56) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }] // BSC Mainnet
          });
          console.log('✅ Switched to BSC Mainnet');
        } catch (switchError) {
          if (switchError.code === 4902) {
            // Add BSC network if not exists
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x38',
                chainName: 'BSC Mainnet',
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com'],
                nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
              }]
            });
            console.log('✅ Added and switched to BSC Mainnet');
          }
        }
      }

      console.log('✅ Trust Wallet connection successful:', {
        address,
        chainId: 56 // Force BSC
      });

      return {
        success: true,
        account: address,
        chainId: 56, // Always return BSC for Trust Wallet
        method: 'direct_trustwallet'
      };
    } catch (error) {
      console.error('❌ Trust Wallet connection failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect Trust Wallet'
      };
    }
  },

  // Auto-detect and connect appropriate wallet
  async connectAnyWallet() {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet available');
      }

      console.log('🔄 Auto-detecting wallet type...');
      
      // Check wallet type and connect accordingly
      if (this.isTrustWalletAvailable()) {
        console.log('🔄 Trust Wallet detected');
        return await this.connectTrustWallet();
      } else if (this.isMetaMaskAvailable()) {
        console.log('🔄 MetaMask detected');
        return await this.connectMetaMask();
      } else {
        console.log('🔄 Generic wallet detected');
        // Generic connection for other wallets
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }
        
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });
        
        return {
          success: true,
          account: accounts[0],
          chainId: parseInt(chainId, 16),
          method: 'direct_generic'
        };
      }
    } catch (error) {
      console.error('❌ Auto wallet connection failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect wallet'
      };
    }
  },

  // Get balance using direct wallet
  async getBalance(address) {
    try {
      if (!window.ethereum || !address) {
        throw new Error('Wallet not available or address missing');
      }

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      
      return {
        success: true,
        balance: balanceInEth.toFixed(4),
        balanceWei: balance
      };
    } catch (error) {
      console.error('❌ Balance fetch failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch balance'
      };
    }
  },

  // Send USDT Payment using direct wallet
  async sendUSDTPayment(address, amountUSD) {
    try {
      if (!window.ethereum || !address) {
        throw new Error('Wallet not available or address missing');
      }

      const usdtContractAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT on BSC
      const decimals = 18;
      const value = (amountUSD * Math.pow(10, decimals)).toString(16);
      
      // USDT transfer function signature
      const transferData = '0xa9059cbb' + // transfer function selector
        address.slice(2).padStart(64, '0') + // to address
        value.padStart(64, '0'); // amount

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: usdtContractAddress,
          data: transferData,
          chainId: '0x38' // BSC Mainnet
        }]
      });

      return {
        success: true,
        txHash,
        amount: amountUSD,
        tokenSymbol: 'USDT'
      };
    } catch (error) {
      console.error('❌ USDT payment failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send USDT payment'
      };
    }
  },
};

export default fallbackWalletConnection;