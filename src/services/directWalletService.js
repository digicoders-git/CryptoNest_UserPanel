// Direct MetaMask connection - Simple & Fast
class DirectWalletService {
  constructor() {
    this.account = null;
    this.isConnected = false;
  }

  async connectWallet() {
    try {
      console.log("🔄 Connecting to MetaMask...");
      
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        this.account = accounts[0];
        this.isConnected = true;
        
        console.log("✅ Connected:", this.account);
        
        return {
          success: true,
          account: this.account,
          method: 'metamask'
        };
      }
      
      throw new Error("No accounts found");
    } catch (error) {
      console.error("❌ Connection failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getBalance() {
    try {
      if (!this.isConnected) {
        throw new Error("Wallet not connected");
      }

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [this.account, 'latest']
      });
      
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      
      return {
        success: true,
        balance: balanceInEth.toFixed(4)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  isWalletConnected() {
    return this.isConnected && this.account !== null;
  }

  getAccount() {
    return this.account;
  }

  async disconnect() {
    this.account = null;
    this.isConnected = false;
    return { success: true };
  }
}

export default new DirectWalletService();