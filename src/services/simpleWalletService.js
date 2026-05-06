// Simple wallet connection without external APIs
class SimpleWalletService {
  constructor() {
    this.account = null
    this.isConnected = false
  }

  async connectWallet() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        if (accounts.length > 0) {
          this.account = accounts[0]
          this.isConnected = true
          
          return {
            success: true,
            account: this.account,
            method: 'metamask'
          }
        }
      }
      
      throw new Error('MetaMask not found. Please install MetaMask.')
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getBalance() {
    try {
      if (!this.isConnected || !this.account) {
        throw new Error('Wallet not connected')
      }

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [this.account, 'latest']
      })
      
      // Convert from wei to ETH
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18)
      
      return {
        success: true,
        balance: balanceInEth.toFixed(4)
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async sendPayment(amountInUSD) {
    try {
      if (!this.isConnected || !this.account) {
        throw new Error('Wallet not connected')
      }

      // Convert USD to ETH (simplified - 1 ETH = $2000)
      const ethAmount = amountInUSD / 2000
      const amountInWei = Math.floor(ethAmount * Math.pow(10, 18))
      const companyWallet = '0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8E8'

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: this.account,
          to: companyWallet,
          value: '0x' + amountInWei.toString(16)
        }]
      })

      return {
        success: true,
        txHash,
        from: this.account,
        to: companyWallet,
        amount: ethAmount.toFixed(6),
        amountUSD: amountInUSD
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  isWalletConnected() {
    return this.isConnected && this.account !== null
  }

  getAccount() {
    return this.account
  }

  getNetworkInfo() {
    return {
      networkName: 'Ethereum Network'
    }
  }

  async validateTransaction(txHash) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      })

      return {
        success: true,
        receipt,
        status: receipt ? 'confirmed' : 'pending'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default new SimpleWalletService()