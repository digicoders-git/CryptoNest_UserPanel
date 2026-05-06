import React, { useState } from 'react';
import { FaCreditCard, FaWallet, FaCheckCircle, FaEthereum } from 'react-icons/fa';
import Swal from 'sweetalert2';
import PaymentComponent from '../Componect/PaymentComponent';
import WalletStatus from '../Componect/WalletStatus';
import TrustWalletHelper from '../Componect/TrustWalletHelper';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoPayment = async () => {
    if (!amount || amount <= 0) {
      Swal.fire('Error', 'Please enter valid amount', 'error');
      return;
    }

    setLoading(true);
    
    // Demo payment simulation
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'Demo Payment Successful!',
          text: `₹${amount} has been added to your demo balance`,
          confirmButtonColor: '#0f7a4a'
        });
        
        // Update local balance (demo)
        const currentBalance = parseFloat(localStorage.getItem('demoBalance') || '0');
        localStorage.setItem('demoBalance', (currentBalance + parseFloat(amount)).toString());
        
        setAmount('');
      } else {
        Swal.fire('Payment Failed', 'Please try again', 'error');
      }
      setLoading(false);
    }, 2000);
  };

  const handlePaymentSuccess = (paymentResult) => {
    // Refresh wallet status or update UI
    console.log('Payment successful:', paymentResult);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment Center</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Status */}
          <div>
            <WalletStatus />
          </div>

          {/* Trust Wallet Helper */}
          <div>
            <TrustWalletHelper onConnectionSuccess={handlePaymentSuccess} />
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h2>
            
            <div className="grid grid-cols-1 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('usdt_quick')}
                className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                  paymentMethod === 'usdt_quick' 
                    ? 'border-[#0f7a4a] bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaEthereum className="text-yellow-600 text-xl" />
                <div className="text-left">
                  <div className="font-semibold">Quick $10 USDT Payment</div>
                  <div className="text-sm text-gray-600">Direct USDT payment on BSC</div>
                </div>
              </button>
              
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                  paymentMethod === 'crypto' 
                    ? 'border-[#0f7a4a] bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaEthereum className="text-blue-600 text-xl" />
                <div className="text-left">
                  <div className="font-semibold">Crypto Payment</div>
                  <div className="text-sm text-gray-600">Pay with BNB/ETH via wallet</div>
                </div>
              </button>
              
              <button
                onClick={() => setPaymentMethod('demo')}
                className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                  paymentMethod === 'demo' 
                    ? 'border-[#0f7a4a] bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaCreditCard className="text-green-600 text-xl" />
                <div className="text-left">
                  <div className="font-semibold">Demo Payment</div>
                  <div className="text-sm text-gray-600">For testing purposes only</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Payment Components */}
        <div className="mt-6">
          {paymentMethod === 'usdt_quick' ? (
            <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quick $10 USDT Payment</h2>
                <p className="text-gray-600">Direct USDT payment on BSC Network</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FaEthereum className="text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Payment Details</span>
                </div>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Amount: $10 USDT</li>
                  <li>• Network: BSC Mainnet</li>
                  <li>• Token: USDT (BEP-20)</li>
                  <li>• Gas Fee: ~$0.50 BNB</li>
                </ul>
              </div>

              <PaymentComponent 
                onPaymentSuccess={handlePaymentSuccess}
                defaultAmount={10}
                defaultPurpose="usdt_payment"
                quickMode={true}
              />
            </div>
          ) : paymentMethod === 'crypto' ? (
            <PaymentComponent onPaymentSuccess={handlePaymentSuccess} />
          ) : (
            <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Demo Payment</h2>
                <p className="text-gray-600">Add Demo Balance</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f7a4a] focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 2000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDemoPayment}
                disabled={loading || !amount}
                className="w-full bg-[#0f7a4a] text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaCheckCircle />
                    Add ₹{amount || '0'} Demo Balance
                  </>
                )}
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>🔒 This is a demo payment system</p>
                <p>No real money will be charged</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;