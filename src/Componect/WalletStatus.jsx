import React, { useState, useEffect } from 'react';
import { FaWallet, FaEthereum, FaCopy, FaExternalLinkAlt, FaMobile } from 'react-icons/fa';
import realWalletService from '../services/realWalletService';
import networkSwitcher from '../utils/networkSwitcher';
import bnbTokenUtils from '../utils/bnbTokenUtils';
import Swal from 'sweetalert2';

const WalletStatus = () => {
  const [walletInfo, setWalletInfo] = useState({
    connected: false,
    address: null,
    balance: '0.0000',
    network: 'Unknown',
    chainId: null,
    tokenSymbol: 'ETH'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletStatus();
    
    // Listen for account and network changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Account changed:', accounts);
        checkWalletStatus();
      });
      
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Network changed:', chainId);
        checkWalletStatus();
      });
    }
    
    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const autoSwitchToBSC = async () => {
    try {
      if (realWalletService.isWalletConnected() && window.ethereum) {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex, 16);
        
        // If not on BSC network, auto-switch
        if (chainId !== 56 && chainId !== 97) {
          console.log('🔄 Auto-switching to BSC network...');
          const result = await networkSwitcher.switchToTargetNetwork();
          if (result.success) {
            await checkWalletStatus();
          }
        }
      }
    } catch (error) {
      console.log('Auto-switch failed:', error);
    }
  };

  const checkWalletStatus = async () => {
    try {
      // Direct wallet check instead of service
      if (window.ethereum) {
        // Get current accounts directly from MetaMask/TrustWallet
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          
          // Get current chain ID directly
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          
          // Get balance - BNB token on Ethereum or native token on other networks
          let balanceInEth, tokenSymbol;
          
          if (import.meta.env.VITE_NETWORK_TYPE === 'bnb' && (chainId === 1 || chainId === 11155111)) {
            // Get BNB token balance on Ethereum networks
            const bnbBalance = await bnbTokenUtils.getBNBBalance(address);
            balanceInEth = bnbBalance.success ? parseFloat(bnbBalance.balance) : 0;
            tokenSymbol = 'BNB';
          } else {
            // Get native token balance
            const balanceHex = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [address, 'latest']
            });
            balanceInEth = parseInt(balanceHex, 16) / Math.pow(10, 18);
            
            // Determine token symbol based on network type setting
            if (import.meta.env.VITE_NETWORK_TYPE === 'bnb') {
              tokenSymbol = 'BNB';
            } else {
              tokenSymbol = chainId === 56 || chainId === 97 ? 'BNB' : 
                          chainId === 137 || chainId === 80001 ? 'MATIC' : 'ETH';
            }
          }
          
          // Get network name and token symbol based on actual chain ID
          const getNetworkName = (chainId) => {
            const networks = {
              1: 'Ethereum Mainnet',
              11155111: 'Sepolia Testnet',
              56: 'BSC Mainnet',
              97: 'BSC Testnet',
              137: 'Polygon Mainnet',
              80001: 'Polygon Mumbai'
            };
            return networks[chainId] || `Unknown Network (${chainId})`;
          };
          
          const getTokenSymbol = (chainId) => {
            // Always show BNB when VITE_NETWORK_TYPE is bnb
            if (import.meta.env.VITE_NETWORK_TYPE === 'bnb') {
              return 'BNB';
            }
            // Default behavior for other network types
            if (chainId === 56 || chainId === 97) return 'BNB';
            if (chainId === 137 || chainId === 80001) return 'MATIC';
            return 'ETH';
          };
          
          setWalletInfo({
            connected: true,
            address,
            balance: balanceInEth.toFixed(4),
            network: getNetworkName(chainId),
            chainId: chainId,
            tokenSymbol: tokenSymbol
          });
          
          // Update real wallet service state
          realWalletService.account = address;
          realWalletService.isConnected = true;
          realWalletService.chainId = chainId;
        }
      }
    } catch (error) {
      console.error('Error checking wallet status:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      // Enhanced connection with better error handling
      console.log('🚀 Starting wallet connection from WalletStatus...');
      
      // Check if wallet is available
      if (!window.ethereum) {
        Swal.fire({
          icon: "warning",
          title: "No Wallet Found",
          background: '#1A1A1A',
          color: '#fff',
          html: `
            <div class="text-left">
              <p class="text-gray-400">No cryptocurrency wallet detected.</p>
              <div class="mt-3 p-3 bg-black rounded border border-white/10">
                <p class="text-[#FCE270]"><strong>Please install a wallet:</strong></p>
                <ul class="mt-2 space-y-1 text-sm">
                  <li>• <a href="https://metamask.io/download/" target="_blank" class="text-blue-400 underline">MetaMask</a> (Recommended)</li>
                  <li>• <a href="https://trustwallet.com/browser-extension" target="_blank" class="text-blue-400 underline">Trust Wallet</a></li>
                  <li>• <a href="https://wallet.coinbase.com/" target="_blank" class="text-blue-400 underline">Coinbase Wallet</a></li>
                </ul>
                <p class="mt-2 text-[11px] text-gray-500 uppercase font-bold">After installation, refresh this page and try again.</p>
              </div>
            </div>
          `,
          confirmButtonColor: "#FCE270",
          confirmButtonText: '<span style="color: #000; font-weight: 900;">OK</span>',
        });
        setLoading(false);
        return;
      }

      // Use the enhanced wallet service instead of direct calls
      const result = await realWalletService.connectWallet();
      
      if (result.success) {
        // Force switch to BSC immediately after connection
        if (import.meta.env.VITE_NETWORK_TYPE === 'bnb') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x38' }] // BSC Mainnet
            });
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
            }
          }
        }
        
        // Wait a moment for network switch
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update wallet status after network switch
        await checkWalletStatus();
        
        Swal.fire({
          icon: "success",
          title: "🎉 Connected!",
          background: '#1A1A1A',
          color: '#fff',
          confirmButtonColor: "#FCE270",
          confirmButtonText: '<span style="color: #000; font-weight: 900;">EXCELLENT</span>',
        });
      } else {
        throw new Error(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('❌ Connection failed:', error);
      
      let errorMessage = error.message || "Failed to connect wallet. Please try again.";
      let troubleshootingTips = [
        "• Make sure your wallet is installed and unlocked",
        "• Allow popups for this site",
        "• Try refreshing the page",
        "• Check your internet connection"
      ];
      
      // Specific error handling
      if (error.message.includes('User rejected') || error.message.includes('rejected')) {
        errorMessage = "Connection was cancelled. Please approve the connection request.";
        troubleshootingTips = [
          "• Click 'Connect' when prompted by your wallet",
          "• Make sure you approve the connection request",
          "• Try connecting again"
        ];
      } else if (error.message.includes('timeout')) {
        errorMessage = "Connection timed out. Please try again.";
        troubleshootingTips = [
          "• Make sure your wallet is unlocked",
          "• Check your internet connection",
          "• Try refreshing the page"
        ];
      }
      
      Swal.fire({
        icon: "error",
        title: "Connection Failed",
        background: '#1A1A1A',
        color: '#fff',
        html: `
          <div class="text-left">
            <p class="mb-3 text-gray-400">${errorMessage}</p>
            <div class="p-3 bg-black rounded border border-white/10 text-sm">
              <p class="text-[#FCE270] font-bold uppercase tracking-widest text-[11px] mb-2">Troubleshooting:</p>
              <ul class="mt-1 space-y-1 text-gray-500">
                ${troubleshootingTips.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
          </div>
        `,
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">TRY AGAIN</span>',
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      const result = await Swal.fire({
        title: 'Disconnect Wallet?',
        text: 'Are you sure you want to disconnect your wallet?',
        icon: 'question',
        background: '#1A1A1A',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#2A2A2A',
        confirmButtonText: 'Disconnect',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await realWalletService.disconnect();
        setWalletInfo({
          connected: false,
          address: null,
          balance: '0.0000',
          network: 'Unknown',
          chainId: null
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Disconnected',
          text: 'Wallet disconnected successfully',
          background: '#1A1A1A',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to disconnect wallet',
        confirmButtonColor: '#0f7a4a'
      });
    }
  };

  const copyAddress = () => {
    if (walletInfo.address) {
      navigator.clipboard.writeText(walletInfo.address);
      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Wallet address copied to clipboard",
        background: '#1A1A1A',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const openEtherscan = () => {
    if (walletInfo.address) {
      const baseUrl = walletInfo.network.includes('Sepolia') 
        ? 'https://sepolia.etherscan.io' 
        : 'https://etherscan.io';
      window.open(`${baseUrl}/address/${walletInfo.address}`, '_blank');
    }
  };

  const refreshBalance = async () => {
    try {
      setLoading(true);
      await checkWalletStatus();
      
      Swal.fire({
        icon: 'success',
        title: 'Balance Updated',
        text: `Current balance: ${walletInfo.balance} ${walletInfo.tokenSymbol}`,
        background: '#1A1A1A',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to refresh balance',
        confirmButtonColor: '#0f7a4a'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!walletInfo.connected) {
    return (
      <div className="bg-[#1A1A1A] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCE270]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#FCE270]/20 shadow-xl shadow-black">
            <FaWallet className="text-4xl text-[#FCE270]" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase">Wallet Not Linked</h3>
          <p className="text-gray-500 text-sm mb-8 max-w-[240px] mx-auto font-medium">Connect your decentralized wallet to access marketplace & features.</p>
          
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-[#FCE270] text-black h-14 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-[#FCE270]/10"
          >
            <FaWallet size={20} />
            {loading ? 'CONNECTING...' : 'CONNECT WALLET'}
          </button>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-gray-500 font-bold uppercase tracking-widest border-t border-white/5 pt-6">
            <div className="flex items-center gap-2 group-hover:text-gray-300 transition-colors">
              <FaEthereum className="text-blue-500 text-lg" />
              <span>MetaMask</span>
            </div>
            <div className="flex items-center gap-2 group-hover:text-gray-300 transition-colors">
              <FaMobile className="text-blue-400 text-lg" />
              <span>TrustWallet</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      <div className="text-center relative z-10">
        <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-xl shadow-black">
          <FaWallet className="text-4xl text-green-500" />
        </div>
        <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase">Wallet Connected</h3>
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            ● Active Connection
          </span>
        </div>
        
        <button
          onClick={disconnectWallet}
          className="w-full bg-white/5 text-gray-300 h-14 rounded-2xl font-black text-lg hover:bg-red-500 hover:text-white active:scale-95 transition-all border border-white/10 shadow-lg"
        >
          DISCONNECT
        </button>
        
        <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-gray-500 font-bold uppercase tracking-widest border-t border-white/5 pt-6">
          <div className="flex items-center gap-2">
            <FaEthereum className="text-blue-500 text-lg" />
            <span>MetaMask</span>
          </div>
          <div className="flex items-center gap-2">
            <FaMobile className="text-blue-400 text-lg" />
            <span>TrustWallet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletStatus;