// Enhanced Wallet Debug Utility - Fixed for production and localhost
export const walletDebug = {
  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask;
  },

  // Check if any wallet is installed
  isWalletInstalled() {
    if (typeof window === 'undefined') return false;
    
    // Check for various wallet providers
    return !!(window.ethereum || 
             window.web3 || 
             window.trustWallet || 
             window.coinbaseWalletExtension);
  },

  // Get browser info
  getBrowserInfo() {
    if (typeof navigator === 'undefined') {
      return { browser: 'Unknown', userAgent: '', isMobile: false };
    }
    
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    
    return {
      browser,
      userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent)
    };
  },

  // Enhanced connectivity check
  async checkConnectivity() {
    if (typeof navigator === 'undefined') return false;
    
    try {
      // Primary check - navigator.onLine
      if (!navigator.onLine) return false;
      
      // Secondary check - try to fetch a small resource
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.warn('Connectivity check failed:', error.message);
      return navigator.onLine; // Fallback to browser status
    }
  },

  // Enhanced wallet detection
  getWalletInfo() {
    if (typeof window === 'undefined') return null;
    
    const info = {
      hasEthereum: !!window.ethereum,
      isMetaMask: !!(window.ethereum && window.ethereum.isMetaMask),
      isTrust: !!(window.ethereum && (window.ethereum.isTrust || window.ethereum.isTrustWallet)),
      isCoinbase: !!(window.ethereum && (window.ethereum.isCoinbaseWallet || window.ethereum.isWalletLink)),
      isRabby: !!(window.ethereum && window.ethereum.isRabby),
      providers: [],
      injectedProviders: 0
    };

    if (window.ethereum) {
      // Handle multiple providers
      if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        info.injectedProviders = window.ethereum.providers.length;
        info.providers = window.ethereum.providers.map(p => ({
          isMetaMask: !!p.isMetaMask,
          isTrust: !!(p.isTrust || p.isTrustWallet),
          isCoinbaseWallet: !!(p.isCoinbaseWallet || p.isWalletLink),
          isRabby: !!p.isRabby,
          name: this.getProviderName(p)
        }));
      } else {
        info.injectedProviders = 1;
        info.providers.push({
          isMetaMask: !!window.ethereum.isMetaMask,
          isTrust: !!(window.ethereum.isTrust || window.ethereum.isTrustWallet),
          isCoinbaseWallet: !!(window.ethereum.isCoinbaseWallet || window.ethereum.isWalletLink),
          isRabby: !!window.ethereum.isRabby,
          name: this.getProviderName(window.ethereum)
        });
      }
    }

    return info;
  },

  // Get provider name
  getProviderName(provider) {
    if (provider.isMetaMask) return 'MetaMask';
    if (provider.isTrust || provider.isTrustWallet) return 'Trust Wallet';
    if (provider.isCoinbaseWallet || provider.isWalletLink) return 'Coinbase Wallet';
    if (provider.isRabby) return 'Rabby Wallet';
    return 'Unknown Wallet';
  },

  // Check environment
  getEnvironmentInfo() {
    return {
      isProduction: import.meta.env.VITE_APP_ENV === 'production',
      isDevelopment: import.meta.env.DEV,
      projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
      apiUrl: import.meta.env.VITE_API_URL,
      companyWallet: import.meta.env.VITE_COMPANY_WALLET,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
      origin: typeof window !== 'undefined' ? window.location.origin : 'N/A'
    };
  },

  // Generate comprehensive debug report
  async generateDebugReport() {
    const browserInfo = this.getBrowserInfo();
    const walletInfo = this.getWalletInfo();
    const envInfo = this.getEnvironmentInfo();
    const connectivity = await this.checkConnectivity();
    
    return {
      timestamp: new Date().toISOString(),
      environment: envInfo,
      browser: browserInfo,
      wallet: walletInfo,
      connectivity,
      recommendations: this.getRecommendations(browserInfo, walletInfo)
    };
  },

  // Get recommendations based on current state
  getRecommendations(browserInfo, walletInfo) {
    const recommendations = [];
    
    if (!walletInfo?.hasEthereum) {
      recommendations.push('Install a Web3 wallet like MetaMask, Trust Wallet, or Coinbase Wallet');
    }
    
    if (browserInfo.isMobile && !walletInfo?.hasEthereum) {
      recommendations.push('Use Trust Wallet or MetaMask mobile app with built-in browser');
    }
    
    if (browserInfo.browser === 'Safari' && browserInfo.isMobile) {
      recommendations.push('Consider using Chrome or Firefox for better Web3 compatibility');
    }
    
    if (walletInfo?.injectedProviders > 1) {
      recommendations.push('Multiple wallets detected - you may need to disable some extensions to avoid conflicts');
    }
    
    return recommendations;
  },

  // Enhanced logging with better formatting
  async logDebugInfo() {
    const report = await this.generateDebugReport();
    
    console.group('🔍 Wallet Debug Report - ' + new Date().toLocaleTimeString());
    
    // Environment info
    console.group('🌍 Environment');
    console.log('Mode:', report.environment.isProduction ? 'Production 🚀' : 'Development 🛠️');
    console.log('Project ID:', report.environment.projectId ? '✅' : '❌ Missing');
    console.log('API URL:', report.environment.apiUrl);
    console.log('Company Wallet:', report.environment.companyWallet ? '✅' : '❌ Missing');
    console.groupEnd();
    
    // Browser info
    console.group('🌐 Browser');
    console.log('Browser:', report.browser.browser);
    console.log('Platform:', report.browser.isMobile ? 'Mobile 📱' : 'Desktop 💻');
    if (report.browser.isMobile) {
      console.log('Mobile OS:', report.browser.isIOS ? 'iOS' : report.browser.isAndroid ? 'Android' : 'Unknown');
    }
    console.groupEnd();
    
    // Wallet info
    console.group('💼 Wallet Status');
    console.log('Web3 Available:', report.wallet?.hasEthereum ? '✅' : '❌');
    console.log('Internet Connection:', report.connectivity ? '✅' : '❌');
    
    if (report.wallet?.hasEthereum) {
      console.log('Detected Wallets:');
      report.wallet.providers.forEach((provider, index) => {
        console.log(`  ${index + 1}. ${provider.name} ✅`);
      });
      
      if (report.wallet.injectedProviders > 1) {
        console.warn('⚠️ Multiple wallet providers detected - this may cause conflicts');
      }
    }
    console.groupEnd();
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.group('💡 Recommendations');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
      console.groupEnd();
    }
    
    // Quick links for mobile users
    if (report.browser.isMobile && !report.wallet?.hasEthereum) {
      console.group('🔗 Quick Install Links');
      console.log('MetaMask Mobile: https://metamask.io/download/');
      console.log('Trust Wallet: https://trustwallet.com/download');
      console.log('Coinbase Wallet: https://wallet.coinbase.com/');
      console.groupEnd();
    }
    
    console.log('📄 Full Report Object:', report);
    console.groupEnd();
    
    return report;
  },

  // Test wallet connection capability
  async testWalletConnection() {
    console.log('🧪 Testing wallet connection capability...');
    
    if (!this.isWalletInstalled()) {
      console.error('❌ No wallet installed');
      return { success: false, error: 'No wallet installed' };
    }
    
    try {
      // Try to get accounts (this will trigger connection if not connected)
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('✅ Wallet test successful. Connected accounts:', accounts.length);
      return { success: true, accounts };
    } catch (error) {
      console.error('❌ Wallet test failed:', error);
      return { success: false, error: error.message };
    }
  }
};

export default walletDebug;