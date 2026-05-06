// Network Information Utility - Updated for BNB Support
export const networkChecker = {
  
  // Get current network details
  getCurrentNetwork() {
    const isProduction = import.meta.env.VITE_APP_ENV === 'production';
    const companyWallet = import.meta.env.VITE_COMPANY_WALLET;
    const networkType = import.meta.env.VITE_NETWORK_TYPE || 'eth';
    
    if (networkType === 'bnb') {
      return {
        environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
        primaryNetwork: isProduction ? 'BSC Mainnet' : 'BSC Testnet',
        chainId: isProduction ? 56 : 97,
        companyWallet: companyWallet,
        tokenPrice: isProduction ? '$600' : '$500 (Test)',
        tokenSymbol: 'BNB',
        isRealMoney: isProduction,
        networkType: isProduction ? 'BSC MAINNET (REAL MONEY)' : 'BSC TESTNET (FAKE MONEY)',
        explorerUrl: isProduction ? 'https://bscscan.com' : 'https://testnet.bscscan.com'
      };
    }
    
    // Default Ethereum
    return {
      environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
      primaryNetwork: isProduction ? 'Ethereum Mainnet' : 'Sepolia Testnet',
      chainId: isProduction ? 1 : 11155111,
      companyWallet: companyWallet,
      tokenPrice: isProduction ? '$2500' : '$2000 (Test)',
      tokenSymbol: 'ETH',
      isRealMoney: isProduction,
      networkType: isProduction ? 'MAINNET (REAL MONEY)' : 'TESTNET (FAKE MONEY)',
      explorerUrl: isProduction ? 'https://etherscan.io' : 'https://sepolia.etherscan.io'
    };
  },

  // Display network info in console
  logNetworkInfo() {
    const network = this.getCurrentNetwork();
    
    console.group('💰 PAYMENT NETWORK INFORMATION');
    console.log('🌍 Environment:', network.environment);
    console.log('🔗 Network:', network.primaryNetwork);
    console.log('🆔 Chain ID:', network.chainId);
    console.log('💳 Company Wallet:', network.companyWallet);
    console.log('💵 Token Price:', network.tokenPrice);
    console.log('🪙 Token Symbol:', network.tokenSymbol);
    console.log('⚠️  Money Type:', network.networkType);
    
    if (network.isRealMoney) {
      console.warn(`🚨 WARNING: THIS IS REAL MONEY ON ${network.primaryNetwork.toUpperCase()}!`);
      console.warn(`🚨 Payments will be sent using ${network.tokenSymbol}`);
    } else {
      console.info(`ℹ️  INFO: This is testnet - fake ${network.tokenSymbol} only`);
      console.info(`ℹ️  Payments will be sent to ${network.primaryNetwork}`);
    }
    console.groupEnd();
    
    return network;
  },

  // Get network explorer URL
  getExplorerUrl(txHash = null) {
    const network = this.getCurrentNetwork();
    const baseUrl = network.explorerUrl;
    
    if (txHash) {
      return `${baseUrl}/tx/${txHash}`;
    }
    
    return `${baseUrl}/address/${network.companyWallet}`;
  },

  // Check if user is on correct network
  async checkUserNetwork() {
    try {
      if (!window.ethereum) {
        return { success: false, error: 'No wallet connected' };
      }

      const userChainId = await window.ethereum.request({
        method: 'eth_chainId'
      });
      
      const userChainIdDecimal = parseInt(userChainId, 16);
      const expectedNetwork = this.getCurrentNetwork();
      
      const isCorrectNetwork = userChainIdDecimal === expectedNetwork.chainId;
      
      return {
        success: true,
        userChainId: userChainIdDecimal,
        expectedChainId: expectedNetwork.chainId,
        isCorrectNetwork,
        userNetworkName: this.getNetworkName(userChainIdDecimal),
        expectedNetworkName: expectedNetwork.primaryNetwork
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get network name by chain ID
  getNetworkName(chainId) {
    const networks = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai'
    };
    
    return networks[chainId] || `Unknown Network (${chainId})`;
  },

  // Display payment warning
  showPaymentWarning() {
    const network = this.getCurrentNetwork();
    
    const warningMessage = network.isRealMoney 
      ? `🚨 REAL MONEY ALERT!\n\nYour payment will go to:\n• Network: ${network.primaryNetwork}\n• Company Wallet: ${network.companyWallet}\n• Token: ${network.tokenSymbol}\n• This is REAL ${network.tokenSymbol} on ${network.primaryNetwork}\n\nProceed only if you understand this!`
      : `ℹ️ TEST NETWORK INFO\n\nYour payment will go to:\n• Network: ${network.primaryNetwork}\n• Company Wallet: ${network.companyWallet}\n• Token: ${network.tokenSymbol}\n• This is TESTNET (fake ${network.tokenSymbol})\n\nThis is safe for testing!`;
    
    return {
      message: warningMessage,
      isRealMoney: network.isRealMoney,
      network: network
    };
  }
};

export default networkChecker;