import React, { useState } from 'react';
import { FaCreditCard, FaWallet, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';

const PaymentGateway = ({ amount: propAmount, onSuccess, onCancel, title = "Payment" }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [amount, setAmount] = useState(propAmount || '');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCardInput = (field, value) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const processPayment = async () => {
    if (!amount || amount <= 0) {
      Swal.fire('Error', 'Please enter valid amount', 'error');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        Swal.fire('Error', 'Please fill all card details', 'error');
        return;
      }
    }

    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate
      
      if (success) {
        // Update demo balance
        const currentBalance = parseFloat(localStorage.getItem('demoBalance') || '0');
        localStorage.setItem('demoBalance', (currentBalance + parseFloat(amount)).toString());
        
        // Add transaction record
        const transactions = JSON.parse(localStorage.getItem('demoTransactions') || '[]');
        transactions.unshift({
          id: Date.now(),
          amount: parseFloat(amount),
          type: 'credit',
          method: paymentMethod,
          description: `Money added via ${paymentMethod}`,
          date: new Date().toISOString(),
          status: 'completed'
        });
        localStorage.setItem('demoTransactions', JSON.stringify(transactions.slice(0, 50)));
        
        Swal.fire({
          icon: 'success',
          title: 'Payment Successful!',
          text: `₹${amount} has been added to your wallet`,
          confirmButtonColor: '#0f7a4a'
        });
        
        if (onSuccess) onSuccess(amount, paymentMethod);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: 'Transaction could not be processed. Please try again.',
          confirmButtonColor: '#dc2626'
        });
      }
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600">Secure Demo Payment</p>
      </div>

      {/* Amount Input */}
      {!propAmount && (
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
          
          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[100, 500, 1000, 5000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#0f7a4a]"
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'card' 
                ? 'border-[#0f7a4a] bg-green-50 text-[#0f7a4a]' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FaCreditCard size={18} />
            <span className="font-medium">Card</span>
          </button>
          <button
            onClick={() => setPaymentMethod('wallet')}
            className={`p-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'wallet' 
                ? 'border-[#0f7a4a] bg-green-50 text-[#0f7a4a]' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FaWallet size={18} />
            <span className="font-medium">UPI</span>
          </button>
        </div>
      </div>

      {/* Card Details Form */}
      {paymentMethod === 'card' && (
        <div className="mb-6 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Card Number (1234 5678 9012 3456)"
              value={cardDetails.number}
              onChange={(e) => handleCardInput('number', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f7a4a]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChange={(e) => handleCardInput('expiry', e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f7a4a]"
            />
            <input
              type="text"
              placeholder="CVV"
              value={cardDetails.cvv}
              onChange={(e) => handleCardInput('cvv', e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f7a4a]"
            />
          </div>
          <input
            type="text"
            placeholder="Cardholder Name"
            value={cardDetails.name}
            onChange={(e) => handleCardInput('name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f7a4a]"
          />
        </div>
      )}

      {/* UPI Details */}
      {paymentMethod === 'wallet' && (
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-blue-800 font-medium">Demo UPI Payment</p>
            <p className="text-blue-600 text-sm">No actual UPI required</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={processPayment}
          disabled={loading || !amount}
          className="w-full bg-[#0f7a4a] text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaCheckCircle />
              Pay ₹{amount || '0'}
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-yellow-800 text-sm font-medium">🔒 Demo Payment System</p>
          <p className="text-yellow-700 text-xs">No real money will be charged</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;