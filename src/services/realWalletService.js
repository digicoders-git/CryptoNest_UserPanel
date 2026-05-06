// RealWalletService.js - Fixed for both localhost and production
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia, mainnet, bsc, bscTestnet } from "viem/chains";
import { parseEther, formatEther, encodeFunctionData } from "viem";
import {
  getBalance,
  sendTransaction,
  waitForTransactionReceipt,
  getAccount,
  getChainId,
} from "@wagmi/core";
import networkUtils from "../utils/networkUtils";
import envConfig from "../config/environment";
import fallbackWalletConnection from "../utils/fallbackWallet";

/* ------------------------------------------------------------------ */
/* CONFIG - Environment-based configuration */
/* ------------------------------------------------------------------ */

const { projectId, companyWallet, isProduction, walletSettings, appMetadata } = envConfig;
const tokenPriceUSD = envConfig.tokenPriceUSD;
const networkType = import.meta.env.VITE_NETWORK_TYPE || 'eth';

// Network configuration based on environment and network type
const networks = (() => {
  if (networkType === 'bnb') {
    return [bsc]; // Always use BSC Mainnet for BNB network type
  }
  return isProduction ? [mainnet, sepolia] : [sepolia];
})();

const defaultChainId = (() => {
  if (networkType === 'bnb') {
    return 56; // Always BSC Mainnet for BNB network type
  }
  return isProduction ? 1 : 11155111; // Ethereum Mainnet : Sepolia
})();

/* ------------------------------------------------------------------ */
/* SINGLETON WALLET KIT - Fixed initialization */
/* ------------------------------------------------------------------ */

let modalInstance = null;
let wagmiAdapterInstance = null;
let isInitialized = false;

