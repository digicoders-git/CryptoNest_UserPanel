import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia, mainnet } from 'viem/chains'

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'your_project_id_here'

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [sepolia, mainnet]
})

// 3. Configure the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia, mainnet],
  projectId,
  metadata: {
    name: 'GrowTradeNFT',
    description: 'NFT Trading Platform',
    url: 'https://growtradenfts.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }
})

class ReownWalletService {
  constructor() {
    this.modal = modal
    this.account = null
  }

  // Open wallet selection modal
  async connectWallet() {
    try {
      await this.modal.open()
      
      // Wait for connection
      return new Promise((resolve) => {
        const unsubscribe = this.modal.subscribeState((state) => {
          if (state.open === false && state.selectedNetworkId) {
            const account = wagmiAdapter.wagmiConfig.getAccount()
            if (account.address) {
              this.account = account.address
              unsubscribe()
              resolve({
                success: true,
                account: this.account,
                method: 'reown'
              })
            }
          }
        })
      })
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Send payment
  async sendPayment(toAddress) {
    try {
      if (!this.account) {
        throw new Error('Wallet not connected')
      }

      const { writeContract } = wagmiAdapter.wagmiConfig
      
      // Simple ETH transfer
      const hash = await writeContract({
        to: toAddress,
        value: '1000000000000000', // 0.001 ETH in wei
      })

      return {
        success: true,
        txHash: hash,
        from: this.account,
        amount: 0.001
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get balance
  async getBalance() {
    try {
      if (!this.account) {
        throw new Error('Wallet not connected')
      }

      const { getBalance } = wagmiAdapter.wagmiConfig
      const balance = await getBalance({ address: this.account })
      
      return {
        success: true,
        balance: (Number(balance.value) / 1e18).toFixed(4)
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Check connection
  isConnected() {
    return this.account !== null
  }

  // Get account
  getAccount() {
    return this.account
  }

  // Disconnect
  async disconnect() {
    await this.modal.close()
    this.account = null
  }
}

export default new ReownWalletService()