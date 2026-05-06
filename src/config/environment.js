// Environment Configuration - Handles localhost and production settings
export const envConfig = {
  // Environment detection
  isProduction: import.meta.env.VITE_APP_ENV === "production",
  isDevelopment: import.meta.env.DEV,

  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || "https://api.gtnworld.live/",

  // Wallet Configuration
  projectId:
    import.meta.env.VITE_REOWN_PROJECT_ID || "5af094431cbc89a0153658536ff59fcc",
  companyWallet:
    import.meta.env.VITE_COMPANY_WALLET ||
    "0xC58baf9E149dD09e1bA3b9ea83a223D3591Ec03D",

  // Network Configuration
  get networks() {
    const networkType = import.meta.env.VITE_NETWORK_TYPE || "eth";

    if (networkType === "bnb") {
      // Always use BSC Mainnet for BNB network type
      return {
        primary: {
          chainId: 56,
          name: "BSC Mainnet",
          rpcUrl: "https://bsc-dataseed.binance.org/",
          blockExplorer: "https://bscscan.com",
          nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        },
      };
    }

    // Default Ethereum networks
    return this.isProduction
      ? {
          primary: {
            chainId: 1,
            name: "Ethereum Mainnet",
            rpcUrl: "https://mainnet.infura.io/v3/",
            blockExplorer: "https://etherscan.io",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          },
          fallback: {
            chainId: 11155111,
            name: "Sepolia Testnet",
            rpcUrl: "https://sepolia.infura.io/v3/",
            blockExplorer: "https://sepolia.etherscan.io",
            nativeCurrency: {
              name: "Sepolia Ether",
              symbol: "ETH",
              decimals: 18,
            },
          },
        }
      : {
          primary: {
            chainId: 11155111,
            name: "Sepolia Testnet",
            rpcUrl: "https://sepolia.infura.io/v3/",
            blockExplorer: "https://sepolia.etherscan.io",
            nativeCurrency: {
              name: "Sepolia Ether",
              symbol: "ETH",
              decimals: 18,
            },
          },
        };
  },

  // Token Price Configuration
  get tokenPriceUSD() {
    const networkType = import.meta.env.VITE_NETWORK_TYPE || "eth";
    if (networkType === "bnb") {
      return 774; // Updated BNB price in USD (current market price)
    }
    return this.isProduction ? 2500 : 2000; // ETH price
  },

  // Dynamic price fetching
  async fetchCurrentBNBPrice() {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.warn('Failed to fetch current BNB price, using fallback:', error);
      return 774; // Fallback price
    }
  },

  // Calculate exact BNB amount for USD
  async calculateBNBForUSD(usdAmount) {
    const currentPrice = await this.fetchCurrentBNBPrice();
    return (usdAmount / currentPrice).toFixed(6);
  },

  // Wallet Connection Settings
  get walletSettings() {
    return {
      timeout: this.isProduction ? 45000 : 30000, // 45s for prod, 30s for dev
      retryAttempts: this.isProduction ? 3 : 2,
      enableAnalytics: false, // Disable analytics for localhost
      enableOnramp: this.isProduction,
      themeMode: "light",
      featuredWallets: [
        "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
        "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
        "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa", // Coinbase Wallet
      ],
    };
  },

  // App Metadata
  get appMetadata() {
    return {
      name: "GrowTradeNFT",
      description: "NFT Trading Platform",
      url:
        typeof window !== "undefined"
          ? window.location.origin
          : "https://gtnworld.live",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    };
  },

  // Debug Settings
  get debugSettings() {
    return {
      enableConsoleLogging: !this.isProduction,
      enableWalletDebug: !this.isProduction,
      logLevel: this.isProduction ? "error" : "debug",
    };
  },

  // Validation
  validate() {
    const errors = [];

    if (!this.projectId) {
      errors.push("VITE_REOWN_PROJECT_ID is missing");
    }

    if (!this.companyWallet || !this.companyWallet.startsWith("0x")) {
      errors.push("VITE_COMPANY_WALLET is missing or invalid");
    }

    if (!this.apiUrl) {
      errors.push("VITE_API_URL is missing");
    }

    if (errors.length > 0) {
      console.error("❌ Environment Configuration Errors:", errors);
      return { valid: false, errors };
    }

    console.log("✅ Environment configuration is valid");
    return { valid: true, errors: [] };
  },

  // Get current environment info
  getInfo() {
    return {
      environment: this.isProduction ? "production" : "development",
      apiUrl: this.apiUrl,
      projectId: this.projectId ? "✅ Set" : "❌ Missing",
      companyWallet: this.companyWallet ? "✅ Set" : "❌ Missing",
      primaryNetwork: this.networks.primary.name,
      ethPrice: this.ethPriceUSD,
      debugEnabled: this.debugSettings.enableConsoleLogging,
    };
  },
};

// Auto-validate on import
envConfig.validate();

export default envConfig;