function initializeWalletKit() {
  if (isInitialized) {
    return {
      modal: modalInstance,
      wagmiConfig: wagmiAdapterInstance?.wagmiConfig,
    };
  }

  try {
    console.log('🔄 Initializing WalletKit with Project ID:', projectId);
    
    // Create Wagmi adapter
    wagmiAdapterInstance = new WagmiAdapter({
      projectId,
      networks,
    });

    // Create AppKit modal
    modalInstance = createAppKit({
      adapters: [wagmiAdapterInstance],
      networks,
      projectId,
      metadata: appMetadata,
      enableAnalytics: walletSettings.enableAnalytics,
      enableOnramp: walletSettings.enableOnramp,
      enableInjected: true,
      allWallets: "SHOW",
      themeMode: walletSettings.themeMode,
      featuredWalletIds: walletSettings.featuredWallets,
    });

    isInitialized = true;
    console.log('✅ WalletKit initialized successfully');
    
    return {
      modal: modalInstance,
      wagmiConfig: wagmiAdapterInstance.wagmiConfig,
    };
  } catch (error) {
    console.error('❌ WalletKit initialization failed:', error);
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* SERVICE CLASS */
/* ------------------------------------------------------------------ */

class RealWalletService {
  constructor() {
    this.account = null;
    this.isConnected = false;
    this.chainId = null;
    this.modal = null;
    this.wagmiConfig = null;
    this.connectionPromise = null;
    
    // Initialize on construction
    this.initialize();
  }

  initialize() {
    try {
      const { modal, wagmiConfig } = initializeWalletKit();
      this.modal = modal;
      this.wagmiConfig = wagmiConfig;
      
      // Check if already connected
      this.checkExistingConnection();
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
    }
  }

  async checkExistingConnection() {
    try {
      if (!this.wagmiConfig) return;
      
      const account = getAccount(this.wagmiConfig);
      const chainId = getChainId(this.wagmiConfig);
      
      if (account?.address) {
        this.account = account.address;
        this.isConnected = true;
        this.chainId = chainId;
        console.log('✅ Existing connection found:', this.account);
      }
    } catch (error) {
      console.log('ℹ️ No existing connection found');
    }
  }

  /* -------------------- CONNECT WALLET - Fixed -------------------- */

  async connectWallet() {
    // Prevent multiple simultaneous connection attempts
    if (this.connectionPromise) {
      console.log('🔄 Connection already in progress...');
      return this.connectionPromise;
    }

    this.connectionPromise = this._performConnection();
    
    try {
      const result = await this.connectionPromise;
      
      // If Reown connection fails, try fallback
      if (!result.success && fallbackWalletConnection.isAnyWalletAvailable()) {
        console.log('🔄 Trying fallback wallet connection...');
        const fallbackResult = await this._tryFallbackConnection();
        return fallbackResult;
      }
      
      return result;
    } finally {
      this.connectionPromise = null;
    }
  }

  async _performConnection() {
    try {
      console.log("🔄 Starting wallet connection...");

      if (!networkUtils.isBrowser()) {
        throw new Error("Not in browser environment");
      }

      // Ensure modal is initialized
      if (!this.modal || !this.wagmiConfig) {
        console.log('🔄 Reinitializing wallet kit...');
        this.initialize();
        
        if (!this.modal) {
          throw new Error("Wallet modal failed to initialize");
        }
      }

      // Check if already connected
      if (this.isConnected && this.account) {
        console.log('✅ Already connected to:', this.account);
        return {
          success: true,
          account: this.account,
          network: this.chainId,
          method: "existing",
        };
      }

      return await new Promise((resolve, reject) => {
        let resolved = false;
        let timeoutId;
        let unsubscribeFunction;
        
        // Set up account subscription with proper error handling
        try {
          unsubscribeFunction = this.modal.subscribeAccount((account) => {
            console.log("🔄 Account subscription event:", account);

            if (account?.address && account.isConnected && !resolved) {
              resolved = true;
              clearTimeout(timeoutId);
              
              this.account = account.address;
              this.isConnected = true;
              this.chainId = account.chainId;

              // Force switch to BSC if network type is BNB
              if (networkType === 'bnb' && account.chainId !== 56) {
                setTimeout(async () => {
                  try {
                    await window.ethereum.request({
                      method: 'wallet_switchEthereumChain',
                      params: [{ chainId: '0x38' }] // BSC Mainnet
                    });
                    this.chainId = 56;
                  } catch (switchError) {
                    if (switchError.code === 4902) {
                      await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                          chainId: '0x38',
                          chainName: 'BSC Mainnet',
                          rpcUrls: ['https://bsc-dataseed.binance.org/'],
                          blockExplorerUrls: ['https://bscscan.com'],
                          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
                        }]
                      });
                      this.chainId = 56;
                    }
                  }
                }, 500);
              }

              // Ensure chain ID is properly set
              if (!this.chainId) {
                this.chainId = this.getCurrentChainId();
              }

              console.log('✅ Wallet connected successfully:', {
                address: this.account,
                chainId: this.chainId
              });

              // Close modal after successful connection
              setTimeout(() => {
                if (this.modal) {
                  try {
                    this.modal.close();
                  } catch (closeError) {
                    console.warn('Modal close warning:', closeError);
                  }
                }
              }, 1000);

              // Safe unsubscribe
              if (typeof unsubscribeFunction === 'function') {
                try {
                  unsubscribeFunction();
                } catch (unsubError) {
                  console.warn('Unsubscribe warning:', unsubError);
                }
              }
              
              resolve({
                success: true,
                account: this.account,
                network: this.chainId,
                method: "reown",
              });
            }
          });
        } catch (subscribeError) {
          console.error('Subscription error:', subscribeError);
          reject(new Error(`Failed to set up wallet subscription: ${subscribeError.message}`));
          return;
        }

        // Set up timeout
        timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            // Safe unsubscribe on timeout
            if (typeof unsubscribeFunction === 'function') {
              try {
                unsubscribeFunction();
              } catch (unsubError) {
                console.warn('Timeout unsubscribe warning:', unsubError);
              }
            }
            reject(new Error("Connection timeout - Please try again"));
          }
        }, walletSettings.timeout); // Use environment-based timeout

        // Open modal with error handling
        this.modal.open({ view: "Connect" })
          .then(() => {
            console.log("✅ Modal opened successfully");
          })
          .catch((modalError) => {
            console.error("❌ Modal open error:", modalError);
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutId);
              // Safe unsubscribe on modal error
              if (typeof unsubscribeFunction === 'function') {
                try {
                  unsubscribeFunction();
                } catch (unsubError) {
                  console.warn('Modal error unsubscribe warning:', unsubError);
                }
              }
              reject(new Error(`Failed to open wallet modal: ${modalError.message}`));
            }
          });
      });
    } catch (error) {
      console.error("❌ Wallet connect error:", error);
      return {
        success: false,
        error: error.message || "Failed to connect wallet",
      };
    }
  }

  /* -------------------- BALANCE - Fixed -------------------- */

  async getBalance() {
    try {
      if (!this.isConnected || !this.account) {
        throw new Error("Wallet not connected");
      }

      if (!this.wagmiConfig) {
        throw new Error("Wagmi config not available");
      }

      const balance = await getBalance(this.wagmiConfig, {
        address: this.account,
      });

      const balanceInEth = Number(formatEther(balance.value)).toFixed(4);
      
      return {
        success: true,
        balance: balanceInEth,
        balanceWei: balance.value.toString(),
      };
    } catch (error) {
      console.error('❌ Balance fetch error:', error);
      return { 
        success: false, 
        error: error.message || "Failed to fetch balance" 
      };
    }
  }

  /* -------------------- SEND USDT PAYMENT - New Method -------------------- */

  async sendUSDTPayment(amountInUSD) {
    try {
      if (!this.isConnected || !this.account) {
        throw new Error("Wallet not connected");
      }

      if (!this.wagmiConfig) {
        throw new Error("Wagmi config not available");
      }

      // USDT Contract Address (BSC Mainnet) - Correct USDT contract
      const usdtContractAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT (Tether USD) on BSC
      
      // For $10 USDT, we send exactly 10 USDT tokens
      const usdtAmount = amountInUSD; // Direct USDT amount
      const decimals = 18; // USDT has 18 decimals on BSC
      const value = BigInt(usdtAmount * Math.pow(10, decimals));

      console.log(`💰 Sending USDT payment: $${amountInUSD} USDT`);

      // USDT Transfer function signature
      const transferFunction = {
        name: 'transfer',
        type: 'function',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' }
        ]
      };

      // Encode transfer data
      const transferData = encodeFunctionData({
        abi: [transferFunction],
        functionName: 'transfer',
        args: [companyWallet, value]
      });

      const hash = await sendTransaction(this.wagmiConfig, {
        to: usdtContractAddress,
        data: transferData,
        chainId: this.chainId || 56, // BSC Mainnet
      });

      console.log('✅ USDT Transaction sent:', hash);

      return {
        success: true,
        txHash: hash,
        amount: usdtAmount,
        amountUSD: amountInUSD,
        tokenSymbol: 'USDT',
        to: companyWallet,
        from: this.account,
        chainId: this.chainId,
        paymentType: 'usdt'
      };
    } catch (error) {
      console.error("❌ USDT Payment error:", error);
      return { 
        success: false, 
        error: error.message || "USDT Payment failed" 
      };
    }
  }

  /* -------------------- SEND PAYMENT - Fixed -------------------- */

  async sendPayment(amountInUSD) {
    try {
      if (!this.isConnected || !this.account) {
        throw new Error("Wallet not connected");
      }

      if (!this.wagmiConfig) {
        throw new Error("Wagmi config not available");
      }

      // Get current token price (BNB or ETH based on network)
      const ethAmount = (amountInUSD / tokenPriceUSD).toFixed(6);
      const value = parseEther(ethAmount);

      const tokenSymbol = networkType === 'bnb' ? 'BNB' : 'ETH';
      console.log(`💰 Sending payment: $${amountInUSD} = ${ethAmount} ${tokenSymbol}`);

      const hash = await sendTransaction(this.wagmiConfig, {
        to: companyWallet,
        value,
        chainId: this.chainId || defaultChainId,
      });

      console.log('✅ Transaction sent:', hash);

      return {
        success: true,
        txHash: hash,
        amount: ethAmount,
        amountUSD: amountInUSD,
        tokenSymbol,
        to: companyWallet,
        from: this.account,
        chainId: this.chainId,
      };
    } catch (error) {
      console.error("❌ Payment error:", error);
      return { 
        success: false, 
        error: error.message || "Payment failed" 
      };
    }
  }

  /* -------------------- TX VALIDATION - Fixed -------------------- */

  async validateTransaction(txHash) {
    try {
      if (!txHash) {
        throw new Error("Transaction hash is required");
      }

      if (!this.wagmiConfig) {
        throw new Error("Wagmi config not available");
      }

      console.log("🔄 Validating transaction:", txHash);
      
      const receipt = await waitForTransactionReceipt(this.wagmiConfig, {
        hash: txHash,
        timeout: 120000, // 2 minutes timeout
      });

      console.log('✅ Transaction confirmed:', receipt);

      return {
        success: true,
        status: receipt.status === "success" ? "confirmed" : "failed",
        receipt,
        blockNumber: receipt.blockNumber?.toString(),
        gasUsed: receipt.gasUsed?.toString(),
      };
    } catch (error) {
      console.error("❌ Transaction validation error:", error);
      return { 
        success: false, 
        error: error.message || "Transaction validation failed" 
      };
    }
  }

  /* -------------------- DISCONNECT - Fixed -------------------- */

  async disconnect() {
    try {
      console.log("🔄 Disconnecting wallet...");
      
      // Close modal if open
      if (this.modal) {
        try {
          await this.modal.close();
        } catch (error) {
          console.warn('Modal close warning:', error);
        }
      }

      // Reset state
      this.account = null;
      this.isConnected = false;
      this.chainId = null;

      console.log("✅ Wallet disconnected successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Disconnect error:", error);
      // Force reset state even on error
      this.account = null;
      this.isConnected = false;
      this.chainId = null;
      return { 
        success: false, 
        error: error.message || "Disconnect failed" 
      };
    }
  }

  /* -------------------- HELPERS - Enhanced -------------------- */

  isWalletConnected() {
    return this.isConnected && !!this.account;
  }

  getAccount() {
    return this.account;
  }

  getChainId() {
    return this.chainId;
  }

  getNetworkInfo() {
    const networks = {
      1: { networkId: 1, networkName: "Ethereum Mainnet" },
      11155111: { networkId: 11155111, networkName: "Sepolia Testnet" },
      137: { networkId: 137, networkName: "Polygon Mainnet" },
      80001: { networkId: 80001, networkName: "Polygon Mumbai" },
      56: { networkId: 56, networkName: "BSC Mainnet" },
      97: { networkId: 97, networkName: "BSC Testnet" },
    };
    
    // Get current chain ID from wallet or fallback
    const currentChainId = this.chainId || this.getCurrentChainId();
    
    return networks[currentChainId] || {
      networkId: currentChainId || 'Unknown',
      networkName: currentChainId ? `Chain ID: ${currentChainId}` : "Unknown Network",
    };
  }

  // Get current chain ID from MetaMask directly
  getCurrentChainId() {
    try {
      if (window.ethereum && window.ethereum.chainId) {
        return parseInt(window.ethereum.chainId, 16);
      }
      return null;
    } catch (error) {
      console.warn('Failed to get chain ID:', error);
      return null;
    }
  }

  // Get modal instance for external use
  getModal() {
    return this.modal;
  }

  // Force reinitialize if needed
  async reinitialize() {
    console.log('🔄 Force reinitializing wallet service...');
    isInitialized = false;
    modalInstance = null;
    wagmiAdapterInstance = null;
    this.initialize();
  }

  // Fallback connection method - Enhanced for Trust Wallet
  async _tryFallbackConnection() {
    try {
      console.log('🔄 Attempting fallback connection...');
      
      // Check if Trust Wallet is specifically available
      if (fallbackWalletConnection.isTrustWalletAvailable()) {
        console.log('🔄 Trust Wallet detected, using Trust Wallet connection...');
        const result = await fallbackWalletConnection.connectTrustWallet();
        
        if (result.success) {
          this.account = result.account;
          this.isConnected = true;
          this.chainId = result.chainId;
          
          console.log('✅ Trust Wallet fallback connection successful:', {
            address: this.account,
            chainId: this.chainId,
            method: result.method
          });
          
          return {
            success: true,
            account: this.account,
            network: this.chainId,
            method: result.method,
          };
        }
      }
      
      // Use auto-detect method for other wallets
      const result = await fallbackWalletConnection.connectAnyWallet();
      
      if (result.success) {
        this.account = result.account;
        this.isConnected = true;
        this.chainId = result.chainId;
        
        // Update chain ID if not set
        if (!this.chainId) {
          this.chainId = this.getCurrentChainId();
        }
        
        console.log('✅ Fallback connection successful:', {
          address: this.account,
          chainId: this.chainId,
          method: result.method
        });
        
        return {
          success: true,
          account: this.account,
          network: this.chainId,
          method: result.method,
        };
      } else {
        throw new Error(result.error || 'Fallback connection failed');
      }
    } catch (error) {
      console.error('❌ Fallback connection failed:', error);
      return {
        success: false,
        error: error.message || "All connection methods failed",
      };
    }
  }
}

// Export singleton instance
export default new RealWalletService();
