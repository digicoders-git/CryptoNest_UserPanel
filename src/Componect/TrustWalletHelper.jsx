import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaSyncAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import fallbackWalletConnection from '../utils/fallbackWallet';

const TrustWalletHelper = ({ onConnectionSuccess }) => {
  const [walletStatus, setWalletStatus] = useState({
    installed: false,
    detected: false,
    connected: false,
    networkCorrect: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletStatus();
  }, []);

  const checkWalletStatus = () => {
    const status = {
      installed: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined',
      detected: fallbackWalletConnection.isTrustWalletAvailable(),
      connected: false,
      networkCorrect: false
    };

    // Check if connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      status.connected = true;
      
      // Check network
      const chainId = window.ethereum.chainId;
      status.networkCorrect = chainId === '0x38'; // BSC Mainnet
    }

    setWalletStatus(status);
  };

  const handleTrustWalletConnection = async () => {
    setLoading(true);
    
    try {
      // Show connection steps
      Swal.fire({
        title: 'Connecting Trust Wallet...',
        html: `
          <div class="text-left">
            <p>📱 Please follow these steps:</p>
            <ol class="list-decimal list-inside mt-2 space-y-1">
              <li>Open Trust Wallet app</li>
              <li>Go to Browser tab</li>
              <li>Allow connection when prompted</li>
              <li>Switch to BSC network if needed</li>
            </ol>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const result = await fallbackWalletConnection.connectTrustWallet();
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Trust Wallet Connected! 🎉',
          text: `Address: ${result.account.slice(0, 6)}...${result.account.slice(-4)}`,
          confirmButtonColor: '#0f7a4a'
        });

        checkWalletStatus();
        
        if (onConnectionSuccess) {
          onConnectionSuccess(result);
        }
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Trust Wallet connection error:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Connection Failed',
        html: `
          <div class="text-left">
            <p><strong>Error:</strong> ${error.message}</p>
            <br>
            <p><strong>Troubleshooting:</strong></p>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>Make sure Trust Wallet is installed</li>
              <li>Open Trust Wallet app first</li>
              <li>Use Trust Wallet's built-in browser</li>
              <li>Clear browser cache and try again</li>
            </ul>
          </div>
        `,
        confirmButtonColor: '#0f7a4a'
      });
    } finally {
      setLoading(false);
    }
  };

  const switchToBSC = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }]
      });
      
      checkWalletStatus();
      
      Swal.fire({
        icon: 'success',
        title: 'Network Switched!',
        text: 'Successfully switched to BSC Mainnet',
        confirmButtonColor: '#0f7a4a'
      });
    } catch (error) {
      if (error.code === 4902) {
        // Add BSC network
        try {
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
          
          checkWalletStatus();
          
          Swal.fire({
            icon: 'success',
            title: 'Network Added!',
            text: 'BSC Mainnet added and switched successfully',
            confirmButtonColor: '#0f7a4a'
          });
        } catch (addError) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Add Network',
            text: addError.message,
            confirmButtonColor: '#0f7a4a'
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Network Switch Failed',
          text: error.message,
          confirmButtonColor: '#0f7a4a'
        });
      }
    }
  };

  const StatusItem = ({ label, status, action, actionLabel }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {status ? (
          <FaCheckCircle className="text-green-500" />
        ) : (
          <FaExclamationTriangle className="text-red-500" />
        )}
        <span className={`font-medium ${status ? 'text-green-700' : 'text-red-700'}`}>
          {label}
        </span>
      </div>
      {action && !status && (
        <button
          onClick={action}
          className="px-3 py-1 bg-[#0f7a4a] text-white text-sm rounded-md hover:bg-green-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <FaInfoCircle className="text-blue-600 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800">Trust Wallet Helper</h3>
        <button
          onClick={checkWalletStatus}
          className="ml-auto p-1 text-gray-500 hover:text-gray-700"
          title="Refresh Status"
        >
          <FaSyncAlt />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <StatusItem
          label="Wallet Installed"
          status={walletStatus.installed}
        />
        
        <StatusItem
          label="Trust Wallet Detected"
          status={walletStatus.detected}
        />
        
        <StatusItem
          label="Wallet Connected"
          status={walletStatus.connected}
          action={handleTrustWalletConnection}
          actionLabel="Connect"
        />
        
        <StatusItem
          label="BSC Network"
          status={walletStatus.networkCorrect}
          action={switchToBSC}
          actionLabel="Switch"
        />
      </div>

      {!walletStatus.installed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-yellow-600 mt-1" />
            <div>
              <h4 className="font-semibold text-yellow-800">Trust Wallet Not Found</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Please install Trust Wallet mobile app and use its built-in browser to access this site.
              </p>
              <a
                href="https://trustwallet.com/download"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
              >
                Download Trust Wallet
              </a>
            </div>
          </div>
        </div>
      )}

      {walletStatus.installed && !walletStatus.detected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <FaInfoCircle className="text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-800">Trust Wallet Tips</h4>
              <ul className="text-blue-700 text-sm mt-1 space-y-1">
                <li>• Open Trust Wallet app first</li>
                <li>• Use Trust Wallet's built-in browser</li>
                <li>• Make sure you're on the latest version</li>
                <li>• Clear browser cache if needed</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleTrustWalletConnection}
        disabled={loading || !walletStatus.installed}
        className="w-full bg-[#0f7a4a] text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Connecting...
          </>
        ) : (
          <>
            Connect Trust Wallet
          </>
        )}
      </button>
    </div>
  );
};

export default TrustWalletHelper;