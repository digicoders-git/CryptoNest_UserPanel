import React, { useState } from 'react';
import { FaEthereum, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import realWalletService from '../services/realWalletService';
import { walletAPI } from '../services/api';
import Swal from 'sweetalert2';

const PaymentComponent = ({ onPaymentSuccess, defaultAmount = '', defaultPurpose = 'package_upgrade', quickMode = false }) => {
  const [paymentData, setPaymentData] = useState({
    amount: defaultAmount.toString(),
    purpose: defaultPurpose,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const paymentPurposes = [
    { value: 'package_upgrade', label: 'Package Upgrade', amounts: [10, 20, 50] },
    { value: 'nft_purchase', label: 'NFT Purchase', amounts: [5, 10, 25, 50] },
    { value: 'usdt_payment', label: '$10 USDT Payment', amounts: [10] },
    { value: 'custom', label: 'Custom Payment', amounts: [] }
  ];

  const handleAmountSelect = (amount) => {
    setPaymentData(prev => ({ ...prev, amount: amount.toString() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!realWalletService.isWalletConnected()) {
      Swal.fire({
        icon: 'warning',
        title: 'Wallet Not Connected',
        text: 'Please connect your wallet first',
        confirmButtonColor: '#0f7a4a'
      });
      return;
    }

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text: 'Please enter a valid amount',
        confirmButtonColor: '#0f7a4a'
      });
      return;
    }

    try {
      setLoading(true);
      
      const amount = parseFloat(paymentData.amount);
      const walletAddress = realWalletService.getAccount();
      
      // Show payment confirmation
      const confirmResult = await Swal.fire({
        title: 'Confirm Payment',
        text: `Send $${amount} USD payment?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0f7a4a',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Send Payment',
        cancelButtonText: 'Cancel'
      });

      if (!confirmResult.isConfirmed) {
        setLoading(false);
        return;
      }

      // Show processing
      Swal.fire({
        title: 'Processing Payment...',
        text: 'Please confirm the transaction in your wallet',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Send payment - Check if USDT payment or regular payment
      let paymentResult;
      if (paymentData.purpose === 'usdt_payment') {
        paymentResult = await realWalletService.sendUSDTPayment(amount);
      } else {
        paymentResult = await realWalletService.sendPayment(amount);
      }
      
      if (paymentResult.success) {
        // Show transaction pending
        Swal.fire({
          title: 'Transaction Sent!',
          text: 'Waiting for blockchain confirmation...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Validate transaction properly
        const validationResult = await realWalletService.validateTransaction(paymentResult.txHash);
        
        if (validationResult.success && validationResult.status === 'confirmed') {
          // Record payment on backend with complete details
          try {
            await walletAPI.recordPayment({
              txHash: paymentResult.txHash,
              walletAddress: walletAddress,
              amount: paymentResult.amount,
              amountUSD: paymentResult.amountUSD,
              purpose: paymentData.purpose,
              description: paymentData.description,
              companyWallet: paymentResult.to,
              userWallet: paymentResult.from,
              chainId: paymentResult.chainId,
              tokenSymbol: paymentResult.tokenSymbol
            });
            console.log('✅ Payment recorded on backend successfully');
          } catch (error) {
            console.error('Failed to record payment on backend:', error);
          }

          // Success
          Swal.fire({
            icon: "success",
            title: "Payment Successful! 🎉",
            confirmButtonColor: "#0f7a4a",
          });

          // Reset form
          setPaymentData({
            amount: '',
            purpose: 'package_upgrade',
            description: ''
          });

          // Callback for parent component
          if (onPaymentSuccess) {
            onPaymentSuccess(paymentResult);
          }
        } else {
          throw new Error('Transaction failed or not confirmed');
        }
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: error.message || "Transaction failed. Please try again.",
        confirmButtonColor: "#0f7a4a",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPurpose = paymentPurposes.find(p => p.value === paymentData.purpose);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <FaEthereum className="text-blue-600 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800">Make Payment</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Purpose Selection */}
        {!quickMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Purpose
            </label>
            <select
              value={paymentData.purpose}
              onChange={(e) => setPaymentData(prev => ({ ...prev, purpose: e.target.value, amount: defaultAmount.toString() || '' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f7a4a]"
            >
              {paymentPurposes.map(purpose => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Amount Selection */}
        {selectedPurpose?.amounts.length > 0 && !quickMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select Amount
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedPurpose.amounts.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountSelect(amount)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    paymentData.amount === amount.toString()
                      ? 'bg-[#0f7a4a] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USD) {quickMode && '- Fixed $10 USDT'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f7a4a]"
              placeholder="Enter amount"
              disabled={quickMode}
              required
            />
          </div>
          {quickMode && (
            <p className="text-sm text-gray-600 mt-1">
              💰 Fixed amount for quick USDT payment
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={paymentData.description}
            onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f7a4a]"
            rows="2"
            placeholder="Add a note about this payment"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !realWalletService.isWalletConnected()}
          className="w-full bg-[#0f7a4a] text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaPaperPlane />
              Send Payment
            </>
          )}
        </button>

        {!realWalletService.isWalletConnected() && (
          <p className="text-sm text-red-600 text-center">
            Please connect your wallet to make payments
          </p>
        )}
      </form>
    </div>
  );
};

export default PaymentComponent;